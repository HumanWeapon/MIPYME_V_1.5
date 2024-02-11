import { Component, OnInit } from '@angular/core';
import { Preguntas } from 'src/app/interfaces/seguridad/preguntas';
import { Preguntas_Usuario } from 'src/app/interfaces/seguridad/preguntasUsuario';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { PreguntasUsuarioService } from 'src/app/services/seguridad/preguntas-usuario.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { DomSanitizer } from '@angular/platform-browser';
import { error } from 'jquery';
import { Router } from '@angular/router';



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
  mostrarCamposContrasena = false;
  mostrarEditarUsuario = true;
  mostrarBotonGuardar: boolean = true;
  mostrarGuardar: boolean = true;
  public imagenes: any = [];
  public previsualizacion: string = '';
  usuarioOriginal!: Usuario;
/********************************************************************************************** */

 listRoles: Roles [] = [];

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

  rolEditando: Roles = {
    id_rol: 0, 
    rol: '', 
    descripcion: '', 
    estado_rol: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
  };

  preguntas: Preguntas_Usuario[] = [];
  listPreguntas: any[] = [];

  constructor(
    private _preguntasUsuarioService: PreguntasUsuarioService,
    private _userService: UsuariosService,
    private toastr: ToastrService,
    private _rolService: RolesService,
    private sanitizer: DomSanitizer,
    private router: Router
    ){}

  ngOnInit(): void {
    this.getUsuario();
    this.getRoles();
  }

  getUsuario(){
    const userLocal = localStorage.getItem('usuario');
    if(userLocal == null){

    }else{
      this.usuario.usuario = userLocal;
      this._userService.getUsuario(this.usuario).subscribe(data => {
        this.usuario = data;
        this.usuarioOriginal = { ...this.usuario }; // Copia del usuario original
      });
    }
  }

  getRoles() {
    this._rolService.getAllRoles().subscribe((res: any) => {
      console.log(res);
      this.listRoles = res;
      // Asigna el rol correspondiente al usuario actual
      const rolUsuario = this.listRoles.find(rol => rol.id_rol === this.usuario.id_rol);
      if (rolUsuario) {
        this.rolEditando = rolUsuario;
      }
    });
  }


  //Bloqueo y Desbloqueo de Inputs
habilitarInput() {
  this.mostrarEditarUsuario = false;
  this.inputDeshabilitado = false;
  this.mostrarCamposContrasena = true; // Mostrar campos al habilitar la edición
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
this.mostrarEditarUsuario = true;
this.mostrarCamposContrasena = false; // Ocultar campos al cancelar la edición
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

// Función para validar el formato de correo electrónico
validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


validarCambios() {
  this.usuario.usuario = this.usuario.usuario.toUpperCase();
  this.usuario.nombre_usuario = this.usuario.nombre_usuario.toUpperCase();
  this.usuario.correo_electronico = this.usuario.correo_electronico.toUpperCase();

  // Validación de correo electrónico
  if (this.usuario.usuario === '' || this.usuario.nombre_usuario === '' || this.usuario.correo_electronico === '') {
    this.toastr.warning('Completa todos los campos');
  } else if (!this.validateEmailFormat(this.usuario.correo_electronico)) {
    this.toastr.warning('El formato del correo electrónico no es válido');
  } else {
    // Realiza la actualización de usuario, nombre y correo
    this._userService.editarUsuario(this.usuario).subscribe((data) => {
      if (data) {
        this.toastr.success('Cambios guardados con éxito', 'Completado');
        this.mostrarBoton = false; // Oculta el botón Cancelar
        this.mostrarEditarUsuario = true; // Muestra el botón Editar Usuario
        this.mostrarCamposContrasena = false; // Oculta los campos de contraseña
        this.botonDeshabilitado = true; // Vuelve a deshabilitar el botón de Guardar Cambios
        this.inputDeshabilitado = true; // Vuelve a deshabilitar los campos de edición
        
        // Redirige a la ruta de login solo si el usuario ha sido modificado
        if (this.usuario.usuario !== this.usuarioOriginal.usuario) {
          this.toastr.warning('Vuelve a iniciar sesión con el nuevo Usuario', 'Atención');
          this.router.navigate(['/login']);
        }
      } else {
        this.toastr.error('Error al guardar los cambios', 'Error');
      }
    });
  }

  // Restablece los campos después de procesar
  this.contrasenaActual = '';
  this.nuevaContrasena = '';
  this.confirmarContrasena = '';
}


validarPassword() {
  // Obtener la contraseña almacenada en el Local Storage
  const userLocal = localStorage.getItem('CCP');

  if (this.contrasenaActual === '') {
    // Contraseña actual no proporcionada, realizar la actualización de usuario, nombre y correo
    this.validarCambios();
  } else {
    // Contraseña actual proporcionada, validar y cambiar la contraseña
    if (this.nuevaContrasena === '' || this.confirmarContrasena === '') {
      this.toastr.warning('Completa todos los campos de contraseña');
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
          this.mostrarBoton = false; // Oculta el botón Cancelar
          this.mostrarEditarUsuario = true; // Muestra el botón Editar Usuario
          this.mostrarCamposContrasena = false; // Oculta los campos de contraseña
          this.botonDeshabilitado = true; // Vuelve a deshabilitar el botón de Guardar Cambios
          this.inputDeshabilitado = true; // Vuelve a deshabilitar los campos de edición
          this.router.navigate(['/login']);
        } else {
          this.toastr.error('Error al actualizar la contraseña', 'error');
        }
      });
    }
  }

  // Restablece los campos después de procesar
  this.contrasenaActual = '';
  this.nuevaContrasena = '';
  this.confirmarContrasena = '';
}

imagenPerfil(event: Event): any {
  // Verificar que event.target no sea nulo
  if (event.target) {
    const imagenCapturada = (event.target as HTMLInputElement).files?.[0];

    // Verificar que se haya seleccionado al menos un archivo
    if (imagenCapturada) {
      this.extraerBase64(imagenCapturada).then((imagen: any) => {
        this.previsualizacion = imagen.base;
        console.log(imagen);

        // Mostrar el botón "Guardar" después de cambiar la imagen
        this.mostrarBotonGuardar = true;
      });
      this.imagenes.push(imagenCapturada);
    } else {
      console.error('No se seleccionó ningún archivo.');
    }
  } else {
    console.error('El evento no tiene un objetivo (target).');
  }
}

extraerBase64 = async ($event: any) => {
  try {
    const unsafeImg = window.URL.createObjectURL($event);
    const imagen = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          blob: $event,
          imagen,
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          blob: $event,
          imagen,
          base: null
        });
      };
    });
  } catch (e) {
    return null;
  }
};

guardarImagen(){

  
}

eliminarEspaciosBlanco(event: any, field: string) {

  setTimeout(() => {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
    this.usuario.usuario = this.usuario.usuario.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo usuario
    this.usuario.contrasena= this.usuario.usuario.toUpperCase(); // Convierte el texto a mayúsculas
    this.usuario.correo_electronico = this.usuario.correo_electronico.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo contraseña
  });
}

convertirAMayusculas(event: any, field: string) {
  const inputValue = event.target.value;
  event.target.value = inputValue.toUpperCase();
}

/*******************************************************************************/
onInputChange(event: any, field: string) {
  if (field === 'usuario' || field === 'nombre_usuario'|| field === 'correo') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}
/************************************************************************************/


}
