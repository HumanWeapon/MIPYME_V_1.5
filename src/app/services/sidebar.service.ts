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
      titulo:'Seguridad',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-lock',
      submenu: [
        {titulo:'Usuarios', url: 'usuarios', icono: 'fa fa-users ml-1'},
        {titulo:'Objetos', url: 'objetos', icono: 'fa fa-cubes ml-1'},
        {titulo:'Permisos', url: 'permisos', icono: 'fa fa-user-shield ml-1'},
        {titulo:'Roles', url: 'roles', icono: 'fas fa-solid fa-users-gear ml-1'},
        {titulo:'Preguntas', url: 'preguntas', icono: 'fas fa-solid fa-circle-question ml-1'},
        {titulo:'Parametros', url: 'parametros', icono: 'fas fa-solid fa-chalkboard-user ml-1'}
      ]
    },
    {
      titulo:'Administración',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-wrench',
      submenu: [
        {titulo:' Bitácora', url: 'bitacora', icono: 'fa fa-solid fa-list-ul ml-1'},
        {titulo:'Backups', url: ' ', icono: 'fa fa-users ml-1'},
        {titulo:'Restaurar', url: ' ', icono: 'fa fa-user-shield ml-1'},
      ]
    },
    {
      titulo:'Empresas',
      url: ' ',
      icono: 'nav-icon fas fa-regular fa-building',
      submenu: [
        {titulo:'Requisitos', url: 'requisitos', icono: 'fa fa-users ml-1'},
        {titulo:'Productos', url: 'productos', icono: 'fa fa-user-shield ml-1'},
        {titulo:'Ciudades', url: 'ciudades', icono: 'fas fa-solid fa-address-book ml-1'},
        {titulo:'Contacto', url: 'contacto', icono: 'fas fa-solid fa-address-book ml-1'},
        {titulo:'Contacto Telefono', url: 'contactoTelefono', icono: 'fas fa-solid fa-address-book ml-1'},
        {titulo:'Tipo Direccion', url: 'tipoDireccion', icono: 'fas fa-solid fa-city ml-1'},
        {titulo:'Tipo Contacto', url: 'tipoContacto', icono: 'fas fa-solid fa-address-book ml-1'},
        {titulo:'Tipo Empresa', url: 'tipoEmpresa', icono: 'fas fa-solid fa-address-book ml-1'},
        {titulo:'Contacto telefono', url: 'contactoTelefono', icono: 'fas fa-solid fa-address-book ml-1'},
        {titulo:'Tipo direccion', url: 'tipoDireccion', icono: 'fas fa-solid fa-city ml-1'},
        {titulo:'Tipo contacto', url: 'tipoContacto', icono: 'fas fa-solid fa-address-book ml-1'},
        {titulo:'Categoría de producto', url: 'categoriaproducto', icono: 'fas fa-solid fa-address-book ml-1'},
      ]
    },
    {
      titulo:'PYMES',
      url: ' ',
      icono: 'nav-icon fas fa-solid fa-user',
      submenu: [
        {titulo:'Consultar', url: '', icono: 'fa fa-users ml-1'},
        {titulo:'Mis Consultas', url: '', icono: 'fa fa-users ml-1'},
        {titulo:'Mi Perfil', url: 'perfil-pyme', icono: 'fa fa-solid fa-user ml-1'},
      ]
    },
  ]
  constructor() { }
  
}
