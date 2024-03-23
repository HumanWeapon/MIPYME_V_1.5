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
import { Router } from '@angular/router';
import { PreguntasService } from 'src/app/services/seguridad/preguntas.service';



@Component({
  selector: 'app-perfil',
  templateUrl:'./perfil.component.html',
  styleUrls: ['./perfil.component.css']
})

export class PerfilComponent  implements OnInit{

  contrasenaActual: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
/*************************************************************/
  inputDeshabilitadoPassword: boolean = true; // input Deshabilitado/bloqueado Password
  inputDeshabilitado: boolean = true; // input Deshabilitado/bloqueado
  inputDeshabilitadoP: boolean = true; // input Deshabilitado/bloqueado
  inputDeshabilitadoU: boolean = true; // input Deshabilitado/bloqueado
  botonDeshabilitado: boolean = true;
  botonDeshabilitadoP: boolean = true;
  mostrarBoton: boolean = false; //Oculta el Boton de Cancelar
  mostrarCamposContrasena = false;
  mostrarEditarUsuario = true;
  mostrarEditarPreguntas = true;
  mostrarBotonGuardar: boolean = true;
  mostrarGuardar: boolean = true;
  public imagenes: any = [];
  public previsualizacion: string = '';
  usuarioOriginal!: Usuario;
/********************************************************************************************** */

 listRoles: Roles [] = [];

