// POST /admin/excel: aplica el Excel semanal de farmacias que ya revisó administración en pantalla.
// La web lee el .xlsx, cruza cada fila con las farmacias que existen y manda solo lo confirmado:
//   cambios = [{slug, formacion, formacion_fecha, formacion_hora, formacion_nota, refs, lineal, telefono, distribuidor, rep?}]
//   (rep solo viene si el Excel la pasa a otro comercial)
//   nuevas  = [{slug, name, owner, address, postal, city, telefono, refs, lineal, rep, zona, distribuidor, formacion, formacion_fecha, formacion_hora, formacion_nota}]
// Cada fila se valida aquí otra vez; la que no cuadra se salta y vuelve en `errores`. El archivo queda guardado.
query "admin/excel" verb=POST {
  api_group = "suprafeel"
  auth = "user"

  input {
    text nombre filters=trim
    text archivo
    json? cambios?
    json? nuevas?
    json? resumen?
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    precondition (($input.nombre|strlen) >= 1 && ($input.nombre|strlen) <= 200) {
      error_type = "inputerror"
      error = "Falta el nombre del archivo"
    }

    precondition (($input.archivo|strlen) >= 100 && ($input.archivo|strlen) <= 8000000) {
      error_type = "inputerror"
      error = "El archivo está vacío o pasa de 6 MB"
    }

    var $cambios {
      value = $input.cambios ?? []
    }

    var $nuevas {
      value = $input.nuevas ?? []
    }

    var $n_cambios {
      value = $cambios|count
    }

    var $n_nuevas {
      value = $nuevas|count
    }

    var $n_total {
      value = $n_cambios + $n_nuevas
    }

    precondition ($n_total <= 2000) {
      error_type = "inputerror"
      error = "Demasiadas filas en un solo Excel"
    }

    var $estados {
      value = ["", "hecha", "prevista", "reprogramada", "pendiente", "cancelada", "rechazada"]
    }

    var $errores {
      value = []
    }

    var $aplicadas {
      value = 0
    }

    var $altas {
      value = 0
    }

    foreach ($cambios) {
      each as $c {
        var $slug {
          value = ($c|get:"slug":"")|to_text|trim|to_lower
        }

        var $formacion {
          value = ($c|get:"formacion":"")|to_text|trim|to_lower
        }

        var $fecha {
          value = ($c|get:"formacion_fecha":"")|to_text|trim
        }

        var $hora {
          value = ($c|get:"formacion_hora":"")|to_text|trim
        }

        db.get sf_farmacia {
          field_name = "slug"
          field_value = $slug
          output = ["id"]
        } as $existe

        conditional {
          if ($existe == null) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Esa farmacia no existe"}
            }
          }

          elseif (($estados|in:$formacion) == false) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Estado de formación desconocido"}
            }
          }

          elseif ($fecha != "" && ("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/"|regex_matches:$fecha) == false) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Fecha no válida"}
            }
          }

          elseif ($hora != "" && ("/^[0-9]{2}:[0-9]{2}$/"|regex_matches:$hora) == false) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Hora no válida"}
            }
          }

          else {
            db.edit sf_farmacia {
              field_name = "slug"
              field_value = $slug
              data = {
                formacion      : $formacion
                formacion_fecha: $fecha
                formacion_hora : $hora
                formacion_nota : ($c|get:"formacion_nota":"")|to_text|trim
                refs           : ($c|get:"refs":0)|to_int
                lineal         : $c|get:"lineal":[]
                telefono       : ($c|get:"telefono":"")|to_text|trim
                distribuidor   : ($c|get:"distribuidor":"")|to_text|trim
              }
            } as $editada

            var $rep_nuevo {
              value = ($c|get:"rep":"")|to_text|trim
            }

            conditional {
              if (($rep_nuevo|strlen) >= 2 && ($rep_nuevo|strlen) <= 80) {
                db.edit sf_farmacia {
                  field_name = "slug"
                  field_value = $slug
                  data = {rep: $rep_nuevo}
                } as $con_rep
              }
            }

            var.update $aplicadas {
              value = $aplicadas + 1
            }
          }
        }
      }
    }

    foreach ($nuevas) {
      each as $n {
        var $slug {
          value = ($n|get:"slug":"")|to_text|trim|to_lower
        }

        var $nombre {
          value = ($n|get:"name":"")|to_text|trim
        }

        var $rep {
          value = ($n|get:"rep":"")|to_text|trim
        }

        var $formacion {
          value = ($n|get:"formacion":"")|to_text|trim|to_lower
        }

        var $fecha {
          value = ($n|get:"formacion_fecha":"")|to_text|trim
        }

        var $hora {
          value = ($n|get:"formacion_hora":"")|to_text|trim
        }

        db.get sf_farmacia {
          field_name = "slug"
          field_value = $slug
          output = ["id"]
        } as $repetida

        conditional {
          if (("/^[a-z0-9-]{2,80}$/"|regex_matches:$slug) == false) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Identificador no válido"}
            }
          }

          elseif ($repetida != null) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Ya existe una farmacia con ese nombre"}
            }
          }

          elseif (($nombre|strlen) < 2 || ($rep|strlen) < 2) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Falta el nombre o el comercial"}
            }
          }

          elseif (($estados|in:$formacion) == false) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Estado de formación desconocido"}
            }
          }

          elseif ($fecha != "" && ("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/"|regex_matches:$fecha) == false) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Fecha no válida"}
            }
          }

          elseif ($hora != "" && ("/^[0-9]{2}:[0-9]{2}$/"|regex_matches:$hora) == false) {
            var.update $errores {
              value = $errores|push:{slug: $slug, error: "Hora no válida"}
            }
          }

          else {
            db.add sf_farmacia {
              data = {
                slug            : $slug
                code            : ($n|get:"code":"")|to_text|trim
                name            : $nombre
                nombre_comercial: ""
                owner           : ($n|get:"owner":"")|to_text|trim
                address         : ($n|get:"address":"")|to_text|trim
                postal          : ($n|get:"postal":"")|to_text|trim
                city            : ($n|get:"city":"")|to_text|trim
                telefono        : ($n|get:"telefono":"")|to_text|trim
                refs            : ($n|get:"refs":0)|to_int
                lineal          : $n|get:"lineal":[]
                distribuidor    : ($n|get:"distribuidor":"")|to_text|trim
                rep             : $rep
                zona            : ($n|get:"zona":"")|to_text|trim
                formacion       : $formacion
                formacion_fecha : $fecha
                formacion_hora  : $hora
                formacion_nota  : ($n|get:"formacion_nota":"")|to_text|trim
                codigo_cliente  : ""
              }
            } as $alta

            var.update $altas {
              value = $altas + 1
            }
          }
        }
      }
    }

    db.add sf_excel {
      data = {
        user   : $sesion.id
        nombre : $input.nombre
        archivo: $input.archivo
        resumen: {aplicadas: $aplicadas, nuevas: $altas, errores: $errores|count, revisado: $input.resumen ?? {}}
      }
    } as $guardado
  }

  response = {id: $guardado.id, aplicadas: $aplicadas, nuevas: $altas, errores: $errores}
}
