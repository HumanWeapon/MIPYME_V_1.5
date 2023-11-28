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
  { path: 'usuarios', component: UsuariosComponent, data:{titulo: 'Usuarios'}},
  { path: 'objetos', component: ObjetosComponent, data:{titulo: 'Objetos'}},
  { path: 'permisos', component: PermisosComponent, data:{titulo: 'Permisos'}},
  { path: 'roles', component: RolesComponent, data:{titulo: 'Roles'}},
  { path: 'preguntas_usuario', component: PreguntasUsuarioComponent, data:{titulo: 'Preguntas'}},
  { path: 'parametros', component: ParametrosComponent, data:{titulo: 'Parametros'}}
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
