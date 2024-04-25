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

respuestas: string[] = [];
nuevasRespuestas: string[] = [];
modoEdicionPregunta: boolean = false;
preguntasSeleccionadas: number[] = [];
preguntasSeleccionadasOriginal: any[] = [];
respuestasOriginal: string[] = [];
/********************************************/
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

  preguntasUsuario: Preguntas_Usuario = {
     id_pregunta: 0,
     id_preguntas_usuario: 0,
     id_usuario: 0,
     respuesta: '',
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

  guardando: boolean = false;

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
    this.conbinarPreguntas();
    this.getPreguntasUsuario();
    this.getRoles();
    this.getPreguntas();
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
        this.conbinarPreguntas();
      });
    }
  }

  conbinarPreguntas() {
    this.preguntasFiltradas = this.listPreguntas.filter(pregunta =>
      this.listPreguntasUsuario.some(preguntaUsuario => preguntaUsuario.id_pregunta === pregunta.id_pregunta)
    );
  
    console.log('Estas son las preguntas del Usuario:', this.preguntasFiltradas);
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

  // Definir las reglas de validación de la contraseña
  const longitudMinima = 8; // Mínimo 8 caracteres
  const tieneMayusculas = /[A-Z]/.test(this.nuevaContrasena);
  const tieneMinusculas = /[a-z]/.test(this.nuevaContrasena);
  const tieneNumeros = /[0-9]/.test(this.nuevaContrasena);
  const tieneCaracteresEspeciales = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.nuevaContrasena);

  // Realizar la validación de la contraseña
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
      this.toastr.warning('No se encontró una contraseña almacenada en la Base de Datos');
    } else if (this.contrasenaActual !== userLocal) {
      this.toastr.warning('La contraseña actual no coincide con la contraseña almacenada');
    } else if (this.nuevaContrasena.length < longitudMinima) {
      this.toastr.warning(`La nueva contraseña debe tener al menos ${longitudMinima} caracteres`);
    } else if (!tieneMayusculas || !tieneMinusculas || !tieneNumeros || !tieneCaracteresEspeciales) {
      this.toastr.warning('La nueva contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un caracter especial');
    } else {
      // Contraseña válida, procede a cambiarla
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
editarPregunta() {
  this._preguntasService.getPreguntas().subscribe(data => {
    this.listPreguntas = data;
    this.modoEdicionPregunta = true;
  });
}

cancelarEdicionPregunta() {

  // Restaurar los datos originales
  this.preguntasSeleccionadas = [...this.preguntasSeleccionadasOriginal];
  this.respuestas = [...this.respuestasOriginal];
  this.modoEdicionPregunta = false;
}

/*******************************************************************************************************/
idPregunta: number[] = [];
respuesta: string[] = [];
preguntas: any[] = []; // Asegúrate de inicializar preguntas como un arreglo vacío
parametroPreguntas: any;

range(count: number): number[] {
  return Array(count).fill(0).map((x, i) => i);
}

GuardarNuevasPreguntasEdicion() {
  // Verificar que todos los campos estén llenos
  if (!this.preguntasSeleccionadas.every(pregunta => pregunta)) {
    this.toastr.warning('Selecciona las preguntas y responde las seleccionadas');
    return;
  }

  // Verificar que no haya preguntas repetidas
  const preguntasUnicas = new Set(this.preguntasSeleccionadas);
  if (preguntasUnicas.size !== this.preguntasSeleccionadas.length) {
    this.toastr.warning('Las preguntas no deben repetirse');
    return;
  }

  // Antes de guardar, mostrar las respuestas
  console.log('Respuestas antes de guardar:', this.respuestas);

  // Convertir las respuestas a mayúsculas
  const respuestasEnMayuscula = this.respuestas.map(respuesta => respuesta.toUpperCase());

  // Eliminar las preguntas anteriores del usuario
  this._preguntasUsuarioService.deletePreguntasUsuario(this.usuario.id_usuario).subscribe(() => {
    // Guardar cada pregunta de usuario
    this.preguntasSeleccionadas.forEach((preguntaId, index) => {
      // Verificar si el select está vacío
      if (preguntaId === 0) {
        this.toastr.warning('Selecciona una pregunta para cada campo');
        return;
      }

      const preguntaUsuario = {
        id_preguntas_usuario: this.usuario.id_usuario,
        id_pregunta: preguntaId,
        id_usuario: this.usuario.id_usuario,
        respuesta: respuestasEnMayuscula[index], // Utilizar la respuesta en mayúscula
        creado_por: this.usuario.usuario.toUpperCase(),
        fecha_creacion: new Date(),
        modificado_por: this.usuario.usuario.toUpperCase(),
        fecha_modificacion: new Date()
      };

      // Llamar al servicio para guardar cada pregunta de usuario
      this._preguntasUsuarioService.postPreguntasUsuario(preguntaUsuario).subscribe(data => {
        this.toastr.success('Preguntas registradas exitosamente');     
        // Navegar a la página de recuperar después de guardar todas las preguntas
        if (index === this.preguntasSeleccionadas.length - 1) {
          // Después de guardar todas las preguntas, cargar nuevamente las preguntas del usuario
          this.modoEdicionPregunta = false;
          location.reload();
        }
      });
    });

    // Después de guardar, mostrar las respuestas nuevamente
    console.log('Respuestas después de guardar:', respuestasEnMayuscula);
  });

  // Actualizar la última conexión del usuario
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
  };
  console.log(updateUsuario);
  this.updateUltimaConexionUsuario(updateUsuario);
}


updateUltimaConexionUsuario(update: Usuario){
  this._userService.editarUsuario(update).subscribe(data => {
  })
}

todosLosCamposLlenos(): boolean {
  for (let i = 0; i < this.preguntasFiltradas.length; i++) {
    if (!this.preguntasSeleccionadas[i] || !this.respuestas[i]) {
      return false;
    }
  }
  return true;
}


}
