// PATCH /consejo/{consulta_id}/valoracion: el dueño de la consulta la valora.
// body { valoracion: -1 | 0 | 1, comentario?: text (hasta 1.000 caracteres; sin mandarlo, se queda el que había) }.
// Devuelve { consulta_id, valoracion, comentario }. 400 si la valoración no es -1, 0 o 1; 404 si no existe; 403 si no es tuya.
query "consejo/{consulta_id}/valoracion" verb=PATCH {
  api_group = "suprafeel"
  auth = "user"

  input {
    int consulta_id
    int? valoracion?
    text? comentario? filters=trim
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition (!($input.valoracion|is_null) && ([-1, 0, 1]|in:$input.valoracion)) {
      error_type = "inputerror"
      error = "La valoración tiene que ser -1, 0 o 1"
    }

    var $comentario_cabe {
      value = ($input.comentario|is_null) || ("/^.{0,1000}$/us"|regex_matches:$input.comentario)
    }

    precondition ($comentario_cabe) {
      error_type = "inputerror"
      error = "El comentario es demasiado largo: como máximo 1.000 caracteres"
    }

    db.get sf_consulta {
      field_name = "id"
      field_value = $input.consulta_id
      output = ["id", "user", "comentario"]
    } as $consulta

    precondition ($consulta != null) {
      error_type = "notfound"
      error = "Esa consulta no existe"
    }

    precondition ($consulta.user == $sesion.id) {
      error_type = "accessdenied"
      error = "Solo quien hizo la consulta puede valorarla"
    }

    var $comentario {
      value = ($input.comentario|is_null) ? $consulta.comentario : $input.comentario
    }

    db.edit sf_consulta {
      field_name = "id"
      field_value = $consulta.id
      data = {valoracion: $input.valoracion, comentario: $comentario}
    } as $editada
  }

  response = {consulta_id: $consulta.id, valoracion: $input.valoracion, comentario: $comentario}
}
