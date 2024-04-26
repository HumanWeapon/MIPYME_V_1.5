import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormPreguntasComponent } from './login/form-preguntas/form-preguntas.component';
import { CorreoComponent } from './login/correo/correo.component';
import { FirstLoginComponent } from './login/first-login/first-login.component';
import { MetodoComponent } from './login/metodo/metodo.component';
import { RecuperarComponent } from './login/recuperar/recuperar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreguntasUsuarioComponent } from './login/preguntas-usuario/preguntas-usuario.component';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { LoginPymeComponent } from './login-pyme/login-pyme.component';
import { RegisterPymeComponent } from './register-pyme/register-pyme.component';
import { PasswordEmailComponent } from './login/password-email/password-email.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { MensajeCorreoEnviadoComponent } from './login/mensaje-correoenviado/mensaje-correoenviado.componet';



@NgModule({
  declarations: [
    LoginComponent,
    FormPreguntasComponent,
    CorreoComponent,
    FirstLoginComponent,
    MetodoComponent,
    PreguntasUsuarioComponent,
    RecuperarComponent,
    PreguntasUsuarioComponent,
    SpinnerComponent,
    LoginPymeComponent,
    RegisterPymeComponent,
    PasswordEmailComponent,
    ResetPasswordComponent,
    MensajeCorreoEnviadoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
