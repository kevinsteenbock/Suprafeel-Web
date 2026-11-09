// POST /material/solicitudes (multipart): una farmacia o un comercial pide material.
// La farmacia sale de la sesión; un comercial solo puede pedir para las suyas. Vinilo a medida: pide medidas y sitio.
// Máximo 20 solicitudes por cuenta y hora. Si hay RESEND_API_KEY en Xano, avisa a info@suprafeel.es y confirma a la
// cuenta; si el correo falla, la solicitud queda guardada igual (correo = error).
query "material/solicitudes" verb=POST {
  api_group = "suprafeel"
  auth = "user"

  input {
    text? farmacia_slug? filters=trim|lower
    text? contacto? filters=trim
    text? direccion? filters=trim
    text? material? filters=trim|lower
    int? unidades?
    decimal? ancho_cm?
    decimal? alto_cm?
    text? ubicacion? filters=trim
    file? foto?
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition (["farmacia", "comercial"]|in:$sesion.role) {
      error_type = "accessdenied"
      error = "Las solicitudes las hacen las farmacias y los comerciales"
    }

    var $hace_1_hora {
      value = now|add_secs_to_timestamp:-3600
    }

    db.query sf_solicitud_material {
      where = $db.sf_solicitud_material.user == $sesion.id && $db.sf_solicitud_material.created_at > $hace_1_hora
      return = {type: "count"}
    } as $recientes

    precondition ($recientes < 20) {
      error_type = "toomanyrequests"
      error = "Demasiadas solicitudes seguidas. Espera un rato y vuelve a probar"
    }

    var $slug {
      value = ($sesion.role == "farmacia") ? ($sesion.pharmacy_slug ?? "") : ($input.farmacia_slug ?? "")
    }

    precondition ($slug != "") {
      error_type = "inputerror"
      error = "Elige la farmacia"
    }

    db.get sf_farmacia {
      field_name = "slug"
      field_value = $slug
      output = ["slug", "name", "rep"]
    } as $farmacia

    precondition ($farmacia != null) {
      error_type = "inputerror"
      error = "Esa farmacia no existe"
    }

    precondition ($sesion.role == "farmacia" || $farmacia.rep == ($sesion.rep_name ?? "") || ($sesion.rep_name ?? "") == "*") {
      error_type = "accessdenied"
      error = "Esa farmacia no es tuya"
    }

    var $material {
      value = $input.material ?? ""
    }

    precondition (["vinilo-medida", "lineal", "expositor", "catalogo-impreso", "infografia"]|in:$material) {
      error_type = "inputerror"
      error = "Elige un material de la lista"
    }

    var $unidades {
      value = $input.unidades ?? 0
    }

    precondition ($unidades >= 1 && $unidades <= 999) {
      error_type = "inputerror"
      error = "Las unidades tienen que estar entre 1 y 999"
    }

    var $contacto {
      value = $input.contacto ?? ""
    }

    var $direccion {
      value = $input.direccion ?? ""
    }

    var $ubicacion {
      value = $input.ubicacion ?? ""
    }

    precondition (("/^.{2,120}$/us"|regex_matches:$contacto)) {
      error_type = "inputerror"
      error = "Escribe la persona de contacto"
    }

    precondition (("/^.{5,300}$/us"|regex_matches:$direccion)) {
      error_type = "inputerror"
      error = "Escribe la dirección de entrega"
    }

    var $es_vinilo {
      value = $material == "vinilo-medida"
    }

    var $ancho {
      value = $input.ancho_cm ?? 0
    }

    var $alto {
      value = $input.alto_cm ?? 0
    }

    precondition (!$es_vinilo || ($ancho >= 1 && $ancho <= 2000 && $alto >= 1 && $alto <= 2000)) {
      error_type = "inputerror"
      error = "Escribe el ancho y el alto en centímetros"
    }

    precondition (!$es_vinilo || ("/^.{2,300}$/us"|regex_matches:$ubicacion)) {
      error_type = "inputerror"
      error = "Di dónde se colocará el vinilo"
    }

    var $foto_ruta {
      value = ""
    }

    conditional {
      if ($es_vinilo && $input.foto != null) {
        storage.create_image {
          value = $input.foto
          access = "public"
          filename = "espacio.jpg"
        } as $foto

        var.update $foto_ruta {
          value = $foto.path
        }
      }
    }

    db.add sf_solicitud_material {
      data = {
        user           : $sesion.id
        farmacia_slug  : $slug
        farmacia_nombre: $farmacia.name
        contacto       : $contacto
        direccion      : $direccion
        material       : $material
        unidades       : $unidades
        ancho_cm       : $es_vinilo ? $ancho : null
        alto_cm        : $es_vinilo ? $alto : null
        ubicacion      : $es_vinilo ? $ubicacion : ""
        foto_ruta      : $foto_ruta
      }
    } as $solicitud

    var $clave {
      value = ($env.RESEND_API_KEY ?? "")|trim
    }

    var $correo {
      value = "sin_configurar"
    }

    conditional {
      if ($clave != "") {
        var $medidas {
          value = $es_vinilo ? ("\nMedidas: " ~ $ancho ~ " x " ~ $alto ~ " cm\nDónde: " ~ $ubicacion ~ (($foto_ruta != "") ? "\nCon foto del espacio: se ve en la consola" : "")) : ""
        }

        var $detalle {
          value = "Farmacia: " ~ $farmacia.name ~ "\nContacto: " ~ $contacto ~ "\nDirección: " ~ $direccion ~ "\nMaterial: " ~ $material ~ "\nUnidades: " ~ $unidades ~ $medidas
        }

        try_catch {
          try {
            api.request {
              url = "https://api.resend.com/emails"
              method = "POST"
              params = {from: "Suprafeel <solicitudes@suprafeel-profesional.com>", to: ["info@suprafeel.es"], reply_to: $sesion.email, subject: "Solicitud de material: " ~ $farmacia.name, text: $detalle}
              headers = ["content-type: application/json", "authorization: Bearer " ~ $clave]
              timeout = 15
            } as $aviso

            api.request {
              url = "https://api.resend.com/emails"
              method = "POST"
              params = {from: "Suprafeel <solicitudes@suprafeel-profesional.com>", to: [$sesion.email], subject: "Hemos recibido tu solicitud de material", text: "Hemos recibido tu solicitud. El equipo de Suprafeel la preparará y te contactará si hace falta algo más.\n\n" ~ $detalle}
              headers = ["content-type: application/json", "authorization: Bearer " ~ $clave]
              timeout = 15
            } as $confirmacion

            var.update $correo {
              value = ($aviso.response.status < 300 && $confirmacion.response.status < 300) ? "enviado" : "error"
            }
          }

          catch {
            var.update $correo {
              value = "error"
            }
          }
        }

        db.edit sf_solicitud_material {
          field_name = "id"
          field_value = $solicitud.id
          data = {correo: $correo}
        } as $editada
      }
    }
  }

  response = {id: $solicitud.id, correo: $correo}
}
