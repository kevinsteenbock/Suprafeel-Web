// PATCH /admin/farmacias/{slug}: cambia los datos y la formación de una farmacia. Solo admin. Se manda la ficha entera.
query "admin/farmacias/{slug}" verb=PATCH {
  api_group = "suprafeel"
  auth = "user"

  input {
    text slug filters=trim|lower
    text? name? filters=trim
    text? nombre_comercial? filters=trim
    text? owner? filters=trim
    text? address? filters=trim
    text? postal? filters=trim
    text? city? filters=trim
    text? telefono? filters=trim
    int? refs?
    text? distribuidor? filters=trim
    text? rep? filters=trim
    text? zona? filters=trim
    text? formacion? filters=trim|lower
    text? formacion_fecha? filters=trim
    text? formacion_hora? filters=trim
    text? formacion_nota? filters=trim
  }

  stack {
    function.run sf_sesion {
      input = {user_id: $auth.id, extras: $auth.extras}
    } as $sesion

    function.run sf_admin_guard {
      input = {user_id: $auth.id}
    } as $admin

    precondition ((($input.name ?? "")|strlen) >= 2) {
      error_type = "inputerror"
      error = "Escribe el nombre de la farmacia"
    }

    precondition ((($input.rep ?? "")|strlen) >= 2) {
      error_type = "inputerror"
      error = "Elige el comercial"
    }

    precondition (["", "hecha", "prevista", "reprogramada", "pendiente", "cancelada", "rechazada"]|in:($input.formacion ?? "")) {
      error_type = "inputerror"
      error = "Ese estado de formación no existe"
    }

    precondition (($input.formacion_fecha ?? "") == "" || ("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/"|regex_matches:$input.formacion_fecha)) {
      error_type = "inputerror"
      error = "La fecha de la formación no es válida"
    }

    precondition (($input.formacion_hora ?? "") == "" || ("/^[0-9]{2}:[0-9]{2}$/"|regex_matches:$input.formacion_hora)) {
      error_type = "inputerror"
      error = "La hora de la formación no es válida"
    }

    db.get sf_farmacia {
      field_name = "slug"
      field_value = $input.slug
      output = ["id"]
    } as $existe

    precondition ($existe != null) {
      error_type = "notfound"
      error = "Esa farmacia no existe"
    }

    db.edit sf_farmacia {
      field_name = "slug"
      field_value = $input.slug
      data = {
        name            : $input.name
        nombre_comercial: $input.nombre_comercial ?? ""
        owner           : $input.owner ?? ""
        address         : $input.address ?? ""
        postal          : $input.postal ?? ""
        city            : $input.city ?? ""
        telefono        : $input.telefono ?? ""
        refs            : $input.refs ?? 0
        distribuidor    : $input.distribuidor ?? ""
        rep             : $input.rep
        zona            : $input.zona ?? ""
        formacion       : $input.formacion ?? ""
        formacion_fecha : $input.formacion_fecha ?? ""
        formacion_hora  : $input.formacion_hora ?? ""
        formacion_nota  : $input.formacion_nota ?? ""
      }
    } as $fila
  }

  response = {slug: $input.slug}
}
