import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  newPassword: string = '';
  resetToken: string = '';
  resetSuccessful: boolean = false;
  resetError: string = '';

  user: Usuario | any = {
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    usuario: '',
    nombre_usuario: '',
    correo_electronico: '',
    estado_usuario: false,
    contrasena: '',
    id_rol: 0,
    fecha_ultima_conexion: new Date(),
    primer_ingreso: new Date(),
    fecha_vencimiento: new Date(),
    intentos_fallidos: 0
  };
  confirPassword: string = '';
  token?: string;
  correoElectronico: string = '';

  constructor(
    private _userService: UsuariosService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.params['token'];
    this.getUserByResetToken();
  }

  getUserByResetToken() {
    this._userService.getUserByResetToken(this.resetToken).subscribe(
      (data: Usuario) => {
        this.user = data;
        console.log('Usuario' + this.user)
      },
      error => {
        console.error('Error al obtener usuario por token de restablecimiento:', error);
        this.resetError = 'Error al obtener usuario por token de restablecimiento';
      }
    );
  }

  validarPassword() {
    // Verificar que se hayan completado todos los campos
    if (this.newPassword === '' || this.confirPassword === '') {
      this.toastr.warning('Por favor completa todos los campos.');
      return;
    }
  
    // Verificar si las contraseñas coinciden
    if (this.newPassword !== this.confirPassword) {
      this.toastr.warning('Las contraseñas no coinciden.');
      return;
    }
  
    // Realizar cualquier validación adicional de la contraseña aquí, si es necesario
  
    // Llamar al servicio para restablecer la contraseña
    this._userService.resetPassword(this.newPassword, this.resetToken)
      .subscribe(
        () => {
          // Restablecimiento de contraseña exitoso
          this.toastr.success('Contraseña restablecida con éxito');
          // Redirigir al usuario a la página de inicio de sesión
          this.router.navigate(['/login']);
        },
        error => {
          // Error al restablecer la contraseña
          console.error('Error al restablecer la contraseña:', error);
          this.toastr.error('Error al restablecer la contraseña. Por favor, inténtalo de nuevo más tarde.');
        }
      );
  }
  

  }
    
  

