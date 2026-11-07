// GET /material/solicitudes: admin ve todas, con la foto firmada 1 hora; farmacia y comercial, solo las que hizo su cuenta.
query "material/solicitudes" verb=GET {
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
        db.query sf_solicitud_material {
          sort = {created_at: "desc"}
          return = {type: "list"}
        } as $todas

        var.update $filas {
          value = $todas
        }
      }

      else {
        db.query sf_solicitud_material {
          where = $db.sf_solicitud_material.user == $sesion.id
          sort = {created_at: "desc"}
          return = {type: "list"}
        } as $mias

        var.update $filas {
          value = $mias
        }
      }
    }

    var $salida {
      value = []
    }

    foreach ($filas) {
      each as $f {
        var $foto {
          value = ""
        }

        conditional {
          if ($sesion.role == "admin" && ($f.foto_ruta ?? "") != "") {
            storage.sign_private_url {
              pathname = $f.foto_ruta
              ttl = 3600
            } as $firmada

            var.update $foto {
              value = $firmada
            }
          }
        }

        var.update $salida {
          value = $salida|push:($f|unset:"foto_ruta"|set:"foto":$foto)
        }
      }
    }
  }

  response = $salida
}
