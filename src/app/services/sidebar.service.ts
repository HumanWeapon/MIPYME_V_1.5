import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})

export class SidebarService {
  menu:any[]=[];
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(
    private _http: HttpClient) {
      this.myAppUrl = environment.endpoint;
      this.myApiUrl = 'api/permisos',
    this.menu = [
      {
        titulo:'Empresas',
        icono: 'nav-icon fas fa-solid fa-building',
        submenu: [
          {titulo:'Empresas', url: 'empresas', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Productos', url: 'productos', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Requisitos', url: 'requisitos_exportacion', icono: 'far fa-circle nav-icon ml-2'},
        ]
      },
      {
        titulo:'Mantenimiento',
        icono: 'nav-icon fas fa-solid fa-wrench',
        submenu: [
          {titulo:'Productos', url: 'productos', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Categoría productos', url: 'Categoria_productos', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Ciudades', url: 'ciudades', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Paises', url: 'paises', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Tipo Empresas', url: 'tipo_empresa', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Tipo contacto', url: 'tipo_contacto', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Tipo dirección', url: 'tipo_direccion', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Tipo teléfono', url: 'tipo_telefono', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Tipo requisitos', url: 'tipo_requisito', icono: 'far fa-circle nav-icon ml-2'}
        ]
      },
      {
        titulo:'Contactos',
        icono: 'nav-icon fas fa-solid fa-address-book',
        submenu: [
          {titulo:'Contacto', url: 'contacto', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Direcciones', url: 'contacto_direcciones', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Teléfonos', url: 'contacto_telefono', icono: 'far fa-circle nav-icon ml-2'},
        ]
      },
      {
        titulo:'Seguridad',
        icono: 'nav-icon fas fa-solid fa-lock',
        submenu: [
          {titulo:'Usuarios', url: 'usuarios', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Objetos', url: 'objetos', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Permisos', url: 'permisos', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Roles', url: 'roles', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Preguntas', url: 'preguntas', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Parametros', url: 'parametros', icono: 'far fa-circle nav-icon ml-2'}
        ]
      },
      {
        titulo:'Administración',
        icono: 'nav-icon fas fa-solid fa-list',
        submenu: [
          {titulo:'Bitácora', url: 'bitacora', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Backups', url: 'backup', icono: 'far fa-circle nav-icon ml-2'},
          {titulo:'Restaurar', url: 'restore', icono: 'far fa-circle nav-icon ml-2'},
        ]
      }
    ]
   }
  getPermisosRolesObjetos(id_rol: any): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this._http.post<any[]>(`${this.myAppUrl}${this.myApiUrl}/permisosRolesObjetos`, id_rol, { headers: headers })
  }
}
