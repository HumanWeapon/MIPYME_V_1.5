import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { UsuariosComponent } from './seguridad/usuarios/usuarios.component';
import { PagesComponent } from './pages.component';
import { ObjetosComponent } from './seguridad/objetos/objetos.component';
import { PermisosComponent } from './seguridad/permisos/permisos.component';
import { RolesComponent } from './seguridad/roles/roles.component';
import { PreguntasComponent } from './seguridad/preguntas/preguntas.component';
import { ParametrosComponent } from './seguridad/parametros/parametros.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ProductosComponent } from './mantenimiento/productos/productos.component';
import { TipoRequisitosComponent } from './mantenimiento/tipo-requisitos/tipo-requisitos.component';
import { CiudadesComponent } from './mantenimiento/ciudades/ciudades.component';
import { TipoContactoComponent } from './mantenimiento/tipo-contacto/tipo-contacto.component';
import { TipoEmpresaComponent } from './mantenimiento/tipo-empresa/tipo-empresa.component';
import { ContactoComponent } from './contactos/contacto/contacto.component';
import { TelefonosComponent } from './contactos/telefonos/telefonos.component';
import { BitacoraComponent } from './administracion/bitacora/bitacora.component';
import { CategoriaProductosComponent } from './mantenimiento/categoria-productos/categoria-productos.component';
import { PaisesComponent } from './mantenimiento/paises/paises.component';
import { TipoTelefonoComponent } from './mantenimiento/tipo-telefono/tipo-telefono.component';
import { EmpresasComponent } from './empresas/empresas/empresas.component';
import { EmpresasProductosComponent } from './empresas/empresas-productos/empresas-productos.component'; 
import { DireccionesComponent } from './contactos/direcciones/direcciones.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RequisitosExportacionComponent } from './empresas/requisitos-exportacion/requisitos-exportacion.component';
import { BackupComponent } from './administracion/backup/backup.component';
import { RestoreComponent } from './administracion/restore/restore.component';
import { PymeComponent } from './pyme/pyme.component';
import { SeguridadComponent } from './seguridad/seguridad.component';
import { AdministracionComponent } from './administracion/administracion.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { OperacionesEmpresasComponent } from './empresas/operaciones-empresas/operaciones-empresas.component';
import { TipoDireccionComponent } from './mantenimiento/tipo-direccion/tipo-direccion.component';
import { HistorialBusquedaComponent } from './historial-busqueda/historial-busqueda.component';
import { PerfilPymeComponent } from './perfil_pyme/perfil_pyme.component';
import { HistorialPymeComponent } from './historial-pyme/historial-pyme.component';
import { AuthGuard } from '../utils/auth.guard';
import { PermisosGuard } from '../utils/routes.guard';


