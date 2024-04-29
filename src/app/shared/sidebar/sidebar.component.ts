import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { da } from 'date-fns/locale';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';
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
  listMenu: any [] = [];
  listSubMenu: any [] = [];

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

  constructor(private _sideBarService: SidebarService, 
    private router:Router,
    private _errorService: ErrorService,
    private _usuarioService: UsuariosService,
    private _pymeService: PymeService
    ){

  }

  ngOnInit(): void {
    this.getUsuario();
    this.menuItems = this._sideBarService.menu;
    const local = localStorage.getItem('usuario');
    if(local !== null){
      this.userName = local;
    };
  }


  consolidadloguin(parametro: any){

  }

  getUsuario(){
    const usuarioStore = localStorage.getItem('usuario');
    const pymeStore = localStorage.getItem('nombre_pyme');
    if(usuarioStore){
      this._usuarioService.getOneUsuario(usuarioStore).subscribe({
        next: (data: any) => {
          this.user = data;
          this.getPermisosRolesObjetos();
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
          this.getPermisosRolesObjetos();
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
  
  getPermisosRolesObjetos() {
    let getlogin: number = 0;
    if(this.user.id_rol){
      getlogin = this.user.id_rol;
    }
    else {
      getlogin = this.getPyme.id_rol;
    }
    this._sideBarService.getPermisosRolesObjetos(getlogin).subscribe({
      next: (data: any) => {
        if (data) {
          // Asigna la lista ordenada a this.listMenu
          this.listMenu = data;
          console.log(this.listMenu)
        }
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  get_id_Objetos(item: any) {
    localStorage.setItem('id_objeto', item);
    console.log(item);
  }

}