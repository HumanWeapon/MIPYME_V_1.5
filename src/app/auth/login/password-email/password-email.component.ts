import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-password-email',
  templateUrl: './password-email.component.html',
  styleUrls: ['./password-email.component.css']
})
export class PasswordEmailComponent implements OnInit {

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

  correoElectronico: string = ''; // Variable para almacenar el correo electrónico

  constructor(private router: Router, private _usuarioService: UsuariosService,
    private _toastr: ToastrService,) {}

    ngOnInit() {
      // Obtener el usuario pasado desde el componente anterior
      const usuario: Usuario = history.state.usuario;
      if (usuario) {
        // Llamar al método getUsuario() con el usuario obtenido
        this.getUsuario(usuario);
      }
    }
    
    getUsuario(usuario: Usuario) {
      // Utiliza el usuario recibido como parámetro en lugar de obtenerlo de localStorage
      this._usuarioService.getUsuario(usuario).subscribe(data => {
        // Actualiza la propiedad usuario con los datos obtenidos del servicio
        this.usuario = data;
        console.log(this.usuario);
      });
    }

    onEnviarCorreo() {
      // Validar si el correo electrónico es válido (por ejemplo, utilizando una expresión regular)
      if (!this.validarCorreoElectronico(this.correoElectronico)) {
        // Si el correo electrónico no es válido, muestra un mensaje de error
        this._toastr.warning('Por favor, ingresa un correo electrónico válido.');
        return;
      }
  
      // Verificar si el correo electrónico ingresado coincide con el correo electrónico del usuario
      if (this.correoElectronico !== this.usuario.correo_electronico) {
        // Si el correo electrónico no coincide, muestra un mensaje de error
        this._toastr.error('El correo electrónico ingresado no coincide con el del usuario.');
        return;
      }
      
      // Si el correo electrónico coincide con el del usuario, muestra un mensaje de éxito
      this._toastr.success('El correo electrónico coincide con el del usuario.');
  
      // Aquí puedes implementar la lógica para enviar el correo electrónico
      console.log('Correo electrónico válido:', this.correoElectronico);
    }
  
  

  // Función para validar el formato del correo electrónico utilizando una expresión regular
  validarCorreoElectronico(correoElectronico: string): boolean {
    const expresionRegularCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionRegularCorreo.test(correoElectronico);
  }

  eliminarEspaciosBlanco(event: any, field: string) {
    setTimeout(() => {
      const inputValue = event.target.value;
      event.target.value = inputValue.toUpperCase();
      this.correoElectronico = this.correoElectronico.toUpperCase();
      this.correoElectronico = this.correoElectronico.replace(/\s/g, '');
      this.usuario.usuario = this.usuario.usuario.toUpperCase();
      this.usuario.usuario = this.usuario.usuario.replace(/\s/g, '');
    });
  }

  navigateMetodo() {
    this.router.navigate(['/metodo']);
  }
  
}



