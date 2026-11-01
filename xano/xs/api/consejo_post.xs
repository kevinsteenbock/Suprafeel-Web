// POST /consejo: una pregunta al consejo con Claude (farmacia, comercial o admin). Cobra de la cuenta de Anthropic
// cuya clave está en Xano › Settings › Environment variables › ANTHROPIC_API_KEY (nunca se devuelve ni se guarda).
// body { consulta_id?: int, mensaje: text }. Sin consulta_id empieza una consulta nueva con la versión activa del prompt;
// con consulta_id sigue esa consulta (404 si no existe, 403 si no es tuya) con SU versión del prompt.
// Devuelve { consulta_id, respuesta (el JSON de Claude, con los productos comprobados contra products), turnos,
// coste_usd_turno, productos_descartados, quedan_hoy, quedan_turnos }.
// Errores, siempre { code, message } con un texto para enseñar tal cual:
// 400 mensaje vacío o demasiado largo · 401 sin sesión · 403/404 consulta ajena o que no existe · 429 límite del día o de
// la consulta · 503 sin clave en Xano, sin prompt cargado, clave no válida, sin saldo, Claude saturado o sin respuesta ·
// 422 Claude no responde a esa consulta (rechazo) · 502 respuesta cortada o que no se puede leer.
// La conversación solo se alarga: cada turno de assistant se guarda y se reenvía con su content completo, sin tocar.
// El primer mensaje de cada consulta lleva delante el bloque «[Contexto del sistema] rol: … · fecha: AAAA-MM-DD» (hora de
// Madrid) que espera el prompt; los siguientes, solo el texto. Igual que xano/consejo/eval.mjs.
// Productos: solo ids que estén en el enum del esquema Y en products, sin repetir y como mucho 3; el resto, a descartados.
// Depuración (solo admin): con debug = true no llama a Claude ni guarda nada (ni consulta ni registro) y devuelve
// { depuracion, llamada_hecha: false, clave_configurada, url, cabeceras (la clave tapada), cuerpo_json (el cuerpo exacto,
// como texto JSON), prompt_version, consulta_id }. Funciona también sin clave. Con otro rol, debug se ignora.
query consejo verb=POST {
  api_group = "suprafeel"
  auth = "user"

  input {
    int? consulta_id?
    text? mensaje? filters=trim
    bool debug?=false
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition (["admin", "comercial", "farmacia"]|in:$sesion.role) {
      error_type = "accessdenied"
      error = "Tu cuenta no tiene acceso al consejo"
    }

    var $depurar {
      value = ($input.debug == true) && ($sesion.role == "admin")
    }

    // Límites: primera fila de sf_consejo_limites; sin fila, los de serie.
    db.query sf_consejo_limites {
      sort = {id: "asc"}
      return = {type: "single"}
    } as $limites

    var $lim {
      value = $limites ?? {}
    }

    var $max_caracteres {
      value = ($lim|get:"max_caracteres":2000) ?? 2000
    }

    var $max_turnos {
      value = ($lim|get:"max_turnos":12) ?? 12
    }

    var $max_dia {
      value = ($lim|get:"max_mensajes_dia":40) ?? 40
    }

    conditional {
      if ($sesion.role == "admin") {
        var.update $max_dia {
          value = ($lim|get:"max_mensajes_dia_admin":200) ?? 200
        }
      }
    }

    // El mensaje: no vacío y como mucho max_caracteres caracteres (letras, no bytes).
    var $mensaje {
      value = $input.mensaje ?? ""
    }

    precondition ($mensaje != "") {
      error_type = "inputerror"
      error = "Escribe qué le pasa a tu cliente"
    }

    var $patron_largo {
      value = "/^.{1," ~ $max_caracteres ~ "}$/us"
    }

    var $cabe {
      value = $patron_largo|regex_matches:$mensaje
    }

    precondition ($cabe) {
      error_type = "inputerror"
      error = "El mensaje es demasiado largo: como máximo " ~ ($max_caracteres|number_format:0:",":".") ~ " caracteres. Resúmelo un poco."
    }

    // La consulta que sigue, si la hay.
    var $consulta {
      value = null
    }

    conditional {
      if ($input.consulta_id != null && $input.consulta_id > 0) {
        db.get sf_consulta {
          field_name = "id"
          field_value = $input.consulta_id
        } as $encontrada

        precondition ($encontrada != null) {
          error_type = "notfound"
          error = "Esa consulta no existe"
        }

        precondition ($encontrada.user == $sesion.id) {
          error_type = "accessdenied"
          error = "Esa consulta no es tuya"
        }

        var.update $consulta {
          value = $encontrada
        }
      }
    }

    var $es_nueva {
      value = $consulta == null
    }

    var $c {
      value = $consulta ?? {}
    }

    var $turnos_previos {
      value = ($c|get:"turnos":0) ?? 0
    }

    precondition ($turnos_previos < $max_turnos) {
      error_type = "toomanyrequests"
      error = "Esta consulta ya tiene " ~ $max_turnos ~ " preguntas. Empieza una consulta nueva para seguir."
    }

    // Preguntas de hoy (hora de Madrid). Las que fallaron sin respuesta de Claude no cuentan.
    var $hoy {
      value = "today"|to_timestamp:"Europe/Madrid"
    }

    db.query sf_consejo_mensaje {
      where = $db.sf_consejo_mensaje.user == $sesion.id && $db.sf_consejo_mensaje.created_at >= $hoy && $db.sf_consejo_mensaje.estado != "error"
      return = {type: "count"}
    } as $usados_hoy

    precondition ($usados_hoy < $max_dia) {
      error_type = "toomanyrequests"
      error = "Has llegado al máximo de " ~ $max_dia ~ " preguntas de hoy. Mañana podrás seguir consultando."
    }

    // Sin clave de Claude no se llama a nadie (la depuración sigue: no llama).
    var $clave {
      value = ($env.ANTHROPIC_API_KEY ?? "")|trim
    }

    conditional {
      if ($clave == "" && !$depurar) {
        util.set_header {
          value = "HTTP/1.1 503 Service Unavailable"
          duplicates = "replace"
        }

        return {
          value = {code: "ERROR_CODE_SERVICE_UNAVAILABLE", message: "El consejo con IA aún no está activado: falta la clave de Claude en Xano."}
        }
      }
    }

    // El prompt: el activo para una consulta nueva; el suyo para una que sigue.
    var $prompt {
      value = null
    }

    conditional {
      if ($es_nueva) {
        db.query sf_consejo_prompt {
          where = $db.sf_consejo_prompt.activo == true
          sort = {version: "desc"}
          return = {type: "single"}
        } as $prompt_activo

        var.update $prompt {
          value = $prompt_activo
        }
      }

      else {
        db.get sf_consejo_prompt {
          field_name = "version"
          field_value = $c.prompt_version
        } as $prompt_suyo

        var.update $prompt {
          value = $prompt_suyo
        }
      }
    }

    var $p {
      value = $prompt ?? {}
    }

    var $texto_system {
      value = ($p|get:"texto":"") ?? ""
    }

    var $esquema {
      value = $p|get:"esquema":null
    }

    // Manda esquema_texto (el JSON tal cual): el campo json de Xano reordena las claves, y el orden de properties es el
    // orden en que Claude escribe la respuesta. Si el texto no se puede leer, no hay esquema (503).
    var $esquema_texto {
      value = ($p|get:"esquema_texto":"") ?? ""
    }

    conditional {
      if ($esquema_texto != "") {
        try_catch {
          try {
            var.update $esquema {
              value = $esquema_texto|json_decode
            }
          }

          catch {
            var.update $esquema {
              value = null
            }
          }
        }
      }
    }

    conditional {
      if ($prompt == null || $texto_system == "" || $texto_system == "PROVISIONAL" || $esquema == null || ($esquema|is_empty)) {
        util.set_header {
          value = "HTTP/1.1 503 Service Unavailable"
          duplicates = "replace"
        }

        return {
          value = {code: "ERROR_CODE_SERVICE_UNAVAILABLE", message: "El consejo con IA aún no está listo: faltan las instrucciones de Claude en Xano."}
        }
      }
    }

    // El cuerpo para Anthropic. El historial se reenvía tal cual y solo se le añade el turno nuevo.
    var $modelo {
      value = ($p|get:"modelo":"")|first_notempty:"claude-opus-5-5"
    }

    var $esfuerzo {
      value = ($p|get:"esfuerzo":"")|first_notempty:"medium"
    }

    // El turno del usuario: en una consulta nueva, primero la línea de contexto (rol y fecha de Madrid).
    var $bloques_usuario {
      value = []
    }

    conditional {
      if ($es_nueva) {
        var $fecha_hoy {
          value = "now"|format_timestamp:"Y-m-d":"Europe/Madrid"
        }

        var $linea_contexto {
          value = "[Contexto del sistema] rol: " ~ $sesion.role ~ " · fecha: " ~ $fecha_hoy
        }

        var $bloque_contexto {
          value = {type: "text", text: $linea_contexto}
        }

        var.update $bloques_usuario {
          value = $bloques_usuario|push:$bloque_contexto
        }
      }
    }

    var $bloque_mensaje {
      value = {type: "text", text: $mensaje}
    }

    var.update $bloques_usuario {
      value = $bloques_usuario|push:$bloque_mensaje
    }

    var $turno_usuario {
      value = {role: "user", content: $bloques_usuario}
    }

    var $mensajes {
      value = ($c|get:"mensajes":[]) ?? []
    }

    var.update $mensajes {
      value = $mensajes|push:$turno_usuario
    }

    var $cuerpo {
      value = {
        model        : $modelo
        max_tokens   : 16000
        fallbacks    : "default"
        system       : [{type: "text", text: $texto_system, cache_control: {type: "ephemeral"}}]
        messages     : $mensajes
        output_config: {effort: $esfuerzo, format: {type: "json_schema", schema: $esquema}}
      }
    }

    // Depuración (solo admin): el cuerpo exacto que se mandaría, sin llamar a nadie ni guardar nada.
    // Las cabeceras son las mismas que las del api.request de abajo: si cambias unas, cambia las otras.
    conditional {
      if ($depurar) {
        var $nota_clave {
          value = ($clave == "") ? "x-api-key: (falta: no hay ANTHROPIC_API_KEY en Xano)" : "x-api-key: (oculta)"
        }

        var $cabeceras_vista {
          value = ["content-type: application/json", $nota_clave, "anthropic-version: 2026-10-21", "anthropic-beta: server-side-fallback-2026-07-01"]
        }

        var $cuerpo_json {
          value = $cuerpo|json_encode
        }

        return {
          value = {
            depuracion       : true
            llamada_hecha    : false
            clave_configurada: ($clave != "")
            url              : "https://api.anthropic.com/v1/messages"
            cabeceras        : $cabeceras_vista
            cuerpo_json      : $cuerpo_json
            prompt_version   : $p.version
            consulta_id      : ($c|get:"id":null)
          }
        }
      }
    }

    // Se apunta antes de llamar, para que dos envíos a la vez no se salten el límite.
    db.add sf_consejo_mensaje {
      data = {user: $sesion.id, rol: $sesion.role, consulta: ($c|get:"id":null), estado: "enviado"}
    } as $registro

    var $t0 {
      value = "now"|to_ms
    }

    var $respuesta_http {
      value = null
    }

    try_catch {
      try {
        api.request {
          url = "https://api.anthropic.com/v1/messages"
          method = "POST"
          params = $cuerpo
          headers = [
            "content-type: application/json",
            "x-api-key: " ~ $clave,
            "anthropic-version: 2026-10-21",
            "anthropic-beta: server-side-fallback-2026-07-01"
          ]
          timeout = 120
        } as $llamada

        var.update $respuesta_http {
          value = $llamada.response
        }
      }

      catch {
        var.update $respuesta_http {
          value = null
        }
      }
    }

    var $t1 {
      value = "now"|to_ms
    }

    var $ms {
      value = $t1 - $t0
    }

    // Lo que volvió (solo response: request lleva la clave en las cabeceras y no se usa).
    var $http {
      value = (($respuesta_http ?? {})|get:"status":0) ?? 0
    }

    var $res {
      value = ($respuesta_http ?? {})|get:"result":null
    }

    var $res_obj {
      value = ($res|is_object) ? $res : {}
    }

    var $stop {
      value = ($res_obj|get:"stop_reason":"") ?? ""
    }

    var $modelo_servido {
      value = ($res_obj|get:"model":"")|first_notempty:$modelo
    }

    var $detalles {
      value = ($res_obj|get:"stop_details":{}) ?? {}
    }

    var $categoria {
      value = ($detalles|is_object) ? ($detalles|get:"category":null) : null
    }

    var $error_api {
      value = ($res_obj|get:"error":{}) ?? {}
    }

    var $error_txt {
      value = ""
    }

    conditional {
      if ($http == 0) {
        var.update $error_txt {
          value = "Sin respuesta (tiempo agotado o error de red)"
        }
      }

      elseif ($http != 200) {
        var.update $error_txt {
          value = ($http|to_text) ~ " " ~ (($error_api|get:"type":"") ?? "") ~ ": " ~ (($error_api|get:"message":"") ?? "")
        }
      }
    }

    function.run sf_consejo_coste {
      input = {uso: ($res_obj|get:"usage":null), modelo_servido: $modelo_servido, modelo_pedido: $modelo}
    } as $coste

    // ¿Sirve la respuesta? stop_reason antes que content.
    var $fallo {
      value = null
    }

    conditional {
      if ($http == 0) {
        var.update $fallo {
          value = {status: 503, razon: "Service Unavailable", code: "ERROR_CODE_SERVICE_UNAVAILABLE", estado: "error", message: "Claude no ha respondido a tiempo. Prueba otra vez en un momento."}
        }
      }

      elseif ($http == 401 || $http == 403) {
        var.update $fallo {
          value = {status: 503, razon: "Service Unavailable", code: "ERROR_CODE_SERVICE_UNAVAILABLE", estado: "error", message: "El consejo con IA no funciona: la clave de Claude que hay en Xano no es válida."}
        }
      }

      elseif ($http == 429 || $http == 529) {
        var.update $fallo {
          value = {status: 503, razon: "Service Unavailable", code: "ERROR_CODE_SERVICE_UNAVAILABLE", estado: "error", message: "Claude está saturado, prueba en un minuto."}
        }
      }

      elseif ($http == 400 && (($error_txt|to_lower)|contains:"credit balance")) {
        var.update $fallo {
          value = {status: 503, razon: "Service Unavailable", code: "ERROR_CODE_SERVICE_UNAVAILABLE", estado: "error", message: "La cuenta de Claude se ha quedado sin saldo. Avisa a Suprafeel para que la recarguen."}
        }
      }

      elseif ($http >= 500) {
        var.update $fallo {
          value = {status: 503, razon: "Service Unavailable", code: "ERROR_CODE_SERVICE_UNAVAILABLE", estado: "error", message: "Claude no está disponible ahora mismo. Prueba en un minuto."}
        }
      }

      elseif ($http != 200) {
        var.update $fallo {
          value = {status: 502, razon: "Bad Gateway", code: "ERROR_CODE_BAD_GATEWAY", estado: "error", message: "Claude no ha aceptado la consulta (error " ~ $http ~ "). Avisa a Suprafeel."}
        }
      }

      elseif ($stop == "refusal") {
        var.update $fallo {
          value = {status: 422, razon: "Unprocessable Content", code: "ERROR_CODE_REFUSAL", estado: "rechazo", message: "Claude no puede responder a esta consulta tal como está escrita. Cuéntala de otra forma, centrándote en los síntomas y en lo que toma. Si es un caso delicado, deriva al médico."}
        }
      }

      elseif ($stop == "max_tokens") {
        var.update $fallo {
          value = {status: 502, razon: "Bad Gateway", code: "ERROR_CODE_INCOMPLETE", estado: "cortada", message: "La respuesta de Claude ha salido demasiado larga y se ha cortado. Haz la pregunta más concreta y vuelve a probar."}
        }
      }

      elseif ($stop != "end_turn") {
        var.update $fallo {
          value = {status: 502, razon: "Bad Gateway", code: "ERROR_CODE_BAD_GATEWAY", estado: "error", message: "Claude ha respondido de una forma inesperada. Prueba otra vez."}
        }
      }
    }

    // end_turn: el JSON está en los bloques text (los thinking y fallback se guardan, pero no se leen).
    var $bloques {
      value = ($res_obj|get:"content":[]) ?? []
    }

    var $texto_json {
      value = ""
    }

    var $datos {
      value = null
    }

    conditional {
      if ($fallo == null) {
        foreach ($bloques) {
          each as $bloque {
            conditional {
              if (($bloque|is_object) && ($bloque|get:"type":"") == "text") {
                var.update $texto_json {
                  value = $texto_json ~ (($bloque|get:"text":"") ?? "")
                }
              }
            }
          }
        }

        try_catch {
          try {
            var.update $datos {
              value = $texto_json|json_decode
            }
          }

          catch {
            var.update $datos {
              value = null
            }
          }
        }

        conditional {
          if (!($datos|is_object)) {
            var.update $fallo {
              value = {status: 502, razon: "Bad Gateway", code: "ERROR_CODE_BAD_GATEWAY", estado: "error", message: "No se ha podido leer la respuesta de Claude. Prueba otra vez."}
            }
          }
        }
      }
    }

    // Una sola salida para todo lo que falla: se apunta en el registro y no se toca la consulta.
    conditional {
      if ($fallo != null) {
        db.edit sf_consejo_mensaje {
          field_name = "id"
          field_value = $registro.id
          data = {
            estado         : $fallo.estado
            http           : $http
            stop_reason    : $stop
            categoria      : $categoria
            modelo_servido : $modelo_servido
            tokens_entrada : $coste.tokens_entrada
            tokens_salida  : $coste.tokens_salida
            cache_escritura: $coste.cache_escritura
            cache_lectura  : $coste.cache_lectura
            coste_usd      : $coste.coste_usd
            ms             : $ms
            error          : $error_txt
          }
        } as $registro_fallo

        util.set_header {
          value = "HTTP/1.1 " ~ $fallo.status ~ " " ~ $fallo.razon
          duplicates = "replace"
        }

        return {
          value = {code: $fallo.code, message: $fallo.message}
        }
      }
    }

    // Productos: solo los que están en el enum del esquema y existen en products (por slug), sin repetir y como mucho 3.
    // Los demás se quitan de la respuesta y salen en productos_descartados.
    var $campo_productos {
      value = ($p|get:"campo_productos":"")|first_notempty:"productos"
    }

    var $campo_id {
      value = ($p|get:"campo_producto_id":"")|first_notempty:"id"
    }

    var $campo_derivar {
      value = ($p|get:"campo_derivar":"")|first_notempty:"derivar.necesario"
    }

    // Los ids que admite el esquema (enum de productos[].id). Si el esquema no trae enum, solo cuenta products.
    var $enum_ids {
      value = null
    }

    try_catch {
      try {
        var.update $enum_ids {
          value = (((((($esquema|get:"properties":{})|get:$campo_productos:{})|get:"items":{})|get:"properties":{})|get:$campo_id:{})|get:"enum":null)
        }
      }

      catch {
        var.update $enum_ids {
          value = null
        }
      }
    }

    var $hay_enum {
      value = $enum_ids|is_array
    }

    var $max_productos {
      value = 3
    }

    var $lista {
      value = $datos|get:$campo_productos:null
    }

    var $ids {
      value = []
    }

    var $id_item {
      value = ""
    }

    conditional {
      if ($lista|is_array) {
        foreach ($lista) {
          each as $item {
            conditional {
              if ($item|is_object) {
                var.update $id_item {
                  value = ($item|get:$campo_id:"") ?? ""
                }

                conditional {
                  if ($id_item != "") {
                    var.update $ids {
                      value = $ids|push:$id_item
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    var $slugs_ok {
      value = []
    }

    conditional {
      if (($ids|count) > 0) {
        db.query products {
          where = $db.products.slug in $ids
          output = ["slug"]
          return = {type: "list"}
        } as $existen

        var.update $slugs_ok {
          value = $existen|map:$$.slug
        }
      }
    }

    var $productos_ok {
      value = []
    }

    var $slugs_turno {
      value = []
    }

    var $descartados {
      value = []
    }

    var $vale {
      value = false
    }

    conditional {
      if ($lista|is_array) {
        foreach ($lista) {
          each as $item {
            var.update $id_item {
              value = ""
            }

            conditional {
              if ($item|is_object) {
                var.update $id_item {
                  value = ($item|get:$campo_id:"") ?? ""
                }
              }
            }

            var.update $vale {
              value = $id_item != "" && ($slugs_ok|in:$id_item) && (!$hay_enum || ($enum_ids|in:$id_item)) && !($slugs_turno|in:$id_item) && ($slugs_turno|count) < $max_productos
            }

            conditional {
              if ($vale) {
                var.update $productos_ok {
                  value = $productos_ok|push:$item
                }

                var.update $slugs_turno {
                  value = $slugs_turno|push:$id_item
                }
              }

              else {
                var.update $descartados {
                  value = $descartados|push:$id_item
                }
              }
            }
          }
        }

        var.update $datos {
          value = $datos|set:$campo_productos:$productos_ok
        }
      }
    }

    // ¿Dice que hay que derivar? campo_derivar es una ruta con puntos (por defecto derivar.necesario).
    var $nodo {
      value = $datos
    }

    var $ruta_derivar {
      value = $campo_derivar|split:"."
    }

    foreach ($ruta_derivar) {
      each as $clave_ruta {
        var.update $nodo {
          value = ($nodo|is_object) ? ($nodo|get:$clave_ruta:null) : null
        }
      }
    }

    var $deriva_turno {
      value = $nodo === true
    }

    // Lo que se guarda.
    var $turno_asistente {
      value = {role: "assistant", content: ($res_obj|get:"content":[])}
    }

    var.update $mensajes {
      value = $mensajes|push:$turno_asistente
    }

    var $ahora_ms {
      value = "now"|to_ms
    }

    var $entrada {
      value = {pregunta: $mensaje, respuesta: $datos, fecha: $ahora_ms}
    }

    var $historial {
      value = ($c|get:"historial":[]) ?? []
    }

    var.update $historial {
      value = $historial|push:$entrada
    }

    var $productos_consulta {
      value = ($c|get:"productos":[]) ?? []
    }

    foreach ($slugs_turno) {
      each as $slug {
        conditional {
          if (!($productos_consulta|in:$slug)) {
            var.update $productos_consulta {
              value = $productos_consulta|push:$slug
            }
          }
        }
      }
    }

    var $derivo {
      value = (($c|get:"derivo":false) === true) || $deriva_turno
    }

    var $consulta_id {
      value = null
    }

    conditional {
      if ($es_nueva) {
        // Primera frase de la primera pregunta, para las listas (hasta 140 letras).
        var $frase {
          value = ("/^[^.!?\n]{1,140}[.!?]?/u"|regex_get_first_match:$mensaje)|first
        }

        conditional {
          if ($frase == null || $frase == "") {
            var.update $frase {
              value = ("/^.{1,140}/us"|regex_get_first_match:$mensaje)|first
            }
          }
        }

        var.update $frase {
          value = ($frase ?? "")|trim
        }

        conditional {
          if (($frase|strlen) < ($mensaje|strlen) && !("/[.!?]$/"|regex_matches:$frase)) {
            var.update $frase {
              value = $frase ~ "…"
            }
          }
        }

        db.add sf_consulta {
          data = {
            user           : $sesion.id
            rol            : $sesion.role
            prompt_version : $p.version
            mensajes       : $mensajes
            ultima         : $datos
            historial      : $historial
            turnos         : 1
            tokens_entrada : $coste.tokens_entrada
            tokens_salida  : $coste.tokens_salida
            cache_escritura: $coste.cache_escritura
            cache_lectura  : $coste.cache_lectura
            coste_usd      : $coste.coste_usd
            modelo_servido : $modelo_servido
            valoracion     : 0
            primera_frase  : $frase
            productos      : $productos_consulta
            derivo         : $derivo
            updated_at     : now
          }
        } as $nueva

        var.update $consulta_id {
          value = $nueva.id
        }
      }

      else {
        db.edit sf_consulta {
          field_name = "id"
          field_value = $c.id
          data = {
            mensajes       : $mensajes
            ultima         : $datos
            historial      : $historial
            turnos         : $turnos_previos + 1
            tokens_entrada : (($c|get:"tokens_entrada":0) ?? 0) + $coste.tokens_entrada
            tokens_salida  : (($c|get:"tokens_salida":0) ?? 0) + $coste.tokens_salida
            cache_escritura: (($c|get:"cache_escritura":0) ?? 0) + $coste.cache_escritura
            cache_lectura  : (($c|get:"cache_lectura":0) ?? 0) + $coste.cache_lectura
            coste_usd      : (($c|get:"coste_usd":0) ?? 0) + $coste.coste_usd
            modelo_servido : $modelo_servido
            productos      : $productos_consulta
            derivo         : $derivo
            updated_at     : now
          }
        } as $editada

        var.update $consulta_id {
          value = $c.id
        }
      }
    }

    db.edit sf_consejo_mensaje {
      field_name = "id"
      field_value = $registro.id
      data = {
        consulta       : $consulta_id
        estado         : "ok"
        http           : $http
        stop_reason    : $stop
        modelo_servido : $modelo_servido
        tokens_entrada : $coste.tokens_entrada
        tokens_salida  : $coste.tokens_salida
        cache_escritura: $coste.cache_escritura
        cache_lectura  : $coste.cache_lectura
        coste_usd      : $coste.coste_usd
        ms             : $ms
      }
    } as $registro_ok

    var $salida {
      value = {
        consulta_id          : $consulta_id
        respuesta            : $datos
        turnos               : $turnos_previos + 1
        coste_usd_turno      : $coste.coste_usd
        productos_descartados: $descartados
        quedan_hoy           : $max_dia - $usados_hoy - 1
        quedan_turnos        : $max_turnos - $turnos_previos - 1
      }
    }
  }

  response = $salida
}
