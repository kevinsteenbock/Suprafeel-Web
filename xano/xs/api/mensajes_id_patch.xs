// PATCH /mensajes/{mensaje_id}: solo admin. body { respuesta?, estado?: pendiente | atendido }.
// Con respuesta, el mensaje queda atendido salvo que se diga otro estado.
query "mensajes/{mensaje_id}" verb=PATCH {
  api_group = "suprafeel"
  auth = "user"

  input {
    int mensaje_id
    text? respuesta? filters=trim
    text? estado? filters=trim|lower
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    db.get sf_mensaje {
      field_name = "id"
      field_value = $input.mensaje_id
      output = ["id", "respuesta", "respondido_at", "estado"]
    } as $fila

    precondition ($fila != null) {
      error_type = "notfound"
      error = "Ese mensaje no existe"
    }

    var $hay_respuesta {
      value = ($input.respuesta ?? "") != ""
    }

    var $estado {
      value = $input.estado ?? ($hay_respuesta ? "atendido" : $fila.estado)
    }

    precondition (["pendiente", "atendido"]|in:$estado) {
      error_type = "inputerror"
      error = "El estado tiene que ser pendiente o atendido"
    }

    precondition ("/^.{0,4000}$/us"|regex_matches:($input.respuesta ?? "")) {
      error_type = "inputerror"
      error = "La respuesta es demasiado larga: como máximo 4.000 caracteres"
    }

    db.edit sf_mensaje {
      field_name = "id"
      field_value = $input.mensaje_id
      data = {
        estado       : $estado
        respuesta    : $hay_respuesta ? $input.respuesta : $fila.respuesta
        respondido_at: $hay_respuesta ? now : $fila.respondido_at
      }
    } as $editado
  }

  response = {id: $input.mensaje_id, estado: $estado}
}
