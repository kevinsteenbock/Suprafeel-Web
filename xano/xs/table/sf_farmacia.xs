// Farmacias de Suprafeel Soft. Solo se leen con sesión (GET /farmacias): admin ve todas, un comercial
// las de su rep y una farmacia la suya. Los datos no viven en el repositorio.
// formacion = '' | hecha | prevista | pendiente | rechazada · formacion_fecha = YYYY-MM-DD · formacion_hora = HH:MM
// zona = Cataluña | Baleares | Canarias · lineal = ids de producto (slug de la tabla products)
table sf_farmacia {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text slug filters=trim|lower
    text code? filters=trim
    text name filters=trim
    text nombre_comercial? filters=trim
    text city? filters=trim
    text owner? filters=trim
    text address? filters=trim
    text postal? filters=trim
    text rep filters=trim
    text zona? filters=trim
    int refs?=0
    text[] lineal?
    text formacion? filters=trim
    text formacion_fecha? filters=trim
    text formacion_hora? filters=trim
    text formacion_nota? filters=trim
    text telefono? filters=trim
    text codigo_cliente? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "slug"}]}
    {type: "btree", field: [{name: "rep"}]}
  ]
}
