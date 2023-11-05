import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-metodo',
  templateUrl: './metodo.component.html',
  styleUrls: ['./metodo.component.css']
})
export class MetodoComponent {

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
  selectedOption: string = 'correo'; // Valor predeterminado

  constructor(private router: Router, private _usuarioService: UsuariosService){
  }


  // ...

  onSubmit() {
    this.usuario = this.usuario;
    this._usuarioService.usuario = this.usuario;
    localStorage.setItem("usuario" , this.usuario.usuario);

    // Aquí puedes acceder a this.selectedOption para determinar cuál opción se seleccionó
    if (this.selectedOption === 'correo') {
      // Navegar al método de restablecer contraseña por correo electrónico
    } else if (this.selectedOption === 'preguntas') {
      // Navegar al método de restablecer contraseña por preguntas de seguridad
      this.navigatePreguntas();
    }
  }

  

  navigateLogin() {
    this.router.navigate(['/login'])
  }

  navigatePreguntas() {
    this.router.navigate(['/preguntas'])
  }
}
