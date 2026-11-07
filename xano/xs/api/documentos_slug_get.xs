// GET /documentos/{slug}: un documento con sus páginas y su PDF, en enlaces firmados que caducan en 1 hora. Pide sesión.
query "documentos/{slug}" verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
    text slug filters=trim|lower
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    db.get sf_contenido {
      field_name = "clave"
      field_value = "documentos"
      output = ["valor"]
    } as $fila

    var $doc {
      value = (($fila ?? {})|get:"valor":{})|get:$input.slug:null
    }

    precondition ($doc != null) {
      error_type = "notfound"
      error = "Ese documento no existe"
    }

    var $paginas {
      value = []
    }

    foreach ($doc.paginas) {
      each as $ruta {
        storage.sign_private_url {
          pathname = $ruta
          ttl = 3600
        } as $firmada

        var.update $paginas {
          value = $paginas|push:$firmada
        }
      }
    }

    var $pdf {
      value = ""
    }

    conditional {
      if (($doc|get:"pdf":"") != "") {
        storage.sign_private_url {
          pathname = $doc.pdf
          ttl = 3600
        } as $pdf_firmado

        var.update $pdf {
          value = $pdf_firmado
        }
      }
    }
  }

  response = {slug: $input.slug, titulo: $doc.titulo, tipo: $doc.tipo, paginas: $paginas, pdf: $pdf}
}
