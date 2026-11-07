// PATCH /admin/ajustes: guarda los ajustes de la administradora. Solo admin.
// provincias = dos primeras cifras del código postal de las provincias de la zona de la semana.
query "admin/ajustes" verb=PATCH {
  api_group = "suprafeel"
  auth = "user"

  input {
    text? telefono? filters=trim
    text? correo_avisos? filters=trim|lower
    text? enlace_calendario? filters=trim
    text? zona_etiqueta? filters=trim
    text[]? provincias?
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    var $correo {
      value = $input.correo_avisos ?? ""
    }

    var $enlace {
      value = $input.enlace_calendario ?? ""
    }

    precondition ($correo == "" || ("/^[^ @]+@[^ @]+[.][^ @]+$/"|regex_matches:$correo)) {
      error_type = "inputerror"
      error = "Escribe un correo válido"
    }

    precondition ($enlace == "" || ("/^https:[/][/]/"|regex_matches:$enlace)) {
      error_type = "inputerror"
      error = "El enlace del calendario tiene que empezar por https://"
    }

    var $valor {
      value = {telefono: $input.telefono ?? "", correo_avisos: $correo, enlace_calendario: $enlace, zona_etiqueta: $input.zona_etiqueta ?? "", provincias: $input.provincias ?? []}
    }

    db.get sf_contenido {
      field_name = "clave"
      field_value = "ajustes"
      output = ["id"]
    } as $fila

    conditional {
      if ($fila == null) {
        db.add sf_contenido {
          data = {clave: "ajustes", valor: $valor}
        } as $nueva
      }

      else {
        db.edit sf_contenido {
          field_name = "clave"
          field_value = "ajustes"
          data = {valor: $valor}
        } as $editada
      }
    }
  }

  response = $valor
}
