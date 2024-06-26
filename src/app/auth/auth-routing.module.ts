import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MetodoComponent } from './login/metodo/metodo.component';
import { CorreoComponent } from './login/correo/correo.component';
import { RecuperarComponent } from './login/recuperar/recuperar.component';
import { FirstLoginComponent } from './login/first-login/first-login.component';
import { PreguntasUsuarioComponent } from './login/preguntas-usuario/preguntas-usuario.component';
import { LoginPymeComponent } from './login-pyme/login-pyme.component';
import { PasswordEmailComponent } from './login/password-email/password-email.component';
import { ResetPasswordComponent } from '../auth/login/reset-password/reset-password.component';
import { SearchComponent } from '../pages/search/search.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { PymeComponent } from '../pages/pyme/pyme.component';
import { BackupComponent } from '../pages/administracion/backup/backup.component';
import { RestoreComponent } from '../pages/administracion/restore/restore.component';
import { MensajeCorreoEnviadoComponent } from './login/mensaje-correoenviado/mensaje-correoenviado.componet';



const routes: Routes =[
  {path: 'login', component: LoginComponent},
  {path: 'metodo', component: MetodoComponent},
  {path: 'preguntas', component: PreguntasUsuarioComponent},
  {path: 'correo', component: CorreoComponent},
  {path: 'recuperar', component: RecuperarComponent},
  {path: 'firstlogin', component: FirstLoginComponent},
  {path: 'login-pyme', component: LoginPymeComponent},
  {path: 'password-email', component: PasswordEmailComponent},
  {path: 'mensaje-correoenviado', component: MensajeCorreoEnviadoComponent},
  {path: 'reset-password/:token', component: ResetPasswordComponent },
  {path: 'search', component: SearchComponent },
  {path: 'dashboard', component: DashboardComponent },
  {path: 'pymes', component: PymeComponent },
  { path: 'backup', component: BackupComponent },
  { path: 'restaurar', component: RestoreComponent },


];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports:[
    RouterModule
  ]
})
export class AuthRoutingModule { }