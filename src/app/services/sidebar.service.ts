import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  menu:any[]=[

    /*{
      titulo:'Dashboard',
      url: 'dashboard',
      icono: 'nav-icon fas fa-solid fa-user',
      submenu: []
    },*/
    {
      titulo:'Empresas',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-wrench',
      submenu: [
        {titulo:'Empresas', url: 'empresas', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Productos', url: 'empresas_productos', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Requisitos', url: 'requisitos_exportacion', icono: 'far fa-circle nav-icon ml-2'},
      ]
    },
    {
      titulo:'Mantenimiento',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-user',
      submenu: [
        {titulo:'Productos', url: 'productos', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Categoría productos', url: 'Categoria_productos', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Ciudades', url: 'ciudades', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'paises', url: 'paises', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Tipo Empresas', url: 'tipo_empresa', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Tipo contacto', url: 'tipo_contacto', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Tipo dirección', url: 'tipo_direccion', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Tipo teléfono', url: 'tipo_telefono', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Tipo requisitos', url: 'tipo_requisito', icono: 'far fa-circle nav-icon ml-2'}
      ]
    },
    {
      titulo:'Contactos',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-wrench',
      submenu: [
        {titulo:'Contacto', url: 'contacto', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Direcciones', url: 'contacto_direcciones', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Teléfonos', url: 'contacto_telefono', icono: 'far fa-circle nav-icon ml-2'},
      ]
    },
    {
      titulo:'Seguridad',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-lock',
      submenu: [
        {titulo:'Usuarios', url: 'usuarios', icono: 'fas fa-solid fa-users ml-2'},
        {titulo:'Objetos', url: 'objetos', icono: 'fas fa-cubes ml-2'},
        {titulo:'Permisos', url: 'permisos', icono: 'fas fa-user-shield ml-2'},
        {titulo:'Roles', url: 'roles', icono: 'fas fa-solid fa-users-gear ml-2'},
        {titulo:'Preguntas', url: 'preguntas', icono: 'fas fa-solid fa-circle-question ml-2'},
        {titulo:'Parametros', url: 'parametros', icono: 'fas fa-solid fa-chalkboard-user ml-2'}
      ]
    },
    {
      titulo:'Administración',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-wrench',
      submenu: [
        {titulo:'Bitácora', url: 'bitacora', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Backups', url: 'backup', icono: 'far fa-circle nav-icon ml-2'},
        {titulo:'Restaurar', url: 'restore', icono: 'far fa-circle nav-icon ml-2'},
      ]
    }
  ]
  constructor() { }
  
}
