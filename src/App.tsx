import { Navigate, Route, Routes } from 'react-router'
import { Shell } from './app/Shell'
import { adminShell, comercialShell, farmaciaShell } from './app/nav'
import { Login } from './screens/Login'
// compartidas farmacia / comercial
import { Catalogo } from './screens/shared/Catalogo'
import { Producto } from './screens/shared/Producto'
import { Consejo } from './screens/shared/Consejo'
import { ConsejoProducto } from './screens/shared/ConsejoProducto'
import { Formacion } from './screens/shared/Formacion'
import { Cursos } from './screens/shared/Cursos'
import { Curso } from './screens/shared/Curso'
import { Clase } from './screens/shared/Clase'
import { PLV } from './screens/shared/PLV'
import { Campana } from './screens/shared/Campana'
import { MiLista } from './screens/shared/MiLista'
// farmacia
import { MiComercial } from './screens/farmacia/MiComercial'
import { Ajustes } from './screens/farmacia/Ajustes'
// comercial
import { Hoy } from './screens/comercial/Hoy'
import { Farmacias } from './screens/comercial/Farmacias'
import { Farmacia } from './screens/comercial/Farmacia'
import { Mensajes } from './screens/comercial/Mensajes'
import { AjustesComercial } from './screens/comercial/AjustesComercial'
// admin
import { Cuentas } from './screens/admin/Cuentas'
import { Solicitudes } from './screens/admin/Solicitudes'
import { NuevaCuenta } from './screens/admin/NuevaCuenta'
import { Cuenta } from './screens/admin/Cuenta'
import { AdminPLV } from './screens/admin/AdminPLV'
import { NuevaCampana } from './screens/admin/NuevaCampana'
import { AdminCampana } from './screens/admin/AdminCampana'
import { NuevoMaterial } from './screens/admin/NuevoMaterial'
import { AdminCatalogo } from './screens/admin/AdminCatalogo'
import { AdminProducto } from './screens/admin/AdminProducto'
import { EditarProducto } from './screens/admin/EditarProducto'
import { NuevoProducto } from './screens/admin/NuevoProducto'
import { AdminCursos } from './screens/admin/AdminCursos'
import { CrearCurso } from './screens/admin/CrearCurso'
import { EditarLeccion } from './screens/admin/EditarLeccion'
import { Chat } from './screens/admin/Chat'
import { Resumen } from './screens/admin/Resumen'
import { Comerciales } from './screens/admin/Comerciales'
import { Registro } from './screens/admin/Registro'

function SharedRoutes() {
  return (
    <>
      <Route path="catalogo" element={<Catalogo />} />
      <Route path="catalogo/:id" element={<Producto />} />
      <Route path="novedades" element={<Catalogo initialFilter="new" />} />
      <Route path="consejo" element={<Consejo />} />
      <Route path="consejo/:id" element={<ConsejoProducto />} />
      <Route path="formacion" element={<Formacion />} />
      <Route path="formacion/cursos" element={<Cursos />} />
      <Route path="formacion/cursos/:id" element={<Curso />} />
      <Route path="formacion/cursos/:id/leccion/:n" element={<Clase />} />
      <Route path="plv" element={<PLV />} />
      <Route path="plv/:id" element={<Campana />} />
      <Route path="mi-lista" element={<MiLista />} />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/farmacia" element={<Shell config={farmaciaShell} />}>
        <Route index element={<Navigate to="catalogo" replace />} />
        {SharedRoutes()}
        <Route path="mi-comercial" element={<MiComercial />} />
        <Route path="ajustes" element={<Navigate to="perfil" replace />} />
        <Route path="ajustes/:section" element={<Ajustes />} />
      </Route>

      <Route path="/comercial" element={<Shell config={comercialShell} />}>
        <Route index element={<Navigate to="hoy" replace />} />
        <Route path="hoy" element={<Hoy />} />
        <Route path="farmacias" element={<Farmacias />} />
        <Route path="farmacias/:id" element={<Farmacia />} />
        <Route path="mensajes" element={<Mensajes />} />
        <Route path="ajustes" element={<AjustesComercial />} />
        {SharedRoutes()}
      </Route>

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
        <Route path="plv/nueva" element={<NuevaCampana />} />
        <Route path="plv/:id" element={<AdminCampana />} />
        <Route path="plv/:id/nuevo-material" element={<NuevoMaterial />} />
        <Route path="catalogo" element={<AdminCatalogo />} />
        <Route path="catalogo/nuevo" element={<NuevoProducto />} />
        <Route path="catalogo/:id" element={<AdminProducto />} />
        <Route path="catalogo/:id/editar" element={<EditarProducto />} />
        <Route path="cursos" element={<AdminCursos />} />
        <Route path="cursos/nuevo" element={<CrearCurso />} />
        <Route path="cursos/:id" element={<CrearCurso />} />
        <Route path="cursos/:id/leccion/:n" element={<EditarLeccion />} />
        <Route path="chat" element={<Navigate to="sintomas" replace />} />
        <Route path="chat/:tab" element={<Chat />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
