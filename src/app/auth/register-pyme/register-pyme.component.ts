import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { ErrorService } from 'src/app/services/error.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';


@Component({
  selector: 'app-register-pyme',
  templateUrl: './register-pyme.component.html',
  styleUrls: ['./register-pyme.component.css']
})
export class RegisterPymeComponent implements OnInit{

  nombre_pyme: string = '';
  rtn: string = '';
  confirmar_rtn: string = '';

  id_rolPyme: number = 0;

 

  newPyme: Pyme = {
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

  constructor(
    private router: Router,
    private _pymesService: PymeService,
    private _errorService: ErrorService,
    private _toastr: ToastrService,
    private http: HttpClient) {}




  ngOnInit(): void {
    this.getRolPyme();
  }

  goToLonginPyme(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login-pyme']);
  }

  NavegarLoginPyme() {
    this.router.navigate(['/login-pyme']);
  }

  eliminarEspaciosBlanco() {
    this.newPyme.nombre_pyme = this.newPyme.nombre_pyme.toUpperCase();
    this.newPyme.nombre_contacto = this.newPyme.nombre_contacto.toUpperCase();
    this.newPyme.correo_contacto = this.newPyme.correo_contacto.toUpperCase();
    this.rtn = this.rtn.replace(/\s/g, ''); // Elimina espacios en blanco del RTN
  }
  
  
  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'nombre_pyme') {
        inputValue = inputValue.replace(/\s/g, ''); // Elimina espacios en blanco
      } else if (field === 'nombre_contacto') {
        // Limita el campo a 3 espacios como máximo
        inputValue = inputValue.replace(/\s{4,}/g, '   ');
      } else if (field === 'correo_contacto') {
        // Elimina espacios en blanco
        inputValue = inputValue.replace(/\s/g, '');
      } else if (field === 'telefono_contacto' || field === 'rtn' || field === 'confirmar_rtn') {
        // Elimina espacios en blanco y otros caracteres no deseados (como letras)
        inputValue = inputValue.replace(/\s/g, '').replace(/[^\d]/g, '');
      }
      event.target.value = inputValue;
    });
  }
  

  getRolPyme(){
    this._pymesService.getRolPyme().subscribe({
      next: (data)=>{
        this.id_rolPyme = data.id_rol;
        console.log(data);
      },
      error:(e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  registrar(): void {
    // Verifica si alguno de los campos está vacío
    if (!this.newPyme.nombre_pyme || !this.newPyme.rtn || !this.confirmar_rtn || !this.newPyme.nombre_contacto || !this.newPyme.correo_contacto || !this.newPyme.telefono_contacto ){
      this._toastr.error('Por favor, complete todos los campos');
      return; 
    }
  
    // Verifica si los RTN exceden los 14 dígitos
    if (this.newPyme.rtn.length !== 14 || this.confirmar_rtn.length !== 14) {
      this._toastr.error('El RTN debe tener exactamente 14 dígitos');
      return; 
    }
  
    // Verifica si los RTN coinciden
    if (this.newPyme.rtn !== this.confirmar_rtn) {
      this._toastr.error('RTN no Coinciden');
      return; 
    }
  
    // Verifica si el formato del correo electrónico es válido
    if (!this.validarCorreoElectronico(this.newPyme.correo_contacto)) {
      this._toastr.error('El formato del correo electrónico no es válido');
      return;
    }
  
    // Verifica si el formato del número de teléfono es válido
    if (!this.validarTelefono(this.newPyme.telefono_contacto)) {
      this._toastr.error('El formato del número de teléfono no es válido');
      return;
    }
  
    // Si todos los campos están llenos y válidos, procede con el registro
    this.newPyme = {
      id_pyme: 0,
      nombre_pyme: this.newPyme.nombre_pyme.toUpperCase(),
      rtn:this.newPyme.rtn,
      creado_por: 'REGISTRO',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      fecha_ultima_conexion: new Date(),
      estado: 1,
      id_rol: this.id_rolPyme,
      nombre_contacto: this.newPyme.nombre_contacto,
      correo_contacto: this.newPyme.correo_contacto, // Convertimos el correo a mayúsculas según tu lógica
      telefono_contacto: this.newPyme.telefono_contacto,
    };
    
    console.log(this.newPyme);
    this._pymesService.PostPyme(this.newPyme).subscribe({
      next: (data) => {
        this._toastr.success('Pyme Agregada Exitosamente');
        // Después de mostrar el mensaje de éxito, redirige al usuario a la página de inicio de sesión
        this.router.navigate(['/login-pyme']);
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  
  validarTelefono(telefono: string): boolean {
    const expresionRegularTelefono = /^[0-9]+$/;
    return expresionRegularTelefono.test(telefono);
  }

  validarCorreoElectronico(correo: string): boolean {
    // Expresión regular para validar el formato del correo electrónico
    const expresionRegularCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Se verifica si el correo electrónico coincide con la expresión regular
    return expresionRegularCorreo.test(correo);
  }
  
}  