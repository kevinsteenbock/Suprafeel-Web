// GET /contacto: teléfono de la administradora y si esta farmacia puede agendar formación esta semana.
// El enlace del calendario solo se entrega a las farmacias de la zona de la semana.
query contacto verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    db.get sf_contenido {
      field_name = "clave"
      field_value = "ajustes"
      output = ["valor"]
    } as $fila

    var $ajustes {
      value = $fila.valor ?? {}
    }

    var $puede {
      value = false
    }

    conditional {
      if ($sesion.role == "farmacia" && ($sesion.pharmacy_slug ?? "") != "") {
        db.get sf_farmacia {
          field_name = "slug"
          field_value = $sesion.pharmacy_slug
          output = ["postal", "zona"]
        } as $farmacia

        function.run sf_zona_abierta {
          input = {postal: $farmacia.postal, zona: $farmacia.zona, ajustes: $ajustes}
        } as $abierta

        var.update $puede {
          value = $abierta
        }
      }
    }
  }

  response = {telefono: $ajustes|get:"telefono":"", zona: $ajustes|get:"zona_etiqueta":"", puede_agendar: $puede, enlace_calendario: $puede ? ($ajustes|get:"enlace_calendario":"") : ""}
}
