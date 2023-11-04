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
import { PerfilComponent } from '../perfil/perfil.component';
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
import { PymesComponent } from './pymes/pymes/pymes.component';
import { PaisesComponent } from './mantenimiento/paises/paises.component';
import { TipoTelefonoComponent } from './mantenimiento/tipo-telefono/tipo-telefono.component';
import { EmpresasComponent } from './empresas/empresas/empresas.component';
import { EmpresasProductosComponent } from './empresas/empresas-productos/empresas-productos.component';
import { DireccionesComponent } from './contactos/direcciones/direcciones.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RequisitosExportacionComponent } from './empresas/requisitos-exportacion/requisitos-exportacion.component';
import { BackupComponent } from './administracion/backup/backup.component';
import { RestoreComponent } from './administracion/restore/restore.component';

const routes: Routes = [
  {path:'dashboard',component:PagesComponent, 
  children:[
    {path:' ', component:DashboardComponent},
    {path: 'dashboard', component: DashboardComponent, data:{titulo: 'Dashboard'}},
    {path: 'perfil', component: PerfilComponent, data:{titulo: 'Mi Perfil'}},
    {path: 'search', component: SearchComponent, data:{titulo: 'Buscar'}},

    //ABC grado A.
    {path: 'paises', component: PaisesComponent, data:{titulo: 'Administrar Usuarios'}},
    {path: 'ciudades', component:CiudadesComponent, data:{titulo: 'Ciudades'}},
    {path: 'Categoria_productos', component:CategoriaProductosComponent, data:{titulo: 'Tipo de Empresa'}},
    {path: 'productos', component:ProductosComponent, data:{titulo: 'Producto'}},
    {path: 'tipo_telefono', component:TipoTelefonoComponent, data:{titulo: 'Producto'}},
    {path: 'tipo_direccion', component:TipoDireccionComponent, data:{titulo: 'Tipo de Direccion'}},
    {path: 'tipo_contacto', component:TipoContactoComponent, data:{titulo: 'Tipo de Contacto'}},
    {path: 'tipo_empresa', component:TipoEmpresaComponent, data:{titulo: 'Tipo de Empresa'}},
    {path: 'tipo_requisito', component:TipoRequisitosComponent, data:{titulo: 'Tipo de Empresa'}},
    //ABC modulo seguridad.
    {path: 'usuarios', component: UsuariosComponent, data:{titulo: 'Administrar Usuarios'}},
    {path: 'objetos', component: ObjetosComponent, data:{titulo: 'Administrar Objetos'}},
    {path: 'permisos', component: PermisosComponent, data:{titulo: 'Administrar Permisos'}},
    {path: 'roles', component: RolesComponent, data:{titulo: 'Administrar Roles'}},
    {path: 'preguntas', component: PreguntasComponent, data:{titulo: 'Administrar Preguntas'}},
    {path: 'parametros', component: ParametrosComponent, data:{titulo: 'Administrar Parametros'}},
    {path: 'bitacora', component:BitacoraComponent, data:{titulo: 'Bitácora'}},
    {path: 'backup', component:BackupComponent, data:{titulo: 'Bitácora'}},
    {path: 'restore', component:RestoreComponent, data:{titulo: 'Bitácora'}},
    
    //ABC grado B.
    {path: 'pymes', component:PymesComponent, data:{titulo:'Pymes'}},
    {path: 'empresas', component:EmpresasComponent, data:{titulo:'Pymes'}},
    {path: 'requisitos_exportacion', component:RequisitosExportacionComponent, data:{titulo: 'Requisitos'}},
    {path: 'empresas_productos', component:EmpresasProductosComponent, data:{titulo: 'Requisitos'}},
    {path: 'contacto', component:ContactoComponent, data:{titulo: 'Contacto'}},
    {path: 'contacto_telefono', component:TelefonosComponent, data:{titulo: 'Contacto de Telefono'}},
    {path: 'contacto_direcciones', component:DireccionesComponent, data:{titulo: 'Contacto de Telefono'}},
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