const routes: Routes = [
  {path:'dashboard',component:PagesComponent, canActivate: [AuthGuard],
  children:[
    //RUTAS DEL SIDEBAR
    //ABC modulo seguridad.
    { path: 'seguridad', component: SeguridadComponent, data:{titulo: 'COMPONENTES DE SEGURIDAD'}},
    { path: 'usuarios', component: UsuariosComponent, data:{titulo: 'Usuarios'}},
    { path: 'objetos', component: ObjetosComponent, canActivate: [PermisosGuard], data:{titulo: 'Objetos'}},
    { path: 'permisos', component: PermisosComponent, canActivate: [PermisosGuard], data:{titulo: 'Permisos'}},
    { path: 'roles', component: RolesComponent, canActivate: [PermisosGuard], data:{titulo: 'Roles'}},
    { path: 'preguntas_usuario', component: PreguntasComponent, canActivate: [PermisosGuard], data:{titulo: 'Preguntas'}},
    { path: 'parametros', component: ParametrosComponent, canActivate: [PermisosGuard], data:{titulo: 'Parámetros'}},

   //ABC modulo administracion.
    { path: 'administracion', component: AdministracionComponent, data:{titulo: 'COMPONENTES DE ADMINISTRACION'}},
    { path: 'bitacora', canActivate: [PermisosGuard], component:BitacoraComponent, data:{titulo: 'Bitácora'}},
    { path: 'backup', canActivate: [PermisosGuard], component:BackupComponent, data:{titulo: 'Backup & Restore'}},
    { path: 'restore', canActivate: [PermisosGuard], component:RestoreComponent, data:{titulo: 'Restaurar'}},
    
    //ABC modulo mantenimiento.
    { path: 'mantenimiento', component: MantenimientoComponent, data:{titulo: 'COMPONENTES DE MANTENIMIENTO'}},
    { path: 'paises', component: PaisesComponent, canActivate: [PermisosGuard], data:{titulo: 'Países'}},
    { path: 'ciudades', component:CiudadesComponent, canActivate: [PermisosGuard], data:{titulo: 'Ciudades'}},
    { path: 'Categoria_productos', component:CategoriaProductosComponent, canActivate: [PermisosGuard], data:{titulo: 'Categorías de productos'}},
    { path: 'productos', component:ProductosComponent, canActivate: [PermisosGuard], data:{titulo: 'Productos'}},
    { path: 'tipo_telefono', component:TipoTelefonoComponent, canActivate: [PermisosGuard], data:{titulo: 'Tipos de teléfono'}},
    { path: 'tipo_contacto', component:TipoContactoComponent, canActivate: [PermisosGuard], data:{titulo: 'Tipos de Contacto'}},
    { path: 'tipo_empresa', component:TipoEmpresaComponent, canActivate: [PermisosGuard], data:{titulo: 'Tipos de Empresa'}},
    { path: 'tipo_direccion', component:TipoDireccionComponent, canActivate: [PermisosGuard], data:{titulo: 'Tipos de direcciones'}},
    { path: 'tipo_requisito', component:TipoRequisitosComponent, canActivate: [PermisosGuard], data:{titulo: 'Requisitos de Exportación'}},
    
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],  data:{titulo: 'Dashboard'}},
    { path: 'perfil', component: PerfilComponent, canActivate: [PermisosGuard], data:{titulo: 'Mi Perfil'}},
    { path: 'perfil_pyme', component: PerfilPymeComponent, canActivate: [PermisosGuard], data:{titulo: 'Mi Perfil Pyme'}},
    { path: 'search', component: SearchComponent, canActivate: [PermisosGuard]},
    { path: 'historial_busqueda', component: HistorialBusquedaComponent, canActivate: [PermisosGuard], data:{titulo: 'Búsquedas PYME'}},
    { path: 'historial_busqueda_pyme', component: HistorialPymeComponent, canActivate: [PermisosGuard], data:{titulo: 'Mis Búsquedas'}},


    //ABC grado B.
    { path: 'pymes', component:PymeComponent, canActivate: [PermisosGuard], data:{titulo:'Pyme'}},
    { path: 'empresas', component:EmpresasComponent, canActivate: [PermisosGuard], data:{titulo:'Empresas'}},
    { path: 'operaciones_empresas', component:OperacionesEmpresasComponent, canActivate: [PermisosGuard], data:{titulo:'Operaciones Empresas'}},
    { path: 'requisitos_exportacion', component:RequisitosExportacionComponent, canActivate: [PermisosGuard], data:{titulo: 'Requisitos de exportación'}},
    { path: 'empresas_productos', component:EmpresasProductosComponent, canActivate: [PermisosGuard], data:{titulo: 'Productos de empresas'}},
    { path: 'contactos', component:ContactoComponent, canActivate: [PermisosGuard], data:{titulo: 'Contacto'}},
    { path: 'telefonos', component:TelefonosComponent, canActivate: [PermisosGuard], data:{titulo: 'Teléfonos'}},
    { path: 'direcciones', component:DireccionesComponent, canActivate: [PermisosGuard], data:{titulo: 'Direcciones de Empresa'}},
    //ABC grado C.
    //{ path: 'contactos', component:ContactoEmpresasComponent, data:{titulo: 'Contactos'}},

  ]}
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class PagesRoutingModule {
 }