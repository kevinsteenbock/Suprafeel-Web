// GET /admin/excel: los Excels subidos, del más nuevo al más viejo, sin el archivo. Solo admin.
query "admin/excel" verb=GET {
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

    db.query sf_excel {
      sort = {created_at: "desc"}
      output = ["id", "created_at", "nombre", "resumen", "user"]
      return = {type: "list"}
    } as $lista
  }

  response = $lista
}
