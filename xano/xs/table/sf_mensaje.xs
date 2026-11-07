// Lo que las farmacias le mandan a la administradora: tipo = escribir | formacion | duda.
// estado = pendiente | atendido. La farmacia ve los de su farmacia con la respuesta; admin los ve todos.
table sf_mensaje {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user {
      table = "user"
    }

    text tipo filters=trim
    text farmacia_slug filters=trim
    text farmacia_nombre? filters=trim
    text autor? filters=trim
    text texto? filters=trim
    text fecha_preferida? filters=trim
    text hora_preferida? filters=trim
    text estado?="pendiente" filters=trim
    text respuesta? filters=trim
    timestamp respondido_at?
    text correo?="sin_configurar" filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "farmacia_slug"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
