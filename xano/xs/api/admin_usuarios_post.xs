// Alta de una cuenta, solo para admin. Sustituye al antiguo POST auth/signup (era público y aceptaba role = admin).
// body { name, email, password (mín. 10), role: farmacia | comercial | admin, pharmacy_slug?, rep_name?, zona? }
// Devuelve la cuenta creada sin contraseña. Datos malos o correo repetido → 400 con el motivo en español.
query "admin/usuarios" verb=POST {
  api_group = "suprafeel"
  auth = "user"

  input {
    text? name? filters=trim
    text? email? filters=trim|lower
    text? password? {
      sensitive = true
    }

    text? role? filters=trim|lower
    text? pharmacy_slug? filters=trim|lower
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

    var $email {
      value = $input.email ?? ""
    }

    var $password {
      value = $input.password ?? ""
    }

    var $role {
      value = $input.role ?? ""
    }

    var $slug {
      value = $input.pharmacy_slug ?? ""
    }

    var $rep {
      value = $input.rep_name ?? ""
    }

    precondition (($name|strlen) >= 2) {
      error_type = "inputerror"
      error = "Escribe el nombre de la cuenta"
    }

    precondition ("/^[^ @]+@[^ @]+[.][^ @]+$/"|regex_matches:$email) {
      error_type = "inputerror"
      error = "Escribe un correo válido, por ejemplo nombre@farmacia.es"
    }

    precondition (($password|strlen) >= 10) {
      error_type = "inputerror"
      error = "La contraseña tiene que tener al menos 10 caracteres"
    }

    precondition (["farmacia", "comercial", "admin"]|in:$role) {
      error_type = "inputerror"
      error = "El rol tiene que ser farmacia, comercial o admin"
    }

    conditional {
      if ($role == "farmacia") {
        precondition ($slug != "") {
          error_type = "inputerror"
          error = "Elige la farmacia de esta cuenta"
        }

        db.has sf_farmacia {
          field_name = "slug"
          field_value = $slug
        } as $farmacia_existe

        precondition ($farmacia_existe) {
          error_type = "inputerror"
          error = "Esa farmacia no está en la lista"
        }
      }

      elseif ($role == "comercial") {
        precondition ($rep != "") {
          error_type = "inputerror"
          error = "Escribe el comercial tal como sale en las farmacias (por ejemplo, Alex)"
        }
      }
    }

    db.has user {
      field_name = "email"
      field_value = $email
    } as $ya_existe

    precondition (!$ya_existe) {
      error_type = "inputerror"
      error = "Ya hay una cuenta con ese correo"
    }

    db.add user {
      data = {
        name         : $name
        email        : $email
        password     : $password
        role         : $role
        pharmacy_slug: ($role == "farmacia") ? $slug : null
        rep_name     : ($role == "comercial") ? $rep : null
        zona         : ($role == "comercial") ? ($input.zona ?? "") : null
        sesion_desde : now
      }
    } as $nuevo

    db.get user {
      field_name = "id"
      field_value = $nuevo.id
      output = ["id", "name", "email", "role", "pharmacy_slug", "rep_name", "zona", "created_at"]
    } as $usuario
  }

  response = $usuario
}
