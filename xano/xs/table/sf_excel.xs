// Excels de farmacias que sube administración (botón «Subir Excel»): el archivo tal cual (base64),
// cuándo, quién y el resumen de lo que cambió. Solo admin los lista y descarga.
table sf_excel {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user {
      table = "user"
    }

    text nombre filters=trim
    text archivo
    json resumen?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
