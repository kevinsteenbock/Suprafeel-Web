// GET /mensajes: admin ve todos; una farmacia, los de su farmacia con la respuesta; el resto, ninguno.
query mensajes verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    var $filas {
      value = []
    }

    conditional {
      if ($sesion.role == "admin") {
        db.query sf_mensaje {
          sort = {created_at: "desc"}
          return = {type: "list"}
        } as $todos

        var.update $filas {
          value = $todos
        }
      }

      elseif ($sesion.role == "farmacia" && ($sesion.pharmacy_slug ?? "") != "") {
        db.query sf_mensaje {
          where = $db.sf_mensaje.farmacia_slug == $sesion.pharmacy_slug
          sort = {created_at: "desc"}
          output = ["id", "created_at", "tipo", "texto", "fecha_preferida", "hora_preferida", "estado", "respuesta", "respondido_at"]
          return = {type: "list"}
        } as $suyos

        var.update $filas {
          value = $suyos
        }
      }
    }
  }

  response = $filas
}
