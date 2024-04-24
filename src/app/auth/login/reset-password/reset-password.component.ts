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
  correoElectronico: string = '';

  constructor(
    private _userService: UsuariosService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.params['token'];
    const userLocal = localStorage.getItem('usuario');
    if(userLocal == null){

    }else{
      this.user.usuario = userLocal;
    }
  }

  validarPassword() {
    // Comprueba si las contraseñas están completas
    if (this.confirPassword === '' || this.newPassword === '') {
        this.toastr.warning('Por favor completa todos los campos.');
        return;
    }
  
    // Comprueba si las contraseñas coinciden
    if (this.confirPassword !== this.newPassword) {
        this.toastr.warning('Las contraseñas no coinciden.');
        return;
    }
  
    // Definir las reglas de validación de la contraseña
    const longitudMinima = 8; // Mínimo 8 caracteres
    const tieneMayusculas = /[A-Z]/.test(this.newPassword);
    const tieneMinusculas = /[a-z]/.test(this.newPassword);
    const tieneNumeros = /[0-9]/.test(this.newPassword);
    const tieneCaracteresEspeciales = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.newPassword);
  
    // Realizar la validación de la contraseña
    if (this.newPassword.length < longitudMinima) {
        this.toastr.warning(`La nueva contraseña debe tener al menos ${longitudMinima} caracteres`);
        return;
    }
  
    if (!tieneMayusculas || !tieneMinusculas || !tieneNumeros || !tieneCaracteresEspeciales) {
        this.toastr.warning('La nueva contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un caracter especial');
        return;
    }
  
    // Si la contraseña pasa todas las validaciones, proceder a restablecerla
    this._userService.resetPassword(this.newPassword, this.resetToken)
        .subscribe(
            response => {
                // Maneja la respuesta exitosa
                console.log('Contraseña restablecida con éxito');
                this.resetSuccessful = true;
                this.toastr.success('Contraseña Recuperada Exitosamente.');
                this.router.navigate(['/login']);
            },
            error => {
                // Maneja el error
                console.error('Error al restablecer la contraseña:', error);
                if (error.status === 401 && error.error && error.error.message === 'El enlace o token ha expirado. Por favor, solicita un nuevo enlace de restablecimiento de contraseña.') {
                    this.toastr.error(error.error.message);
                } else {
                    //this.toastr.error('Error al restablecer la contraseña');
                }
            }
        );
}

}
    
  

