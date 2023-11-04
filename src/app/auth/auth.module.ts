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



@NgModule({
  declarations: [
    LoginComponent,
    FormPreguntasComponent,
    CorreoComponent,
    FirstLoginComponent,
    MetodoComponent,
    PreguntasUsuarioComponent,
    RecuperarComponent,
    PreguntasUsuarioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
