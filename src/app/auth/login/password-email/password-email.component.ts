import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { ParametrosService } from 'src/app/services/seguridad/parametros.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-password-email',
  templateUrl: './password-email.component.html',
  styleUrls: ['./password-email.component.css']
})
export class PasswordEmailComponent implements OnInit {
  @ViewChild('correoEnviadoModal') correoEnviadoModal: any;

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
  parametroCorreo: any;
  parametroCorreoServidor: any;

  constructor(private router: Router, 
    private usuarioService: UsuariosService,
    private toastr: ToastrService,
    private _parametrosService: ParametrosService,
    private _errorService: ErrorService,
     ) { }

  ngOnInit() {
    this.getParametros();
    this.getParametrosCorreoServidor();
    const usuario: Usuario = history.state.usuario;
    if (usuario) {
      this.getUsuario(usuario);
    }
  }

  getParametros(){
    this._parametrosService.getParametroPuertoCorreo().subscribe({
      next: (data) => {
        this.parametroCorreo = data.valor;
        console.log('El valor del parametro es: '+ data.valor)
      },
    });
  }

  getParametrosCorreoServidor(){
    this._parametrosService.getParametroCorreoServidor().subscribe({
      next: (data) => {
        this.parametroCorreoServidor = data.valor;
        console.log('El valor del correo parametro es: '+ data.valor)
      }
    });
  }

  getUsuario(usuario: Usuario) {
    this.usuarioService.getUsuario(usuario).subscribe(data => {
      this.usuario = data;
      console.log(this.usuario);
    });
  }


  onEnviarCorreo() {
    // Verificar si el correo es válido
    if (!this.validarCorreoElectronico(this.correoElectronico)) {
      this.toastr.warning('Por favor, ingresa un correo electrónico válido.');
      return;
    }
// Verificar si el parámetroCorreo coincide con el parámetroCorreoServidor para el puerto 587
if (this.parametroCorreo === '587' && this.parametroCorreoServidor !== 'ISMAEL.MIDENCE@UNAH.HN') {
  this.toastr.error('Los parámetros no tienen los valores correctos para el puerto 587');
  return;
}

// Verificar si el parámetroCorreo coincide con el parámetroCorreoServidor para el puerto 465
if (this.parametroCorreo === '465' && this.parametroCorreoServidor !== 'ISMAELMIDENCE07@UNAH.HN') {
  this.toastr.error('Los parámetros no tienen los valores correctos para el puerto 465');
  return;
}
    // Verificar si el usuario existe
    this.usuarioService.getOneUsuario(this.usuario.usuario).subscribe(
      (usuario: Usuario) => {
        // Si se encontró el usuario, continuar con el proceso de recuperación de contraseña
        this.usuario = usuario;
        this.usuarioService.usuario = this.usuario;
        localStorage.setItem('usuario', usuario.usuario);
        
        // Verificar si el correo electrónico ingresado coincide con el del usuario
        if (this.correoElectronico !== this.usuario.correo_electronico) {
          this.toastr.error('El correo electrónico ingresado no coincide con el del usuario.');
          return;
        }
  
        // Llamar al servicio para enviar el correo electrónico
        this.usuarioService.forgotPassword(this.correoElectronico).subscribe(
          response => {
            // Aquí puedes navegar a la siguiente página o mostrar otro mensaje según la respuesta del servicio
            this.toastr.success('Correo Enviado Exitosamente');
            // Establecer parametroCorreo en '465' para mostrar el modal
              this.parametroCorreo = '465';
              this.router.navigate(['/mensaje-correoenviado']);
          },
          error => {
            console.error('Error al enviar el correo electrónico:', error);
            this.toastr.error('Error al enviar el correo electrónico.');
          }
        );
      },
      () => {
        // Si no se encontró el usuario, mostrar un mensaje de error
        this.toastr.error('El usuario no existe.');
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

  cerrarModal() {
    this.router.navigate(['/login']);
  }  

}




