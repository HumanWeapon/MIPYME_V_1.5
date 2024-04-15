import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userName: string = '';
  user: Usuario = {
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

  getPyme: Pyme = {
    id_pyme: 0,
    nombre_pyme: '',
    rtn:'',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    fecha_ultima_conexion: new Date(),
    estado: 0,
    id_rol: 0,
    nombre_contacto: '',
    correo_contacto: '',
    telefono_contacto: '',
  };
  
  constructor(
    private _router:Router,
    private _errorService: ErrorService,
    private _usuarioService: UsuariosService,
    private _pymeService: PymeService){}

  ngOnInit(): void {
    this.getUsuario();
    const local = localStorage.getItem('usuario');
    if(local !== null){
      this.userName = local;
    };
  }

  getUsuario(){
    const usuarioStore = localStorage.getItem('usuario');
    const pymeStore = localStorage.getItem('nombre_pyme');
    if(usuarioStore){
      this._usuarioService.getOneUsuario(usuarioStore).subscribe({
        next: (data: any) => {
          this.user = data;
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
    if(pymeStore){
      this._pymeService.getOnePyme(pymeStore).subscribe({
        next: (data: any) => {
          this.getPyme = data; // Asignar datos de la Pyme
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
  logout(){
    if(this.getPyme.id_rol){
      this._router.navigate(['/login-pyme']);
      localStorage.clear();
    }
    if(this.user.id_rol){
      this._router.navigate(['/login']);
      localStorage.clear();
    }
  }
}
