// GET /admin/consultas: «Registro de consultas» del consejo con Claude, solo admin (403 si no).
// ?pagina=1&por_pagina=25 (máx. 100)&desde=AAAA-MM-DD&hasta=AAAA-MM-DD (hora de Madrid, los dos opcionales).
// Cada consulta: { id, created_at, updated_at, rol, primera_frase, productos, derivo, valoracion, comentario, turnos,
// coste_usd, modelo_servido, prompt_version }, de la más reciente a la más antigua. Sin nombre, correo ni id de quien
// la escribió. totales: consultas, preguntas (mensajes) y coste en dólares de hoy, del mes y de siempre.
query "admin/consultas" verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
    int pagina?=1 filters=min:1
    int por_pagina?=25 filters=min:1|max:100
    text? desde? filters=trim
    text? hasta? filters=trim
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    var $desde_txt {
      value = $input.desde ?? ""
    }

    var $hasta_txt {
      value = $input.hasta ?? ""
    }

    precondition ($desde_txt == "" || ("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/"|regex_matches:$desde_txt)) {
      error_type = "inputerror"
      error = "La fecha «desde» tiene que ir como AAAA-MM-DD"
    }

    precondition ($hasta_txt == "" || ("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/"|regex_matches:$hasta_txt)) {
      error_type = "inputerror"
      error = "La fecha «hasta» tiene que ir como AAAA-MM-DD"
    }

    var $desde {
      value = null
    }

    var $hasta {
      value = null
    }

    conditional {
      if ($desde_txt != "") {
        var.update $desde {
          value = ($desde_txt ~ " 00:00:00")|to_timestamp:"Europe/Madrid"
        }
      }
    }

    conditional {
      if ($hasta_txt != "") {
        var.update $hasta {
          value = (($hasta_txt ~ " 23:59:59")|to_timestamp:"Europe/Madrid")|add_ms_to_timestamp:999
        }
      }
    }

    db.query sf_consulta {
      where = $db.sf_consulta.created_at >=? $desde && $db.sf_consulta.created_at <=? $hasta
      sort = {created_at: "desc"}
      output = [
        "itemsTotal"
        "curPage"
        "pageTotal"
        "items.id"
        "items.created_at"
        "items.updated_at"
        "items.rol"
        "items.primera_frase"
        "items.productos"
        "items.derivo"
        "items.valoracion"
        "items.comentario"
        "items.turnos"
        "items.coste_usd"
        "items.modelo_servido"
        "items.prompt_version"
      ]
      return = {
        type  : "list"
        paging: {page: $input.pagina, per_page: $input.por_pagina, totals: true}
      }
    } as $pagina

    // Totales (hora de Madrid).
    var $hoy {
      value = "today"|to_timestamp:"Europe/Madrid"
    }

    var $mes {
      value = "midnight first day of this month"|to_timestamp:"Europe/Madrid"
    }

    db.query sf_consulta {
      where = $db.sf_consulta.created_at >= $hoy
      return = {type: "count"}
    } as $consultas_hoy

    db.query sf_consulta {
      where = $db.sf_consulta.created_at >= $mes
      return = {type: "count"}
    } as $consultas_mes

    db.query sf_consulta {
      return = {type: "count"}
    } as $consultas_total

    db.query sf_consejo_mensaje {
      where = $db.sf_consejo_mensaje.created_at >= $hoy
      output = ["estado", "coste_usd"]
      return = {type: "list"}
    } as $registro_hoy

    db.query sf_consejo_mensaje {
      where = $db.sf_consejo_mensaje.created_at >= $mes
      output = ["estado", "coste_usd"]
      return = {type: "list"}
    } as $registro_mes

    db.query sf_consejo_mensaje {
      output = ["estado", "coste_usd"]
      return = {type: "list"}
    } as $registro_total

    var $coste_hoy {
      value = (($registro_hoy|map:($$.coste_usd ?? 0))|sum)|round:4
    }

    var $coste_mes {
      value = (($registro_mes|map:($$.coste_usd ?? 0))|sum)|round:4
    }

    var $coste_total {
      value = (($registro_total|map:($$.coste_usd ?? 0))|sum)|round:4
    }

    var $mensajes_hoy {
      value = ($registro_hoy|filter:($$.estado != "error"))|count
    }

    var $mensajes_mes {
      value = ($registro_mes|filter:($$.estado != "error"))|count
    }

    var $mensajes_total {
      value = ($registro_total|filter:($$.estado != "error"))|count
    }

    var $salida {
      value = {
        consultas: $pagina.items
        pagina   : $pagina.curPage
        paginas  : $pagina.pageTotal
        total    : $pagina.itemsTotal
        totales  : {consultas_hoy: $consultas_hoy, consultas_mes: $consultas_mes, consultas_total: $consultas_total, mensajes_hoy: $mensajes_hoy, mensajes_mes: $mensajes_mes, mensajes_total: $mensajes_total, coste_usd_hoy: $coste_hoy, coste_usd_mes: $coste_mes, coste_usd_total: $coste_total}
      }
    }
  }

  response = $salida
}
