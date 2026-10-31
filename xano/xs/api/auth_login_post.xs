// Entrada con correo y contraseña. Es el único endpoint público del grupo.
// Freno: 5 intentos fallidos por correo e IP; el sexto, y los siguientes durante 15 minutos, dan 429.
// El token dura 7 días y lleva «emitido» (ahora) en extras: sf_sesion rechaza los que no lo traen
// y los emitidos antes del sesion_desde de la cuenta.
query "auth/login" verb=POST {
  api_group = "suprafeel"

  input {
    email email filters=trim|lower
    text password {
      sensitive = true
    }
  }

  stack {
    var $clave {
      value = "sf_login:" ~ ($input.email|md5) ~ ":" ~ $env.$remote_ip
    }

    var $hace_15_min {
      value = now|add_secs_to_timestamp:-900
    }

    var $hace_1_dia {
      value = now|add_secs_to_timestamp:-86400
    }

    db.query sf_login_intento {
      where = $db.sf_login_intento.clave == $clave && $db.sf_login_intento.created_at > $hace_15_min
      return = {type: "count"}
    } as $n_fallos

    precondition ($n_fallos < 5) {
      error_type = "toomanyrequests"
      error = "Demasiados intentos. Espera unos minutos y vuelve a probar"
    }

    db.query user {
      where = $db.user.email == $input.email
      return = {type: "single"}
    } as $user

    var $valida {
      value = false
    }

    conditional {
      if ($user != null) {
        security.check_password {
          text_password = $input.password
          hash_password = $user.password
        } as $coincide

        var.update $valida {
          value = $coincide
        }
      }
    }

    conditional {
      if (!$valida) {
        db.add sf_login_intento {
          data = {clave: $clave}
        } as $intento

        db.bulk.delete sf_login_intento {
          where = $db.sf_login_intento.created_at < $hace_1_dia
        } as $viejos
      }
    }

    precondition ($valida) {
      error_type = "accessdenied"
      error = "El correo o la contraseña no son correctos"
    }

    db.bulk.delete sf_login_intento {
      where = $db.sf_login_intento.clave == $clave
    } as $borrados

    var $ahora {
      value = now
    }

    security.create_auth_token {
      table = "user"
      extras = {role: $user.role, emitido: $ahora}
      expiration = 604800
      id = $user.id
    } as $token
  }

  response = {authToken: $token, user: $user|unset:"password"|unset:"sesion_desde"}
}
