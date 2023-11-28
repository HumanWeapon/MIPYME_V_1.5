import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ObjetosComponent } from './objetos/objetos.component';
import { PermisosComponent } from './permisos/permisos.component';
import { RolesComponent } from './roles/roles.component';
import { PreguntasUsuarioComponent } from 'src/app/auth/login/preguntas-usuario/preguntas-usuario.component';
import { ParametrosComponent } from './parametros/parametros.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

]


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class SeguridadRoutingModule { }
