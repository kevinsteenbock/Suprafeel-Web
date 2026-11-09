// GET /admin/excel/{excel_id}: un Excel subido, con el archivo en base64 para descargarlo. Solo admin.
query "admin/excel/{excel_id}" verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
    int excel_id
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    db.get sf_excel {
      field_name = "id"
      field_value = $input.excel_id
    } as $fila

    precondition ($fila != null) {
      error_type = "notfound"
      error = "Ese Excel no existe"
    }
  }

  response = {id: $fila.id, nombre: $fila.nombre, archivo: $fila.archivo}
}
