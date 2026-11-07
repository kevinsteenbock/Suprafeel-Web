// GET /contenido: fichas, recomendador, campañas y documentos (sin rutas de archivo). Pide sesión de cualquier rol.
// Las imágenes que se ven nada más entrar (carteles y portadas) van firmadas por 24 horas.
query contenido verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    db.query sf_contenido {
      output = ["clave", "valor"]
      return = {type: "list"}
    } as $filas

    var $salida {
      value = {fichas: {}, recomendador: null, campanas: [], documentos: []}
    }

    var $rutas {
      value = {}
    }

    foreach ($filas) {
      each as $fila {
        conditional {
          if ($fila.clave == "fichas") {
            var.update $salida {
              value = $salida|set:"fichas":$fila.valor
            }
          }

          elseif ($fila.clave == "recomendador") {
            var.update $salida {
              value = $salida|set:"recomendador":$fila.valor
            }
          }

          elseif ($fila.clave == "campanas") {
            var.update $salida {
              value = $salida|set:"campanas":$fila.valor
            }
          }

          elseif ($fila.clave == "documentos") {
            var.update $rutas {
              value = $fila.valor
            }
          }
        }
      }
    }

    // Documentos: título, tipo, páginas y, si la tiene, portada firmada. Sin rutas.
    var $documentos {
      value = []
    }

    foreach (($rutas|keys)) {
      each as $slug {
        var $doc {
          value = $rutas|get:$slug:null
        }

        var $portada {
          value = ""
        }

        conditional {
          if (($doc|get:"con_portada":false) == true) {
            storage.sign_private_url {
              pathname = $doc.paginas|first
              ttl = 86400
            } as $firmada

            var.update $portada {
              value = $firmada
            }
          }
        }

        var.update $documentos {
          value = $documentos|push:{slug: $slug, titulo: $doc.titulo, tipo: $doc.tipo, paginas: ($doc.paginas|count), portada: $portada}
        }
      }
    }

    var.update $salida {
      value = $salida|set:"documentos":$documentos
    }
  }

  response = $salida
}
