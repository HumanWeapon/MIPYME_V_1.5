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

  correoElectronico: string = '';

  constructor(private router: Router, private usuarioService: UsuariosService,
    private toastr: ToastrService) { }

  ngOnInit() {
    const usuario: Usuario = history.state.usuario;
    if (usuario) {
      this.getUsuario(usuario);
    }
  }
  
  getUsuario(usuario: Usuario) {
    this.usuarioService.getUsuario(usuario).subscribe(data => {
      this.usuario = data;
      console.log(this.usuario);
    });
  }

  onEnviarCorreo() {
    if (!this.validarCorreoElectronico(this.correoElectronico)) {
      this.toastr.warning('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (this.correoElectronico !== this.usuario.correo_electronico) {
      this.toastr.error('El correo electrónico ingresado no coincide con el del usuario.');
      return;
    }

    this.toastr.success('El correo electrónico coincide con el del usuario.');

    // Llamar al servicio para enviar el correo electrónico
    this.usuarioService.forgotPassword(this.correoElectronico).subscribe(
      response => {
        this.toastr.success('Correo Enviado');
        // Aquí puedes navegar a la siguiente página o mostrar otro mensaje según la respuesta del servicio
      },
      error => {
        console.error('Error al enviar el correo electrónico:', error);
        this.toastr.error('Error al enviar el correo electrónico.');
      }
    );
  }

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




