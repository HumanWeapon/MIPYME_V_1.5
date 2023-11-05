import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Pyme } from 'src/app/interfaces/pyme';


@Component({
  selector: 'app-login-pyme',
  templateUrl: './login-pyme.component.html',
  styleUrls: ['./login-pyme.component.css']
})
export class LoginPymeComponent {

  pyme: string = '';
  contrasena: string = '';
  loading: boolean = false;

  getPyme: Pyme = {
    id_pyme: 0,
    nombre_pyme: '',
    categoria: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0
  };

  constructor(private router: Router) {}
  
  navigateToRegister() {
    this.router.navigate(['/registerpyme']);
  }

  eliminarEspaciosBlanco() {
    this.pyme = this.pyme.replace(/\s/g, ''); // Elimina espacios en blanco
    this.pyme = this.pyme.toUpperCase(); // Convierte el texto a mayúsculas
    this.contrasena = this.contrasena.replace(/\s/g, ''); // Elimina espacios en blanco
  }








}
