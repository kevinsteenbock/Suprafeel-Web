// ¿Puede esta farmacia agendar formación esta semana? Sí si su provincia (dos primeras cifras del código postal; sin
// código postal, el texto de su zona) está en las de la zona de la semana (sf_contenido, clave «ajustes», campo provincias).
function sf_zona_abierta {
  input {
    text? postal
    text? zona
    json? ajustes
  }

  stack {
    var $postal {
      value = ($input.postal ?? "")|trim
    }

    var $provincia {
      value = ($postal != "") ? ($postal|substr:0:2) : (($input.zona ?? "")|trim)
    }

    var $provincias {
      value = ($input.ajustes ?? {})|get:"provincias":[]
    }
  }

  response = $provincia != "" && ($provincias|in:$provincia)
}
