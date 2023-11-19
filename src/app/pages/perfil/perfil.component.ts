import { Component, OnInit } from '@angular/core';
import { Preguntas } from 'src/app/interfaces/seguridad/preguntas';
import { Preguntas_Usuario } from 'src/app/interfaces/seguridad/preguntasUsuario';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { PreguntasUsuarioService } from 'src/app/services/seguridad/preguntas-usuario.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})

export class PerfilComponent  implements OnInit{

  contrasenaActual: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
/*************************************************************/
  inputDeshabilitadoPassword: boolean = true; // input Deshabilitado/bloqueado Password
  inputDeshabilitado: boolean = true; // input Deshabilitado/bloqueado
  botonDeshabilitado: boolean = true;
  mostrarBoton: boolean = false; //Oculta el Boton de Cancelar
/********************************************************************************************** */
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
    primer_ingreso: new Date(),
    fecha_vencimiento: new Date(),
    intentos_fallidos: 0
  };
  preguntas: Preguntas_Usuario[] = [];
  listPreguntas: any[] = [];

  constructor(
    private _preguntasUsuarioService: PreguntasUsuarioService,
    private _userService: UsuariosService,
    private toastr: ToastrService,
    ){}

  ngOnInit(): void {
    this.getUsuario();
  }

  getUsuario(){
    const userLocal = localStorage.getItem('usuario');
    if(userLocal == null){

    }else{
      this.usuario.usuario = userLocal;
      this._userService.getUsuario(this.usuario).subscribe(data => {
        this.usuario = data;
      });
    }
  }

  //Bloqueo y Desbloqueo de Inputs
habilitarInput() {
  this.inputDeshabilitado = false;
}

habilitarInputPassword() {
  this.inputDeshabilitadoPassword = false;
}

deshabilitarInput() {
  this.inputDeshabilitado = true;
}
//Fin Bloqueo y Desbloqueos de Inputs

//Metodo de Ocultar/Mostrar Boton
cancelarInput(){
this.mostrarBoton=false;
this.inputDeshabilitado = true;
this.botonDeshabilitado=true;
const userLocal = localStorage.getItem('usuario');
    if(userLocal == null){

    }else{
      this.usuario.usuario = userLocal;
      this._userService.getUsuario(this.usuario).subscribe(data => {
        this.usuario = data;
      });
    }
}

cancelarInputPassword(){
this.mostrarBoton=false;
this.inputDeshabilitado = true;
}

habilitarBoton() {
  this.botonDeshabilitado = false;
}

mostrarboton() {
this.mostrarBoton=true;
this.botonDeshabilitado = false;
}
//Fin Metodo de Ocultar/Mostrar Boton

editarUsuario() {
  this._userService.editarUsuario(this.usuario).subscribe(data => {
    this.toastr.success('Usuario editado con éxito');
    this.usuario.nombre_usuario = this.usuario.nombre_usuario;
    this.usuario.correo_electronico = this.usuario.correo_electronico;
  });
this.mostrarBoton=false;
this.botonDeshabilitado = true;
this.inputDeshabilitado = true;
}

validarPassword() {
  // Obtener la contraseña almacenada en el Local Storage
  const userLocal = localStorage.getItem('CCP')
  if (this.contrasenaActual === '' || this.nuevaContrasena === '' || this.confirmarContrasena === '') {
    this.toastr.warning('Completa todos los campos');
  } else if (this.confirmarContrasena !== this.nuevaContrasena) {
    this.toastr.warning('Las contraseñas no coinciden');
  } else if (userLocal === null) {
    this.toastr.warning('No se encontró una contraseña almacenada en el Local Storage');
  } else if (this.contrasenaActual !== userLocal) {
    this.toastr.warning('La contraseña actual no coincide con la contraseña almacenada');
  } else {
    // Contraseñas coinciden, procede a cambiar la contraseña
    this.usuario.contrasena = this.nuevaContrasena; // Asigna la nueva contraseña
    this._userService.cambiarContrasena(this.usuario).subscribe((data) => {
      if (data) {
        this.toastr.success('Contraseña actualizada con éxito', 'success');
      } else {
        this.toastr.error('Error al actualizar la contraseña', 'error');
      }
    });
  }

  // Restablece los campos y deshabilita el botón después de procesar
  this.contrasenaActual = '';
  this.nuevaContrasena = '';
  this.confirmarContrasena = '';
  this.mostrarBoton = false;
  this.botonDeshabilitado = true;
  this.inputDeshabilitado = true;
}


}

