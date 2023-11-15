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
import { TipoDireccionComponent } from './mantenimiento/tipo-direccion/tipo-direccion.component';
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
import { ContactoEmpresasComponent } from './contacto/contacto-empresas/contacto-empresas.component';

const routes: Routes = [
  {path:'dashboard',component:PagesComponent, 
  children:[
    {path: 'dashboard', component: DashboardComponent, data:{titulo: 'Dashboard'}},
    {path: 'perfil', component: PerfilComponent, data:{titulo: 'Mi Perfil'}},
    {path: 'search', component: SearchComponent},

    //ABC grado A.
    {path: 'paises', component: PaisesComponent, data:{titulo: 'Países'}},
    {path: 'ciudades', component:CiudadesComponent, data:{titulo: 'Ciudades'}},
    {path: 'Categoria_productos', component:CategoriaProductosComponent, data:{titulo: 'Categorías de productos'}},
    {path: 'productos', component:ProductosComponent, data:{titulo: 'Productos'}},
    {path: 'tipo_telefono', component:TipoTelefonoComponent, data:{titulo: 'Tipos de teléfono'}},
    {path: 'tipo_direccion', component:TipoDireccionComponent, data:{titulo: 'Tipos de Direccion'}},
    {path: 'tipo_contacto', component:TipoContactoComponent, data:{titulo: 'Tipos de Contacto'}},
    {path: 'tipo_empresa', component:TipoEmpresaComponent, data:{titulo: 'Tipos de Empresa'}},
    {path: 'tipo_requisito', component:TipoRequisitosComponent, data:{titulo: 'Tipos de requisitos'}},
    //ABC modulo seguridad.
    {path: 'usuarios', component: UsuariosComponent, data:{titulo: 'Usuarios'}},
    {path: 'objetos', component: ObjetosComponent, data:{titulo: 'Objetos'}},
    {path: 'permisos', component: PermisosComponent, data:{titulo: 'Permisos'}},
    {path: 'roles', component: RolesComponent, data:{titulo: 'Roles'}},
    {path: 'preguntas', component: PreguntasComponent, data:{titulo: 'Preguntas'}},
    {path: 'parametros', component: ParametrosComponent, data:{titulo: 'Parametros'}},
    {path: 'bitacora', component:BitacoraComponent, data:{titulo: 'Bitácora'}},
    {path: 'backup', component:BackupComponent, data:{titulo: 'Copia de seguridad'}},
    {path: 'restore', component:RestoreComponent, data:{titulo: 'Restaurar'}},
    
    //ABC grado B.
    {path: 'pymes', component:PymeComponent, data:{titulo:'Pyme'}},
    {path: 'empresas', component:EmpresasComponent, data:{titulo:'Empresas'}},
    {path: 'requisitos_exportacion', component:RequisitosExportacionComponent, data:{titulo: 'Requisitos de exportación'}},
    {path: 'empresas_productos', component:EmpresasProductosComponent, data:{titulo: 'Productos de empresas'}},
    {path: 'contacto', component:ContactoComponent, data:{titulo: 'Contacto'}},
    {path: 'contacto_telefono', component:TelefonosComponent, data:{titulo: 'Contacto de teléfono'}},
    {path: 'contacto_direcciones', component:DireccionesComponent, data:{titulo: 'Contacto de direcciones'}},

    //ABC grado C.
    {path: 'contactos', component:ContactoEmpresasComponent, data:{titulo: 'Contactos'}},
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
export class PagesRoutingModule { }
