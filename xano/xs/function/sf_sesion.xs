// Sesión de Suprafeel Soft: el token tiene que ser de un usuario que existe y haberse emitido después de
// su sesion_desde. Los tokens anteriores al 31 oct 2026 (sin «emitido» en extras) ya no valen.
// La llama al empezar cada endpoint con auth = "user": input = {user_id: $auth.id, extras: $auth.extras}.
// ($auth.extras.emitido directo da error 500 con los tokens viejos, que no lo traen: por eso se pasa extras entero.)
// Para cerrar todas las sesiones de una cuenta, basta con poner su sesion_desde a ahora.
function sf_sesion {
  input {
    int? user_id
    json? extras
  }

  stack {
    var $emitido {
      value = ($input.extras ?? {})|get:"emitido":null
    }

    precondition ($input.user_id != null && $emitido != null && (($emitido|is_int) || ($emitido|is_decimal))) {
      error_type = "unauthorized"
      error = "Tu sesión ha caducado. Vuelve a entrar"
    }

    db.get user {
      field_name = "id"
      field_value = $input.user_id
      output = ["id", "created_at", "name", "email", "role", "pharmacy_slug", "rep_name", "sesion_desde"]
    } as $user

    precondition ($user != null) {
      error_type = "unauthorized"
      error = "Tu sesión ha caducado. Vuelve a entrar"
    }

    precondition ($user.sesion_desde == null || ($emitido|to_int) >= $user.sesion_desde) {
      error_type = "unauthorized"
      error = "Tu sesión ha caducado. Vuelve a entrar"
    }
  }

  response = $user|unset:"sesion_desde"
}
