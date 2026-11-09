// Farmacias según la sesión: admin ve todas, un comercial las de su rep_name (con rep_name «*», todas: p. ej. el distribuidor) y una farmacia solo la suya (pharmacy_slug),
// sin notas internas ni distribuidor, y con la formación solo si está hecha o programada.
// Sin token, o con uno caducado o anterior al cambio de sesiones, 401 (sf_sesion). Una cuenta sin rol válido, 403.
query farmacias verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition (["admin", "comercial", "farmacia"]|in:$sesion.role) {
      error_type = "accessdenied"
      error = "Tu cuenta no tiene acceso a las farmacias"
    }

    var $rep {
      value = $sesion.rep_name ?? ""
    }

    var $slug {
      value = $sesion.pharmacy_slug ?? ""
    }

    var $filas {
      value = []
    }

    conditional {
      if ($sesion.role == "admin") {
        db.query sf_farmacia {
          sort = {id: "asc"}
          output = ["id", "slug", "code", "name", "nombre_comercial", "city", "owner", "address", "postal", "rep", "zona", "refs", "lineal", "formacion", "formacion_fecha", "formacion_hora", "formacion_nota", "telefono", "codigo_cliente", "distribuidor"]
          return = {type: "list"}
        } as $todas

        var.update $filas {
          value = $todas
        }
      }

      elseif ($sesion.role == "comercial" && $rep == "*") {
        db.query sf_farmacia {
          sort = {id: "asc"}
          output = ["id", "slug", "code", "name", "nombre_comercial", "city", "owner", "address", "postal", "rep", "zona", "refs", "lineal", "formacion", "formacion_fecha", "formacion_hora", "formacion_nota", "telefono", "codigo_cliente", "distribuidor"]
          return = {type: "list"}
        } as $todas_comercial

        var.update $filas {
          value = $todas_comercial
        }
      }

      elseif ($sesion.role == "comercial" && $rep != "") {
        db.query sf_farmacia {
          where = $db.sf_farmacia.rep == $rep
          sort = {id: "asc"}
          output = ["id", "slug", "code", "name", "nombre_comercial", "city", "owner", "address", "postal", "rep", "zona", "refs", "lineal", "formacion", "formacion_fecha", "formacion_hora", "formacion_nota", "telefono", "codigo_cliente", "distribuidor"]
          return = {type: "list"}
        } as $suyas

        var.update $filas {
          value = $suyas
        }
      }

      elseif ($sesion.role == "farmacia" && $slug != "") {
        db.query sf_farmacia {
          where = $db.sf_farmacia.slug == $slug
          output = ["id", "slug", "code", "name", "nombre_comercial", "city", "owner", "address", "postal", "rep", "zona", "refs", "lineal", "formacion", "formacion_fecha", "formacion_hora", "telefono", "codigo_cliente"]
          return = {type: "list"}
        } as $la_suya

        // La farmacia solo ve sus formaciones hechas o programadas, nunca las notas internas ni el distribuidor.
        foreach ($la_suya) {
          each as $fila {
            var $visible {
              value = ["hecha", "prevista", "reprogramada"]|in:($fila.formacion ?? "")
            }

            var $limpia {
              value = $visible ? $fila : ($fila|set:"formacion":""|set:"formacion_fecha":""|set:"formacion_hora":"")
            }

            var.update $filas {
              value = $filas|push:$limpia
            }
          }
        }
      }
    }
  }

  response = $filas
}
