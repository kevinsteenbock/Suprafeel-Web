// GET /argumentarios: argumentarios de venta. Solo comercial y admin: una farmacia recibe 403 y sin sesión, 401.
// El contenido vive en sf_contenido, nunca en el repositorio ni en GET /contenido.
query argumentarios verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition (["comercial", "admin"]|in:$sesion.role) {
      error_type = "accessdenied"
      error = "Esta zona es solo para comerciales"
    }

    db.get sf_contenido {
      field_name = "clave"
      field_value = "argumentarios"
      output = ["valor"]
    } as $fila
  }

  response = ($fila ?? {})|get:"valor":{}
}
