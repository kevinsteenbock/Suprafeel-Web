// PATCH /admin/usuarios/{usuario_id}: cambia la ficha de una cuenta de comercial. Solo admin. Se manda la ficha entera.
// body { name, rep_name, zona? }. rep_name: un comercial («Alex»), varios separados por comas («Francesc,Alex»: p. ej. un
// jefe de zona que ve lo de su equipo) o «*» (todas las farmacias). Las cuentas de farmacia y de administración no se tocan aquí.
// Lo que ve la cuenta cambia en su siguiente carga: GET /farmacias lee rep_name de la sesión cada vez.
query "admin/usuarios/{usuario_id}" verb=PATCH {
  api_group = "suprafeel"
  auth = "user"

  input {
    int usuario_id
    text? name? filters=trim
    text? rep_name? filters=trim
    text? zona? filters=trim
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    var $name {
      value = $input.name ?? ""
    }

    var $rep {
      value = $input.rep_name ?? ""
    }

    var $zona {
      value = $input.zona ?? ""
    }

    precondition (($name|strlen) >= 2) {
      error_type = "inputerror"
      error = "Escribe el nombre de la cuenta"
    }

    precondition ($rep != "" && ($rep|strlen) <= 600) {
      error_type = "inputerror"
      error = "Elige qué farmacias ve: las de un comercial, las de varios o todas"
    }

    precondition (($zona|strlen) <= 60) {
      error_type = "inputerror"
      error = "La zona es demasiado larga"
    }

    db.get user {
      field_name = "id"
      field_value = $input.usuario_id
      output = ["id", "role"]
    } as $cuenta

    precondition ($cuenta != null) {
      error_type = "notfound"
      error = "Esa cuenta no existe"
    }

    precondition ($cuenta.role == "comercial") {
      error_type = "inputerror"
      error = "Aquí solo se editan cuentas de comercial"
    }

    db.edit user {
      field_name = "id"
      field_value = $input.usuario_id
      data = {name: $name, rep_name: $rep, zona: $zona}
    } as $editada

    db.get user {
      field_name = "id"
      field_value = $input.usuario_id
      output = ["id", "name", "email", "role", "pharmacy_slug", "rep_name", "zona", "created_at"]
    } as $usuario
  }

  response = $usuario
}
