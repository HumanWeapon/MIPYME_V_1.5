import { Component, OnInit } from '@angular/core';
import { Preguntas } from 'src/app/interfaces/seguridad/preguntas';
import { ToastrService } from 'ngx-toastr';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { Router } from '@angular/router';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { ErrorService } from 'src/app/services/error.service';
import { Pyme } from 'src/app/interfaces/pyme/pyme';


@Component({
  selector: 'app-perfil_pyme',
  templateUrl:'./perfil_pyme.component.html',
  styleUrls: ['./perfil_pyme.component.css']
})

export class PerfilPymeComponent  implements OnInit{

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
  mostrarEditarPyme = true;
  mostrarEditarPreguntas = true;
  mostrarBotonGuardar: boolean = true;
  mostrarGuardar: boolean = true;
  public imagenes: any = [];
  public previsualizacion: string = '';
  pymeOriginal!: Pyme;
  esPyme: boolean = true; // Inicialmente se establece en falso

/********************************************************************************************** */

 listRoles: Roles [] = [];

 getPyme: Pyme = {
  id_pyme: 0,
  nombre_pyme: '',
  rtn:'',
  creado_por: '',
  fecha_creacion: new Date(),
  modificado_por: '',
  fecha_modificacion: new Date(),
  fecha_ultima_conexion: new Date(),
  estado: 0,
  id_rol: 0,
  nombre_contacto: '',
  correo_contacto: '',
  telefono_contacto: '',
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
  sanitizer: any;


constructor(
  private _pymeService: PymeService,
  private _toastr: ToastrService,
  private _errorService: ErrorService,
  private _rolService: RolesService,
  private router: Router
) {}

  ngOnInit(): void {
    this.getPymes();
    this.getRoles();
  }

  getPymes(){
    const pymeLocal = localStorage.getItem('nombre_pyme');
    if(pymeLocal == null){
  
    } else {
      this.getPyme.nombre_pyme = pymeLocal;
      this._pymeService.getPyme(this.getPyme).subscribe(data => {
        this.getPyme = data;
        this.pymeOriginal = { ...this.getPyme }; // Copia del usuario original
        this.getPyme.telefono_contacto = this.formatPhoneNumber(this.getPyme.telefono_contacto); // Aplicar formato al número de teléfono
      });
    }
  }

  formatPhoneNumber(phoneNumber: string): string {
    // Elimina todos los caracteres que no son dígitos
    let formattedPhoneNumber = phoneNumber.replace(/\D/g, ''); 
    
    // Formatea el número separando en grupos de cuatro
    formattedPhoneNumber = formattedPhoneNumber.replace(/(\d{4})(\d{4})/, '$1-$2');
  
    return formattedPhoneNumber; // Devuelve el número de teléfono formateado
  }
  

  getRoles() {
    this._rolService.getAllRoles().subscribe((res: any) => {
      console.log(res);
      this.listRoles = res;
      // Asigna el rol correspondiente al usuario actual
      const rolPyme = this.listRoles.find(rol => rol.id_rol === this.getPyme.id_rol);
      if (rolPyme) {
        this.rolEditando = rolPyme;
      }
    });
  }

  //Bloqueo y Desbloqueo de Inputs
habilitarInput() {
  this.mostrarEditarPyme = false;
  this.inputDeshabilitado = false;
}

deshabilitarInput() {
  this.inputDeshabilitado = true;
}
//Fin Bloqueo y Desbloqueos de Inputs

//Metodo de Ocultar/Mostrar Boton
cancelarInput(){
this.mostrarEditarPyme = true;
this.mostrarBoton=false;
this.inputDeshabilitado = true;
this.botonDeshabilitado=true;



const pymeLocal = localStorage.getItem('nombre_pyme');
    if(pymeLocal == null){

    }else{
      this.getPyme.nombre_pyme = pymeLocal;
      this._pymeService.getPyme(this.getPyme).subscribe(data => {
        this.getPyme = data;
      });
    }
}


habilitarBoton() {
  this.botonDeshabilitado = false;
}

mostrarboton() {
this.mostrarBoton=true;
this.botonDeshabilitado = false;
}

// Función para validar el formato de correo electrónico
validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

validarCambios() {
  // Convierte los campos a mayúsculas
  this.getPyme.nombre_pyme = this.getPyme.nombre_pyme.toUpperCase();
  this.getPyme.nombre_contacto = this.getPyme.nombre_contacto.toUpperCase();
  this.getPyme.correo_contacto = this.getPyme.correo_contacto.toUpperCase();

  // Continúa con la validación y procesamiento si se han realizado cambios
  if (this.getPyme.nombre_pyme === '' || this.getPyme.nombre_contacto === '' || this.getPyme.correo_contacto === '') {
    this._toastr.warning('Completa todos los campos');
  } else if (!this.validateEmailFormat(this.getPyme.correo_contacto)) {
    this._toastr.warning('El formato del correo electrónico no es válido');
    const pymeLocal = localStorage.getItem('nombre_pyme');
    if(pymeLocal == null){

    }else{
      this.getPyme.nombre_pyme = pymeLocal;
      this._pymeService.getPyme(this.getPyme).subscribe(data => {
        this.getPyme = data;
      });
    }
  } else {
    // Realiza la actualización de usuario, nombre y correo
    this._pymeService.editarPyme(this.getPyme).subscribe((data) => {
      if (data) {
        this._toastr.success('Cambios guardados con éxito', 'Completado');
        // Resto del código para ocultar botones, deshabilitar campos, etc.
      } else {
        this._toastr.error('Error al guardar los cambios', 'Error');
      }
    });
  }

  // Restablece los campos después de procesar
  this.mostrarEditarPyme = true;
  this.mostrarBoton=false;
  this.inputDeshabilitado = true;
  this.botonDeshabilitado=true;
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
    this.getPyme.nombre_pyme = this.getPyme.nombre_pyme.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo usuario
    this.getPyme.nombre_contacto = this.getPyme.nombre_contacto.toUpperCase(); // Convierte el texto a mayúsculas
    this.getPyme.correo_contacto = this.getPyme.correo_contacto.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo contraseña
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
  if (field === 'nombre_pyme' || field === 'nombre_contacto'|| field === 'correo_contacto') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}

}
