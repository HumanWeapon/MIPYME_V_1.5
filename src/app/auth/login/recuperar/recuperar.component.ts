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
    console.log(this.user.usuario);
  }

  validarPassword(){
    if(this.confirPassword === '' || this.user.contrasena === ''){
      this.toastr.warning('Completa todos los campos');
    }
    if(this.confirPassword !== this.user.contrasena){
      this.toastr.warning('Las contraseñas no coinciden');
    }
    else{
      this._userService.cambiarContrasena(this.user).subscribe((data) => {
        if(data){
          this.toastr.success('Contraseña actualizada con éxito','success');
          this.router.navigate(['/login'])
        }else{
          this.toastr.error('Completa todos los campos', 'error');
        }
        
      });
    }
  }
}
