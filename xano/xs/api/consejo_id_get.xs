// GET /consejo/{consulta_id}: una consulta del consejo con Claude, en forma legible. La ve su dueño; admin, cualquiera.
// Devuelve { id, created_at, updated_at, turnos, valoracion, comentario, productos, derivo, ultima,
// historial: [{ pregunta, respuesta, fecha }] } y, para admin, también rol, prompt_version, modelo_servido y coste_usd.
// Nunca devuelve los mensajes en bruto (ni thinking ni system) ni quién la escribió. 404 si no existe, 403 si no es tuya.
query "consejo/{consulta_id}" verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
    int consulta_id
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition (["admin", "comercial", "farmacia"]|in:$sesion.role) {
      error_type = "accessdenied"
      error = "Tu cuenta no tiene acceso al consejo"
    }

    db.get sf_consulta {
      field_name = "id"
      field_value = $input.consulta_id
      output = ["id", "created_at", "updated_at", "user", "rol", "prompt_version", "turnos", "valoracion", "comentario", "productos", "derivo", "ultima", "historial", "coste_usd", "modelo_servido"]
    } as $consulta

    precondition ($consulta != null) {
      error_type = "notfound"
      error = "Esa consulta no existe"
    }

    precondition ($consulta.user == $sesion.id || $sesion.role == "admin") {
      error_type = "accessdenied"
      error = "Esa consulta no es tuya"
    }

    var $vista {
      value = {
        id        : $consulta.id
        created_at: $consulta.created_at
        updated_at: $consulta.updated_at
        turnos    : $consulta.turnos ?? 0
        valoracion: $consulta.valoracion ?? 0
        comentario: $consulta.comentario
        productos : $consulta.productos ?? []
        derivo    : $consulta.derivo ?? false
        ultima    : $consulta.ultima
        historial : $consulta.historial ?? []
      }
    }

    conditional {
      if ($sesion.role == "admin") {
        var.update $vista {
          value = $vista|set:"rol":$consulta.rol
        }

        var.update $vista {
          value = $vista|set:"prompt_version":$consulta.prompt_version
        }

        var.update $vista {
          value = $vista|set:"modelo_servido":$consulta.modelo_servido
        }

        var.update $vista {
          value = $vista|set:"coste_usd":$consulta.coste_usd
        }
      }
    }
  }

  response = $vista
}
