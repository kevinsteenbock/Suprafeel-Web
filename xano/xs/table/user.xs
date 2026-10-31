// Cuentas de Suprafeel Soft (tabla 64, la de autenticación). sesion_desde: los tokens emitidos antes no valen
// (lo comprueba la función sf_sesion); ponerlo a ahora cierra todas las sesiones abiertas de la cuenta.
table user {
  auth = true

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    text name filters=trim
    email email filters=trim|lower {
      sensitive = true
    }
  
    password password {
      sensitive = true
    }
  
    text role filters=trim
    text pharmacy_slug?
    text rep_name?
    timestamp? sesion_desde?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "email"}]}
  ]
}
