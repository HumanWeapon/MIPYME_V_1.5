import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { data } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent implements OnInit{

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
  }
  passnew: string = '';
  confirPassword: string = '';

  constructor(
    private _userService: UsuariosService,
    private toastr: ToastrService,
    private router: Router,
  ){}
  ngOnInit(): void {
    this.getUsuario();
  }

  getUsuario() {
    this.user.usuario = localStorage.getItem("usuario");
    this._userService.getUsuario(this.user).subscribe(data => {
      this.user = data;
    });
    console.log(this.user.usuario);
  }

  validarPassword() {
    // Verificar si los campos de contraseña están completos
    if (this.confirPassword === '' || this.passnew === '') {
      this.toastr.warning('Por favor completa todos los campos.');
      return;
    }
  
    // Verificar si las contraseñas coinciden
    if (this.confirPassword !== this.passnew) {
      this.toastr.warning('Las contraseñas no coinciden.');
      return;
    }
  
    // Definir las reglas de validación de la contraseña
    const longitudMinima = 8; // Mínimo 8 caracteres
    const tieneMayusculas = /[A-Z]/.test(this.passnew);
    const tieneMinusculas = /[a-z]/.test(this.passnew);
    const tieneNumeros = /[0-9]/.test(this.passnew);
    const tieneCaracteresEspeciales = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.passnew);
  
    // Realizar la validación de la contraseña
    if (this.passnew.length < longitudMinima) {
      this.toastr.warning(`La nueva contraseña debe tener al menos ${longitudMinima} caracteres`);
      return;
    }
  
    if (!tieneMayusculas || !tieneMinusculas || !tieneNumeros || !tieneCaracteresEspeciales) {
      this.toastr.warning('La nueva contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un caracter especial');
      return;
    }
  
    // Si la contraseña pasa todas las validaciones, proceder a cambiarla
    this.user.contrasena = this.passnew;
    this._userService.cambiarContrasena(this.user).subscribe(
      (data) => {
        this.toastr.success('¡Contraseña actualizada con éxito!', 'Éxito');
        this.router.navigate(['/login']);
        localStorage.clear();
      },
      (error) => {
        if (error.status === 400) {
          this.toastr.error('No se pudo cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.', 'Error');
        } else {
          this.toastr.error('Se produjo un error inesperado. Por favor, inténtalo de nuevo más tarde.', 'Error');
        }
      }
    );
  }
  
  
}
