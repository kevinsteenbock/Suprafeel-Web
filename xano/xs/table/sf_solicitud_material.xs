// Solicitudes de material publicitario. La farmacia sale de la sesión o se comprueba contra el comercial, nunca se
// fía de lo que mande el navegador. foto_ruta = archivo privado: se firma al enseñarlo. correo = sin_configurar | enviado | error.
table sf_solicitud_material {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user {
      table = "user"
    }

    text farmacia_slug filters=trim
    text farmacia_nombre? filters=trim
    text contacto filters=trim
    text direccion filters=trim
    text material filters=trim
    int unidades?=1
    decimal ancho_cm?
    decimal alto_cm?
    text ubicacion? filters=trim
    text foto_ruta? filters=trim
    text estado?="pendiente" filters=trim
    text correo?="sin_configurar" filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
