import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { data } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { Preguntas } from 'src/app/interfaces/seguridad/preguntas';
import { Preguntas_Usuario } from 'src/app/interfaces/seguridad/preguntasUsuario';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { ParametrosService } from 'src/app/services/seguridad/parametros.service';
import { PreguntasUsuarioService } from 'src/app/services/seguridad/preguntas-usuario.service';
import { PreguntasService } from 'src/app/services/seguridad/preguntas.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-first-login',
  templateUrl: './first-login.component.html',
  styleUrls: ['./first-login.component.css']
})
export class FirstLoginComponent {
  parametroPreguntas: any;
  usuario: Usuario = {
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    usuario: '',
    nombre_usuario: '',
    correo_electronico: '',
    estado_usuario: 0,
    contrasena: '',
    id_rol: 0,
    fecha_ultima_conexion: new Date(),
    fecha_vencimiento: new Date(),
    intentos_fallidos: 0
  }
  PreguntaUsuario: Preguntas_Usuario = {
    id_preguntas_usuario: 0,
    id_pregunta: 0,
    id_usuario: 0,
    respuesta: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date()
  }
  preguntas: Preguntas[] = [];
  idPregunta: number[] = [];
  respuesta: string[] = [];

  constructor(
    private toastr: ToastrService,
    private _preguntasUsuario: PreguntasUsuarioService,
    private router: Router,
    private _usuarioService: UsuariosService,
    private _preguntasService: PreguntasService,
    private _parametrosService: ParametrosService,
    private _errorService: ErrorService
    ){
      
  }

  ngOnInit(): void {
    this.getParametros();
    this.getPreguntas();
    this.getUsuario();
  }
  getParametros(){
    this._parametrosService.getParametroPreguntasdeSeguridad().subscribe({
      next: (data) => {
        this.parametroPreguntas = data.valor;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  getPreguntas(){
    this._preguntasService.getAllPreguntas().subscribe(data => {
      this.preguntas = data;
    });
  }
  getUsuario(){
    const user = localStorage.getItem('firstLogin');
    if (user !== null) {
      this.usuario.usuario = user;
      this._usuarioService.getUsuario(this.usuario).subscribe(data => {
        this.usuario = data;
      });
    } else {
      // Manejar el caso en el que 'usuario' no se encuentra en el localStorage
    }
  }
  updateUltimaConexionUsuario(update: Usuario){
    this._usuarioService.editarUsuario(update).subscribe(data => {
      console.log(data)
    })
  }

  PostPreguntaUsuario(){
    if(this.respuesta[0] == null || this.respuesta[1] == null || this.respuesta[2] == null){
      this.toastr.warning('Responde a las preguntas seleccionadas');
    }if(this.idPregunta[0] == null || this.idPregunta[1] == null || this.idPregunta[2] == null){
      this.toastr.warning('Hay preguntas sin seleccionar');
    }
    if(this.idPregunta[0] == this.idPregunta[1] || this.idPregunta[0] == this.idPregunta[2]){
      this.toastr.warning('Las preguntas no se deben repetir');
    }
    if(this.idPregunta[1] == this.idPregunta[0] || this.idPregunta[1] == this.idPregunta[2]){
      this.toastr.warning('Las preguntas no se deben repetir');
    }
    if(this.idPregunta[2] == this.idPregunta[0] || this.idPregunta[2] == this.idPregunta[1]){
      this.toastr.warning('Las preguntas no se deben repetir');
    }
    else{
      for (let i = 0; i < this.idPregunta.length; i++) {
        const preguntaUsuario = {
          id_preguntas_usuario: this.usuario.id_usuario,
          id_pregunta: this.idPregunta[i],
          id_usuario: this.usuario.id_usuario,
          respuesta: this.respuesta[i],
          creado_por: this.usuario.usuario.toUpperCase(),
          fecha_creacion: new Date(),
          modificado_por: this.usuario.usuario.toUpperCase(),
          fecha_modificacion: new Date()
        };
        this._preguntasUsuario.postPreguntasUsuario(preguntaUsuario).subscribe(data => {
          this.toastr.success('Pregunta registrada exitosamente');
          this.router.navigate(['/recuperar'])
        });
      }
      
      const updateUsuario = {
        id_usuario: this.usuario.id_usuario,
        creado_por: this.usuario.creado_por,
        fecha_creacion: this.usuario.fecha_creacion,
        modificado_por: this.usuario.modificado_por,
        fecha_modificacion: this.usuario.fecha_modificacion,
        usuario: this.usuario.usuario,
        nombre_usuario: this.usuario.nombre_usuario,
        correo_electronico: this.usuario.correo_electronico,
        estado_usuario: this.usuario.estado_usuario,
        contrasena: this.usuario.contrasena,
        id_rol: this.usuario.id_rol,
        fecha_ultima_conexion: new Date(),
        fecha_vencimiento: this.usuario.fecha_vencimiento,
        intentos_fallidos: this.usuario.intentos_fallidos
      }
      this.updateUltimaConexionUsuario(updateUsuario);
    }
  }

  convertirAMayusculas(): void {
    this.respuesta[0] = this.respuesta[0].toUpperCase();
    this.respuesta[1] = this.respuesta[1].toUpperCase();
    this.respuesta[2] = this.respuesta[2].toUpperCase(); // Convierte el valor a mayúsculas
  }
}
