// La cuenta de la sesión (sin contraseña). Con un token caducado o anterior al cambio de sesiones, 401.
query "auth/me" verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion
  }

  response = $sesion
}
