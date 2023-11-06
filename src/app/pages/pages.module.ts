import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { SearchComponent } from './search/search.component';
import { PermisosComponent } from './seguridad/permisos/permisos.component';
import { RolesComponent } from './seguridad/roles/roles.component';
import { ParametrosComponent } from './seguridad/parametros/parametros.component';
import { BitacoraComponent } from './administracion/bitacora/bitacora.component';
import { PaisesComponent } from './mantenimiento/paises/paises.component';
import { TipoDireccionComponent } from './mantenimiento/tipo-direccion/tipo-direccion.component';
import { TipoContactoComponent } from './mantenimiento/tipo-contacto/tipo-contacto.component';
import { TipoRequisitosComponent } from './mantenimiento/tipo-requisitos/tipo-requisitos.component';
import { CiudadesComponent } from './mantenimiento/ciudades/ciudades.component';
import { CategoriaProductosComponent } from './mantenimiento/categoria-productos/categoria-productos.component';
import { ProductosComponent } from './mantenimiento/productos/productos.component';
import { TipoTelefonoComponent } from './mantenimiento/tipo-telefono/tipo-telefono.component';
import { TipoEmpresaComponent } from './mantenimiento/tipo-empresa/tipo-empresa.component';
import { EmpresasComponent } from './empresas/empresas/empresas.component';
import { RequisitosExportacionComponent } from './empresas/requisitos-exportacion/requisitos-exportacion.component';
import { EmpresasProductosComponent } from './empresas/empresas-productos/empresas-productos.component';
import { ContactoComponent } from './contactos/contacto/contacto.component';
import { TelefonosComponent } from './contactos/telefonos/telefonos.component';
import { DireccionesComponent } from './contactos/direcciones/direcciones.component';
import { UsuariosComponent } from './seguridad/usuarios/usuarios.component';
import { PagesComponent } from './pages.component';
import { ObjetosComponent } from './seguridad/objetos/objetos.component';
import { PreguntasComponent } from './seguridad/preguntas/preguntas.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RestoreComponent } from './administracion/restore/restore.component';
import { BackupComponent } from './administracion/backup/backup.component';
import { PymeComponent } from './pyme/pyme.component';



@NgModule({
  declarations: [
    UsuariosComponent,
    SearchComponent,
    PermisosComponent,
    RolesComponent,
    ParametrosComponent,
    BitacoraComponent,
    PaisesComponent,
    TipoDireccionComponent,
    TipoContactoComponent,
    TipoRequisitosComponent,
    CiudadesComponent,
    CategoriaProductosComponent,
    ProductosComponent,
    TipoTelefonoComponent,
    TipoEmpresaComponent,
    EmpresasComponent,
    RequisitosExportacionComponent,
    EmpresasProductosComponent,
    ContactoComponent,
    TelefonosComponent,
    DireccionesComponent,
    PagesComponent,
    ObjetosComponent,
    PreguntasComponent,
    DashboardComponent,
    RestoreComponent,
    BackupComponent,
    PymeComponent
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    RouterModule,
    SharedModule,
    FormsModule
  ],
  exports:[
    PagesComponent
  ]
})
export class PagesModule { }
