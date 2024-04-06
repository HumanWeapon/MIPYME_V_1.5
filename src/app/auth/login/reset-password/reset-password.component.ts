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

  constructor(
    private _userService: UsuariosService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    console.log('Usuario:', this.user.usuario);
    console.log('Correo electrónico:', this.user.correo_electronico);
    this.getUsuario();
  }

  getUsuario() {
    this.user.usuario = localStorage.getItem("usuario");
    console.log(this.user.usuario);
  }

  validarPassword() {
    if (this.confirPassword === '' || this.user.contrasena === '') {
      this.toastr.warning('Por favor completa todos los campos.');
      return;
    }

    if (this.confirPassword !== this.user.contrasena) {
      this.toastr.warning('Las contraseñas no coinciden.');
      return;
    }

    // Validar aquí los criterios de seguridad de la contraseña si es necesario
      this._userService.resetPassword(this.newPassword, this.resetToken)
        .subscribe(
          response => {
            console.log('Contraseña restablecida con éxito');
            this.resetSuccessful = true;
          },
          error => {
            console.error('Error al restablecer la contraseña:', error);
            this.resetError = 'Error al restablecer la contraseña';
          }
        );
    }

  }
    
  

