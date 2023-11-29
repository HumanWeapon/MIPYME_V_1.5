import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { ErrorService } from 'src/app/services/error.service';


@Component({
  selector: 'app-login-pyme',
  templateUrl: './login-pyme.component.html',
  styleUrls: ['./login-pyme.component.css']
})
export class LoginPymeComponent {

  nombre_empresa: string = '';
  rtn: string = '';
  loading: boolean = false;
  ultimaConexion: string = '';

  metodoSeleccionado: string = '';

  getEmpresas: Empresa = {
    id_empresa: 0,
    id_tipo_empresa: 0,
    nombre_empresa: '',
    rtn:'',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0
  };

  valorEnviar: string = "";

  constructor(
    private _empresaService: EmpresaService,
    private _toastr: ToastrService,
    private _router: Router, 
    private _errorService: ErrorService,
    private router: Router) {}
  
  navigateToRegister() {
    this.router.navigate(['/registerpyme']);
  }

  eliminarEspaciosBlanco() {
    this.nombre_empresa = this.nombre_empresa.replace(/\s/g, ''); // Elimina espacios en blanco
    this.nombre_empresa = this.nombre_empresa.toUpperCase(); // Convierte el texto a mayúsculas
    this.rtn = this.rtn.replace(/\s/g, ''); // Elimina espacios en blanco
  }

  irLogin() {
    this.router.navigate(['/login']); // Reemplaza '/ruta-del-modulo-pyme' con la ruta real de tu módulo Pyme
  }

  loginPyme() {
    // Validamos que el usuario ingrese datos
    if (this.nombre_empresa == '' || this.rtn == '') {
      this._toastr.error('Todos los campos son obligatorios', 'Error');
      return
    }

    // Creamos el body
    const empresa: Empresa = {
      nombre_empresa: this.nombre_empresa,
      rtn: this.rtn,
      id_empresa: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      estado: 0,
      id_tipo_empresa: 0,
      descripcion: ''
    }
    
    this.loading = true;

    this._empresaService.loginPyme(empresa).subscribe({
      next: (token) => {
        localStorage.setItem('token', token);
        this.ultimaConexion = token

        this.getEmpresa();
        
        if(this.ultimaConexion == null){
          localStorage.setItem('firstLogin', this.nombre_empresa);
          this._router.navigate(['/firstlogin'])
        }
        else{
          localStorage.setItem('nombre_empresa', this.nombre_empresa);
          localStorage.setItem('CCP',this.rtn);
          this._router.navigate(['dashboard'])
        }
      },
    error: (e: HttpErrorResponse) => {
      console.error('Error en la solicitud:', e);
      this._errorService.msjError(e);
      this.loading = false;
    }
  })
}

  getEmpresa(){
    this.getEmpresas = {
     nombre_empresa: this.nombre_empresa,
     id_empresa: 0,
     creado_por: '',
     fecha_creacion: new Date(),
     modificado_por: '',
     fecha_modificacion: new Date(),
     estado: 0,
     rtn: '',
     id_tipo_empresa: 0,
     descripcion: ''
   }
   this._empresaService.getEmpresa(this.getEmpresas).subscribe({
     next: (data) => {
       this.getEmpresas = data;
       console.log(data)
       this.updateUltimaConexionUsuario()
     },
     error: (e: HttpErrorResponse) => {
       this._errorService.msjError(e);
       this.loading = false
     }
   });
 }

 updateUltimaConexionUsuario(){
  const updateEmpresa = {
    id_empresa: this.getEmpresas.id_empresa,
    creado_por: this.getEmpresas.creado_por,
    fecha_creacion: this.getEmpresas.fecha_creacion,
    modificado_por: this.getEmpresas.modificado_por,
    fecha_modificacion: this.getEmpresas.fecha_modificacion,
    nombre_empresa: this.getEmpresas.nombre_empresa,
    estado: this.getEmpresas.estado,
    rtn: this.getEmpresas.rtn,
    fecha_ultima_conexion: new Date(),
    id_tipo_empresa: this.getEmpresas.id_tipo_empresa,
    descripcion: this.getEmpresas.descripcion
  }
  this._empresaService.editarEmpresa(updateEmpresa).subscribe(data => {
  })
 }


}


