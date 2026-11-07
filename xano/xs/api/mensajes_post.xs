// POST /mensajes: la farmacia escribe, pregunta o pide formación. La farmacia sale de la sesión.
// tipo formacion: solo si su farmacia está en la zona de la semana. Máximo 20 por cuenta y hora.
// Si hay RESEND_API_KEY y correo de avisos en ajustes, avisa por correo; si falla, el mensaje queda guardado igual.
query mensajes verb=POST {
  api_group = "suprafeel"
  auth = "user"

  input {
    text? tipo? filters=trim|lower
    text? texto? filters=trim
    text? fecha_preferida? filters=trim
    text? hora_preferida? filters=trim
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition ($sesion.role == "farmacia" && ($sesion.pharmacy_slug ?? "") != "") {
      error_type = "accessdenied"
      error = "Esto es solo para las cuentas de farmacia"
    }

    var $tipo {
      value = $input.tipo ?? ""
    }

    precondition (["escribir", "formacion", "duda"]|in:$tipo) {
      error_type = "inputerror"
      error = "No sabemos qué tipo de mensaje es"
    }

    var $texto {
      value = $input.texto ?? ""
    }

    var $fecha {
      value = $input.fecha_preferida ?? ""
    }

    var $hora {
      value = $input.hora_preferida ?? ""
    }

    var $hace_1_hora {
      value = now|add_secs_to_timestamp:-3600
    }

    db.query sf_mensaje {
      where = $db.sf_mensaje.user == $sesion.id && $db.sf_mensaje.created_at > $hace_1_hora
      return = {type: "count"}
    } as $recientes

    precondition ($recientes < 20) {
      error_type = "toomanyrequests"
      error = "Demasiados mensajes seguidos. Espera un rato y vuelve a probar"
    }

    db.get sf_farmacia {
      field_name = "slug"
      field_value = $sesion.pharmacy_slug
      output = ["slug", "name", "postal", "zona"]
    } as $farmacia

    precondition ($farmacia != null) {
      error_type = "inputerror"
      error = "Tu cuenta no tiene farmacia: escribe a info@suprafeel.es"
    }

    db.get sf_contenido {
      field_name = "clave"
      field_value = "ajustes"
      output = ["valor"]
    } as $fila_ajustes

    var $ajustes {
      value = $fila_ajustes.valor ?? {}
    }

    conditional {
      if ($tipo == "formacion") {
        function.run sf_zona_abierta {
          input = {postal: $farmacia.postal, zona: $farmacia.zona, ajustes: $ajustes}
        } as $abierta

        precondition ($abierta) {
          error_type = "accessdenied"
          error = "Esta semana no se agenda en tu zona: escribe o llama para coordinarlo"
        }

        precondition ("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/"|regex_matches:$fecha) {
          error_type = "inputerror"
          error = "Elige el día que prefieres"
        }

        precondition ("/^[0-9]{2}:[0-9]{2}$/"|regex_matches:$hora) {
          error_type = "inputerror"
          error = "Elige la hora que prefieres"
        }
      }

      else {
        precondition ("/^.{2,2000}$/us"|regex_matches:$texto) {
          error_type = "inputerror"
          error = "Escribe tu mensaje (hasta 2.000 caracteres)"
        }
      }
    }

    db.add sf_mensaje {
      data = {
        user           : $sesion.id
        tipo           : $tipo
        farmacia_slug  : $farmacia.slug
        farmacia_nombre: $farmacia.name
        autor          : $sesion.name
        texto          : $texto
        fecha_preferida: ($tipo == "formacion") ? $fecha : ""
        hora_preferida : ($tipo == "formacion") ? $hora : ""
      }
    } as $mensaje

    var $clave {
      value = ($env.RESEND_API_KEY ?? "")|trim
    }

    var $destino {
      value = ($ajustes|get:"correo_avisos":"")|trim
    }

    var $correo {
      value = "sin_configurar"
    }

    conditional {
      if ($clave != "" && $destino != "") {
        var $cuando {
          value = ($tipo == "formacion") ? ("\nPrefiere: " ~ $fecha ~ " a las " ~ $hora) : ""
        }

        try_catch {
          try {
            api.request {
              url = "https://api.resend.com/emails"
              method = "POST"
              params = {from: "Suprafeel <solicitudes@suprafeel-profesional.com>", to: [$destino], reply_to: $sesion.email, subject: "Suprafeel Soft (" ~ $tipo ~ "): " ~ $farmacia.name, text: "Farmacia: " ~ $farmacia.name ~ "\nDe: " ~ $sesion.name ~ $cuando ~ "\n\n" ~ $texto}
              headers = ["content-type: application/json", "authorization: Bearer " ~ $clave]
              timeout = 15
            } as $aviso

            var.update $correo {
              value = ($aviso.response.status < 300) ? "enviado" : "error"
            }
          }

          catch {
            var.update $correo {
              value = "error"
            }
          }
        }

        db.edit sf_mensaje {
          field_name = "id"
          field_value = $mensaje.id
          data = {correo: $correo}
        } as $editado
      }
    }
  }

  response = {id: $mensaje.id, correo: $correo}
}
