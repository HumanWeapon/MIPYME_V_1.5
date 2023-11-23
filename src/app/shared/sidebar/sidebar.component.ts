import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  menuItems:any[]=[];
  userName: string = '';
  listObjetos: any [] = [];

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
    primer_ingreso: new Date(),
    fecha_vencimiento: new Date(),
    intentos_fallidos: 0
  };

  constructor(private _sideBarService: SidebarService, 
    private router:Router,
    private _errorService: ErrorService,
    private _usuarioService: UsuariosService){

  }

  ngOnInit(): void {
    this.getUsuario();
    //this.getPermisosRolesObjetos();
    this.menuItems = this._sideBarService.menu;
    const local = localStorage.getItem('usuario');
    if(local !== null){
      this.userName = local;
    };
  }

  logout(){
    this.router.navigateByUrl('/login');
    localStorage.clear();
  }

  getUsuario(){
    const usuarioStore = localStorage.getItem('usuario');
    if(usuarioStore){
      this._usuarioService.getOneUsuario(usuarioStore).subscribe({
        next: (data: any) => {
          console.log(data);
          this.user = data;
          console.log(this.user);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
  getPermisosRolesObjetos(){
    console.log(this.user.id_rol)
    this._sideBarService.getPermisosRolesObjetos(this.user.id_rol).subscribe({
      next: (data: any) => {
        console.log(data);
        this.listObjetos = data;
        console.log(this.listObjetos);
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
}