 loading: boolean = false;
 listPreguntasUsuario: Preguntas_Usuario[] = [];
 listPreguntas: Preguntas[] = [];
 preguntasFiltradas: Preguntas[] = [];
 pregunta: Preguntas[] = [];
 selectedValue: any;
 respuestaValid: boolean = false; 

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
  };

  preguntasUsuario: Preguntas = {
     id_pregunta: 0,
     pregunta:'',
     estado_pregunta: 0,
     creado_por: '',
     fecha_creacion: new Date(),
     fecha_modificacion: new Date(),
     modificado_por: '',
  };

  NewpreguntasUsuario: Preguntas_Usuario = {
    id_preguntas_usuario: 0,
    id_pregunta: 0,
    id_usuario: 0,
    respuesta: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date()
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

  constructor(
    private _preguntasUsuarioService: PreguntasUsuarioService,
    private _preguntasService: PreguntasService,
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
        this.getPreguntasUsuario(); // Llama a getPreguntasUsuario después de que usuario se inicialice
        this.getPreguntas(); // Llama a getPreguntas después de que usuario se inicialice
      });
    }
  }

  conbinarPreguntas(){
    for(const item1 of this.listPreguntas){
      for(const item2 of this.listPreguntasUsuario){
        if(item1.id_pregunta === item2.id_pregunta){
          this.preguntasFiltradas.push(item1)
        }
      }
    }
    console.log('Estas son las preguntas del Usuario' + this.preguntasFiltradas);
  }

  getPreguntas() {
    this._preguntasService.getPreguntas().subscribe(data => {
      // Filtrar las preguntas activas
      this.listPreguntas = data.filter(pregunta => pregunta.estado_pregunta == 1);
  
      // Almacena una copia de las preguntas originales antes de filtrarlas
      this.conbinarPreguntas();
    });
  }

  getPreguntasUsuario() {
    const preguntasUsuario: Preguntas_Usuario = {
      id_preguntas_usuario: 0,
      id_pregunta: 0,
      id_usuario: this.usuario.id_usuario,
      respuesta: '',
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '' ,
      fecha_modificacion: new Date()
    }

    this._preguntasUsuarioService.getPreguntasUsuario(preguntasUsuario).subscribe(data => {
      this.listPreguntasUsuario = (data); // Accede a la propiedad _pregunta del objeto de respuesta

    }, error => {
      // Manejar cualquier error aquí, si es necesario
      console.error('Error al obtener preguntas de usuario:', error);
    });
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

  inputType: string = 'password';
  inputTypeN: string = 'password';
  inputTypeC: string = 'password';

  toggleInputType(inputName: string) {
    this.inputType = this.inputType === 'password' ? 'text' : 'password';
  }

  toggleInputTypeN(inputName: string) {
    this.inputTypeN = this.inputTypeN === 'password' ? 'text' : 'password';
  }

  toggleInputTypeC(inputName: string) {
    this.inputTypeC = this.inputTypeC === 'password' ? 'text' : 'password';
  }

  //Bloqueo y Desbloqueo de Inputs
habilitarInput() {
  this.mostrarEditarUsuario = false;
  this.inputDeshabilitado = false;
  this.mostrarCamposContrasena = true; // Mostrar campos al habilitar la edición
  this.toggleInputType('password');
  this.toggleInputTypeN('password');
  this.toggleInputTypeC('password');
}

habilitarInputPreguntas() {
  this.mostrarEditarPreguntas = false;
  this.inputDeshabilitadoP = false;
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
this.contrasenaActual='';
this.confirmarContrasena='';
this.nuevaContrasena='';
  // Restablecer el tipo de entrada a 'password'
  this.toggleInputType('password');
  this.toggleInputTypeN('password');
  this.toggleInputTypeC('password');
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
this.toggleInputType('password');
this.toggleInputTypeN('password');
this.toggleInputTypeC('password');
}

// Función para validar el formato de correo electrónico
validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

validarCambios() {
  // Convierte los campos a mayúsculas
  this.usuario.usuario = this.usuario.usuario.toUpperCase();
  this.usuario.nombre_usuario = this.usuario.nombre_usuario.toUpperCase();
  this.usuario.correo_electronico = this.usuario.correo_electronico.toUpperCase();

  // Continúa con la validación y procesamiento si se han realizado cambios
  if (this.usuario.usuario === '' || this.usuario.nombre_usuario === '' || this.usuario.correo_electronico === '') {
    this.toastr.warning('Completa todos los campos');
  } else if (!this.validateEmailFormat(this.usuario.correo_electronico)) {
    this.toastr.warning('El formato del correo electrónico no es válido');
  } else {
    // Realiza la actualización de usuario, nombre y correo
    this._userService.editarUsuario(this.usuario).subscribe((data) => {
      if (data) {
        this.toastr.success('Cambios guardados con éxito', 'Completado');
        // Resto del código para ocultar botones, deshabilitar campos, etc.
      } else {
        this.toastr.error('Error al guardar los cambios', 'Error');
      }
    });
  }

  // Restablece los campos después de procesar
  this.mostrarEditarUsuario = true;
  this.mostrarCamposContrasena = false; // Ocultar campos al cancelar la edición
  this.mostrarBoton=false;
  this.inputDeshabilitado = true;
  this.botonDeshabilitado=true;
  this.contrasenaActual='';
  this.confirmarContrasena='';
  this.nuevaContrasena='';

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
  this.toggleInputType('password');
  this.toggleInputTypeN('password');
  this.toggleInputTypeC('password');
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

eliminarCaracteresEspeciales(event: any, field: string) {
  setTimeout(() => {
    let inputValue = event.target.value;

    // Elimina caracteres especiales dependiendo del campo
    if (field === 'respuestaPregunta1' || 'respuestaPregunta2' || 'respuestaPregunta3') {
      inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Solo permite letras, números y espacios en blanco
    }
    event.target.value = inputValue;
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

modoEdicionPregunta1: boolean = false;
modoEdicionPregunta2: boolean = false;
modoEdicionPregunta3: boolean = false;
preguntaSeleccionada1: Preguntas | null = null;
preguntaSeleccionada2: Preguntas | null = null;
preguntaSeleccionada3: Preguntas | null = null;
mostrarBotonCancelar1: boolean = false; //Oculta el Boton de Cancelar Pregunta 1
mostrarBotonCancelar2: boolean = false; //Oculta el Boton de Cancelar Pregunta 2
mostrarBotonCancelar3: boolean = false; //Oculta el Boton de Cancelar Pregunta 3
respuestaPregunta1: string = '';
respuestaPregunta2: string = '';
respuestaPregunta3: string = '';

/****************************************************/
editarPregunta1() {
  this.modoEdicionPregunta1 = true;
  this.mostrarBotonCancelar1 = true; // Mostrar el botón de cancelar al editar la pregunta
}
cancelarEdicionPregunta1() {
  this.modoEdicionPregunta1 = false;
  this.preguntaSeleccionada1 = null;
  this.mostrarBotonCancelar1 = false; // Ocultar el botón de cancelar al cancelar la edición
}
/*****************************************************/

/*****************************************************/
editarPregunta2() {
  this.modoEdicionPregunta2 = true;
  this.mostrarBotonCancelar2 = true; // Mostrar el botón de cancelar al editar la pregunta
}
cancelarEdicionPregunta2() {
  this.modoEdicionPregunta2 = false;
  this.preguntaSeleccionada2 = null;
  this.mostrarBotonCancelar2 = false; // Ocultar el botón de cancelar al cancelar la edición
}
/*****************************************************/

/*****************************************************/
editarPregunta3() {
  this.modoEdicionPregunta3 = true;
  this.mostrarBotonCancelar3 = true; // Mostrar el botón de cancelar al editar la pregunta
}
cancelarEdicionPregunta3() {
  this.modoEdicionPregunta3 = false;
  this.preguntaSeleccionada3 = null;
  this.mostrarBotonCancelar3 = false; // Ocultar el botón de cancelar al cancelar la edición
}
/*****************************************************/

selectedPregunta(e: any){
  this.pregunta[0] = this.pregunta[0];
  this.pregunta[1] = this.pregunta[1];
  this.pregunta[2] = this.pregunta[2];

  this.selectedValue = e.target.value;
  console.log(this.selectedValue)
}

guardarPreguntas1(){

}

guardarPreguntas2(){
  
}

guardarPreguntas3() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal && this.preguntaSeleccionada3) {
    // Extrayendo el ID de pregunta seleccionada
    const idPreguntaSeleccionada = this.preguntaSeleccionada3.id_pregunta;

    // Crear un objeto para almacenar la nueva pregunta y respuesta
    this.NewpreguntasUsuario = {
      id_preguntas_usuario: 0,
      id_pregunta: idPreguntaSeleccionada,
      id_usuario: this.usuario.id_usuario,
      respuesta: this.respuestaPregunta3.trim(), // Trimming para eliminar espacios en blanco al inicio y al final
      creado_por: userLocal,
      fecha_creacion: new Date(),
      modificado_por: userLocal,
      fecha_modificacion: new Date()
    };

    // Llamar al método en el servicio para guardar la nueva pregunta y respuesta
    this._preguntasUsuarioService.postPreguntasUsuario(this.NewpreguntasUsuario).subscribe({
      next: (data) => {
        this.toastr.success('La pregunta y respuesta se guardaron correctamente');
      },
      error: (error) => {
        this.toastr.error('Error al guardar la pregunta y respuesta');
        console.error('Error al guardar la pregunta y respuesta:', error);
      }
    });
  } else {
    // Manejar el caso en que no se ha seleccionado ninguna pregunta
    this.toastr.error('Selecciona una pregunta antes de guardar');
  }
}



}
