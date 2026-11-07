// GET /admin/ajustes: teléfono, correo de avisos, enlace del calendario y zona de la semana. Solo admin.
query "admin/ajustes" verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    db.get sf_contenido {
      field_name = "clave"
      field_value = "ajustes"
      output = ["valor"]
    } as $fila
  }

  response = $fila.valor ?? {}
}
