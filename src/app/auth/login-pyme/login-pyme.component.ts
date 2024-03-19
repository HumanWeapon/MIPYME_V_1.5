import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { ErrorService } from 'src/app/services/error.service';


@Component({
  selector: 'app-login-pyme',
  templateUrl: './login-pyme.component.html',
  styleUrls: ['./login-pyme.component.css']
})
export class LoginPymeComponent {

  goToRegister(event: Event) {
    event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
    this.router.navigate(['/register-pyme']); // Navegar a la página de registro
}

goToLogin() {
  this.router.navigate(['/login']); 
}

  nombre_pyme: string = '';
  rtn: string = '';
  loading: boolean = false;
  fecha_ultima_conexion: string = '';

  metodoSeleccionado: string = '';

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
    id_rol: 0
  };

  valorEnviar: string = "";

  constructor(
    private _pymeService: PymeService,
    private _toastr: ToastrService,
    private _errorService: ErrorService,
    private router: Router) {}
  


  eliminarEspaciosBlanco() {
    this.nombre_pyme = this.nombre_pyme.toUpperCase(); // Convierte el texto a mayúsculas
    this.rtn = this.rtn.replace(/\s/g, ''); // Elimina espacios en blanco
  }
  
  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'nombre_pyme') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9]/g, ''); // Solo permite letras y números
      } else if (field === 'rtn') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9@.]/g, ''); // Solo permite letras, números, @ y .
      }
      event.target.value = inputValue;
    });
  }
  

  irLogin() {
    this.router.navigate(['/login']); // Reemplaza '/ruta-del-modulo-pyme' con la ruta real de tu módulo Pyme
  }

  loginPyme() {
    // Validamos que el usuario ingrese datos
    if (this.nombre_pyme == '' || this.rtn == '') {
      this._toastr.error('Todos los campos son obligatorios', 'Error');
      return
    }

    // Creamos el body
    const pyme: Pyme = {
      nombre_pyme: this.nombre_pyme,
      rtn: this.rtn,
      id_pyme: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      estado: 0,
      fecha_ultima_conexion: new Date(),
      id_rol: 0
    }
    
    this.loading = true;

    this._pymeService.loginPyme(pyme).subscribe({
      next: (token) => {
        localStorage.setItem('token', token);
        this.fecha_ultima_conexion = token

        this.getPymes();
        
        if(this.fecha_ultima_conexion == null){
          localStorage.setItem('firstLogin', this.nombre_pyme);
          this.router.navigate(['/firstlogin'])
        }
        else{
          localStorage.setItem('nombre_pyme', this.nombre_pyme);
          localStorage.setItem('CCP',this.rtn);
          this.router.navigate(['dashboard'])
        }
      },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
      this.loading = false;
    }
  })
}

  getPymes(){
    this.getPyme = {
     nombre_pyme: this.nombre_pyme,
     id_pyme: 0,
     creado_por: '',
     fecha_creacion: new Date(),
     modificado_por: '',
     fecha_modificacion: new Date(),
     estado: 0,
     rtn: '',
     fecha_ultima_conexion: new Date(),
     id_rol: 0
   }
   this._pymeService.getPyme(this.getPyme).subscribe({
     next: (data) => {
       this.getPyme = data;
       console.log(data)
     },
     error: (e: HttpErrorResponse) => {
       this._errorService.msjError(e); 
       this.loading = false
     }
   });
 }

}


