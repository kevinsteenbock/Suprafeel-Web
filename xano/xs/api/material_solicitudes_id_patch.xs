// PATCH /material/solicitudes/{solicitud_id}: solo admin. body { estado: pendiente | gestionada }.
query "material/solicitudes/{solicitud_id}" verb=PATCH {
  api_group = "suprafeel"
  auth = "user"

  input {
    int solicitud_id
    text? estado? filters=trim|lower
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    precondition (["pendiente", "gestionada"]|in:($input.estado ?? "")) {
      error_type = "inputerror"
      error = "El estado tiene que ser pendiente o gestionada"
    }

    db.get sf_solicitud_material {
      field_name = "id"
      field_value = $input.solicitud_id
      output = ["id"]
    } as $fila

    precondition ($fila != null) {
      error_type = "notfound"
      error = "Esa solicitud no existe"
    }

    db.edit sf_solicitud_material {
      field_name = "id"
      field_value = $input.solicitud_id
      data = {estado: $input.estado}
    } as $editada
  }

  response = {id: $input.solicitud_id, estado: $input.estado}
}
