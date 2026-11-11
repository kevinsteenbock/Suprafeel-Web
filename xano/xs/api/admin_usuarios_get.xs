// Cuentas de Suprafeel Soft, solo para admin (si no, 403). Nunca devuelve la contraseña.
query "admin/usuarios" verb=GET {
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

    db.query user {
      sort = {id: "asc"}
      output = ["id", "name", "email", "role", "pharmacy_slug", "rep_name", "zona", "created_at"]
      return = {type: "list"}
    } as $usuarios
  }

  response = $usuarios
}
