// Tokens y coste en dólares de una respuesta de Claude, a partir de su usage.
// Si hubo fallback (usage.iterations), suma cada intento con el precio del modelo que lo hizo; si no, usa el usage de arriba.
// Precios por millón de tokens (31 oct 2026). Claude Opus 5.5: entrada 4, salida 20, escritura de caché (5 min) 5,
// lectura de caché 0,20. Los modelos de fallback (Opus 5, Opus 4.8): 5, 25, 6,25 y 0,50.
// Un intento rechazado antes de escribir nada se cuenta igual (es una estimación por arriba).
function sf_consejo_coste {
  input {
    json? uso
    text? modelo_servido
    text? modelo_pedido
  }

  stack {
    var $u {
      value = ($input.uso|is_object) ? $input.uso : {}
    }

    var $iteraciones {
      value = $u|get:"iterations":null
    }

    var $partes {
      value = []
    }

    var $modelo_parte {
      value = ""
    }

    conditional {
      if (($iteraciones|is_array) && ($iteraciones|count) > 0) {
        foreach ($iteraciones) {
          each as $it {
            conditional {
              if ($it|is_object) {
                var.update $modelo_parte {
                  value = $it|get:"model":null
                }

                conditional {
                  if ($modelo_parte == null || $modelo_parte == "") {
                    var.update $modelo_parte {
                      value = (($it|get:"type":"") == "fallback_message") ? ($input.modelo_servido ?? "") : ($input.modelo_pedido ?? "")
                    }
                  }
                }

                var.update $partes {
                  value = $partes|push:{uso: $it, modelo: $modelo_parte}
                }
              }
            }
          }
        }
      }
    }

    var $total {
      value = {tokens_entrada: 0, tokens_salida: 0, cache_escritura: 0, cache_lectura: 0, coste_usd: 0}
    }

    var $ent {
      value = 0
    }

    var $sal {
      value = 0
    }

    var $ce {
      value = 0
    }

    var $cl {
      value = 0
    }

    var $precio {
      value = {}
    }

    foreach ($partes) {
      each as $p {
        var.update $ent {
          value = ($p.uso|get:"input_tokens":0) ?? 0
        }

        var.update $sal {
          value = ($p.uso|get:"output_tokens":0) ?? 0
        }

        var.update $ce {
          value = ($p.uso|get:"cache_creation_input_tokens":0) ?? 0
        }

        var.update $cl {
          value = ($p.uso|get:"cache_read_input_tokens":0) ?? 0
        }

        var.update $precio {
          value = (($p.modelo ?? "")|starts_with:"claude-opus-5-5") ? {e: 4, s: 20, ce: 5, cl: 0.2} : {e: 5, s: 25, ce: 6.25, cl: 0.5}
        }

        var.update $total {
          value = {
            tokens_entrada : $total.tokens_entrada + $ent
            tokens_salida  : $total.tokens_salida + $sal
            cache_escritura: $total.cache_escritura + $ce
            cache_lectura  : $total.cache_lectura + $cl
            coste_usd      : $total.coste_usd + (($ent * $precio.e) + ($sal * $precio.s) + ($ce * $precio.ce) + ($cl * $precio.cl)) / 1000000
          }
        }
      }
    }

    // Sin iterations (o sin tokens dentro): el usage de arriba, con el precio del modelo que respondió.
    conditional {
      if (($total.tokens_entrada + $total.tokens_salida + $total.cache_escritura + $total.cache_lectura) == 0) {
        var.update $ent {
          value = ($u|get:"input_tokens":0) ?? 0
        }

        var.update $sal {
          value = ($u|get:"output_tokens":0) ?? 0
        }

        var.update $ce {
          value = ($u|get:"cache_creation_input_tokens":0) ?? 0
        }

        var.update $cl {
          value = ($u|get:"cache_read_input_tokens":0) ?? 0
        }

        var.update $precio {
          value = ((($input.modelo_servido ?? $input.modelo_pedido) ?? "")|starts_with:"claude-opus-5-5") ? {e: 4, s: 20, ce: 5, cl: 0.2} : {e: 5, s: 25, ce: 6.25, cl: 0.5}
        }

        var.update $total {
          value = {
            tokens_entrada : $ent
            tokens_salida  : $sal
            cache_escritura: $ce
            cache_lectura  : $cl
            coste_usd      : (($ent * $precio.e) + ($sal * $precio.s) + ($ce * $precio.ce) + ($cl * $precio.cl)) / 1000000
          }
        }
      }
    }

    var.update $total {
      value = $total|set:"coste_usd":($total.coste_usd|round:6)
    }
  }

  response = $total
}
