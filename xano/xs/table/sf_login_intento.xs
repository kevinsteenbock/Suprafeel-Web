// Intentos de entrada fallidos de Suprafeel Soft, para el freno de auth/login (5 por correo e IP cada 15 minutos).
// clave = md5(correo) : IP. No guarda el correo ni la contraseña. Las filas de más de un día se borran solas al fallar otro intento.
table sf_login_intento {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text clave filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "clave"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
