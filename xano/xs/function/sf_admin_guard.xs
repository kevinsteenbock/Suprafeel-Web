// Guardia de admin de Suprafeel Soft: la sesión tiene que ser de un usuario con role = admin.
// Se llama al principio de cada endpoint que escribe o que solo puede ver admin. Devuelve el usuario sin contraseña.
function sf_admin_guard {
  input {
    int? user_id
  }

  stack {
    precondition ($input.user_id != null) {
      error_type = "unauthorized"
      error = "Inicia sesión para continuar"
    }

    db.get user {
      field_name = "id"
      field_value = $input.user_id
      output = ["id", "name", "email", "role", "pharmacy_slug", "rep_name"]
    } as $user

    precondition ($user != null && $user.role == "admin") {
      error_type = "accessdenied"
      error = "Solo los administradores pueden hacer esto"
    }
  }

  response = $user
}
