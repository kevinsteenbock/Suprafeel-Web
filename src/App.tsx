import { Navigate, Route, Routes, useParams } from 'react-router'
import { Shell } from './app/Shell'
import { adminShell, comercialShell, farmaciaShell } from './app/nav'
import { Login } from './screens/Login'
import { RequireRole } from './app/auth'
import { DatosListos } from './app/datos'
import { useBase } from './app/store'
// compartidas farmacia / comercial
import { Catalogo } from './screens/shared/Catalogo'
import { Producto } from './screens/shared/Producto'
import { Consejo } from './screens/shared/Consejo'
import { Cursos } from './screens/shared/Cursos'
import { PLV } from './screens/shared/PLV'
import { MiLista } from './screens/shared/MiLista'
// farmacia
import { MiComercial } from './screens/farmacia/MiComercial'
import { Ajustes } from './screens/farmacia/Ajustes'
// comercial
import { Hoy } from './screens/comercial/Hoy'
import { Farmacias } from './screens/comercial/Farmacias'
import { Farmacia } from './screens/comercial/Farmacia'
import { AjustesComercial } from './screens/comercial/AjustesComercial'
// admin
import { Cuentas } from './screens/admin/Cuentas'
import { Solicitudes } from './screens/admin/Solicitudes'
import { NuevaCuenta } from './screens/admin/NuevaCuenta'
import { Cuenta } from './screens/admin/Cuenta'
import { AdminPLV } from './screens/admin/AdminPLV'
import { AdminCatalogo } from './screens/admin/AdminCatalogo'
import { AdminProducto } from './screens/admin/AdminProducto'
import { EditarProducto } from './screens/admin/EditarProducto'
import { NuevoProducto } from './screens/admin/NuevoProducto'
import { Resumen } from './screens/admin/Resumen'
import { Comerciales } from './screens/admin/Comerciales'
import { Registro } from './screens/admin/Registro'

/**
 * Direcciones de pantallas que ya no existen (eran de los datos de ejemplo): llevan a su sitio en la
 * zona de la cuenta. `ficha` manda el consejo de un producto a la ficha de ese producto.
 */
function ABase({ to, ficha }: { to: string; ficha?: boolean }) {
  const base = useBase()
  const { id } = useParams()
  return <Navigate to={ficha ? `${base}/catalogo/${id}` : `${base}/${to}`} replace />
}

function SharedRoutes() {
  return (
    <>
      <Route path="catalogo" element={<Catalogo />} />
      <Route path="catalogo/:id" element={<Producto />} />
      <Route path="novedades" element={<Catalogo initialFilter="new" />} />
      <Route path="consejo" element={<Consejo />} />
      <Route path="consejo/:id" element={<ABase to="catalogo" ficha />} />
      <Route path="formacion" element={<Cursos />} />
      <Route path="formacion/*" element={<ABase to="formacion" />} />
      <Route path="plv" element={<PLV />} />
      <Route path="plv/*" element={<ABase to="plv" />} />
      <Route path="mi-lista" element={<MiLista />} />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<RequireRole role="farmacia" />}>
        <Route element={<DatosListos />}>
          <Route path="/farmacia" element={<Shell config={farmaciaShell} />}>
            <Route index element={<Navigate to="catalogo" replace />} />
            {SharedRoutes()}
            <Route path="mi-comercial" element={<MiComercial />} />
            <Route path="ajustes" element={<Navigate to="perfil" replace />} />
            <Route path="ajustes/:section" element={<Ajustes />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RequireRole role="comercial" />}>
        <Route element={<DatosListos />}>
          <Route path="/comercial" element={<Shell config={comercialShell} />}>
            <Route index element={<Navigate to="hoy" replace />} />
            <Route path="hoy" element={<Hoy />} />
            <Route path="farmacias" element={<Farmacias />} />
            <Route path="farmacias/:id" element={<Farmacia />} />
            <Route path="ajustes" element={<AjustesComercial />} />
            {SharedRoutes()}
          </Route>
        </Route>
      </Route>

      <Route element={<RequireRole role="admin" />}>
        <Route element={<DatosListos />}>
          <Route path="/admin" element={<Shell config={adminShell} />}>
            <Route index element={<Navigate to="cuentas" replace />} />
            <Route path="resumen" element={<Resumen />} />
            <Route path="comerciales" element={<Comerciales />} />
            <Route path="registro" element={<Registro />} />
            <Route path="cuentas" element={<Cuentas />} />
            <Route path="cuentas/solicitudes" element={<Solicitudes />} />
            <Route path="cuentas/nueva" element={<NuevaCuenta />} />
            <Route path="cuentas/:id" element={<Cuenta />} />
            <Route path="plv" element={<AdminPLV />} />
            <Route path="plv/*" element={<Navigate to="/admin/plv" replace />} />
            <Route path="catalogo" element={<AdminCatalogo />} />
            <Route path="catalogo/nuevo" element={<NuevoProducto />} />
            <Route path="catalogo/:id" element={<AdminProducto />} />
            <Route path="catalogo/:id/editar" element={<EditarProducto />} />
            <Route path="formacion" element={<Cursos />} />
            <Route path="cursos/*" element={<Navigate to="/admin/formacion" replace />} />
            <Route path="chat/*" element={<Navigate to="/admin/registro" replace />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
