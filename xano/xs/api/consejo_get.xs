// GET /consejo: mis consultas al consejo con Claude, de la más reciente a la más antigua (30 por página).
// ?pagina=1 · Devuelve [{ id, created_at, updated_at, primera_frase, turnos, valoracion, derivo }].
query consejo verb=GET {
  api_group = "suprafeel"
  auth = "user"

  input {
    int pagina?=1 filters=min:1
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    precondition (["admin", "comercial", "farmacia"]|in:$sesion.role) {
      error_type = "accessdenied"
      error = "Tu cuenta no tiene acceso al consejo"
    }

    db.query sf_consulta {
      where = $db.sf_consulta.user == $sesion.id
      sort = {created_at: "desc"}
      output = ["items.id", "items.created_at", "items.updated_at", "items.primera_frase", "items.turnos", "items.valoracion", "items.derivo"]
      return = {type: "list", paging: {page: $input.pagina, per_page: 30}}
    } as $mias
  }

  response = $mias.items
}
