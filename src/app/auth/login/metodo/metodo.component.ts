import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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

  constructor(private router: Router, private _usuarioService: UsuariosService,
    private _toastr: ToastrService,){
  }


  // ...

  onSubmit() {
    // Verificar si el campo de usuario está vacío
    if (!this.usuario.usuario.trim()) {
      // Si está vacío, muestra un mensaje de error
      this._toastr.warning('Por favor, escriba un nombre de usuario.');
      return; // Detener la ejecución del método
    }
  
    // Continuar con el resto del código si hay un usuario en el campo
  
    // Verificar si el usuario existe
    this._usuarioService.getOneUsuario(this.usuario.usuario).subscribe(
      (usuario: Usuario) => {
        // Si se encontró el usuario, continuar con el proceso de recuperación de contraseña
        this.usuario = usuario;
        this._usuarioService.usuario = this.usuario;
  
        // Aquí puedes acceder a this.selectedOption para determinar cuál opción se seleccionó
        if (this.selectedOption === 'correo') {
          this.navigateCorreo(usuario);
          // Navegar al método de restablecer contraseña por correo electrónico
        } else if (this.selectedOption === 'preguntas') {
          // Navegar al método de restablecer contraseña por preguntas de seguridad
          this.navigatePreguntas();
        }
      },
      () => {
        // Si no se encontró el usuario, mostrar un mensaje de error
        this._toastr.error('El usuario no existe.');
      }
    );
  }
  
  convertirAMayusculas(event: any, field: string) {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
  }

  eliminarEspaciosBlanco(event: any, field: string) {
    setTimeout(() => {
      const inputValue = event.target.value;
      event.target.value = inputValue.toUpperCase();
      this.usuario.usuario = this.usuario.usuario.toUpperCase();
      this.usuario.usuario = this.usuario.usuario.replace(/\s/g, '');
    });
  }
  
  navigateLogin() {
    this.router.navigate(['/login'])
  }

  navigatePreguntas() {
    this.router.navigate(['/preguntas'])
  }

  navigateCorreo(usuario: Usuario) {
    this.router.navigate(['/password-email'], { state: { usuario } });
  }
}
