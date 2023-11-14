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
      icono: 'nav-icon fas fa-solid fa-building',
      submenu: [
        {titulo:'Empresas', url: 'empresas', icono: 'fas fa-solid fa-building ml-2'},
        {titulo:'Productos', url: 'productos', icono: 'fas fa-solid fa-cart-shopping ml-2'},
        {titulo:'Requisitos', url: 'requisitos_exportacion', icono: 'fas fa-solid fa-list-check ml-2'},
      ]
    },
    {
      titulo:'Mantenimiento',
      icono: 'nav-icon fas fa-solid fa-wrench',
      submenu: [
        {titulo:'Productos', url: 'productos', icono: 'fas fa-solid fa-cart-shopping ml-2'},
        {titulo:'Categoría productos', url: 'Categoria_productos', icono: 'fas fa-solid fa-rectangle-list ml-2'},
        {titulo:'Ciudades', url: 'ciudades', icono: 'fas fa-solid fa-city ml-2'},
        {titulo:'Paises', url: 'paises', icono: 'fas fa-solid fa-earth-europe ml-2'},
        {titulo:'Tipo Empresas', url: 'tipo_empresa', icono: 'fas fa-solid fa-building ml-2'},
        {titulo:'Tipo contacto', url: 'tipo_contacto', icono: 'fas class="fa-solid fa-address-card ml-2'},
        {titulo:'Tipo dirección', url: 'tipo_direccion', icono: 'fas fa-solid fa-map-location-dot ml-2'},
        {titulo:'Tipo teléfono', url: 'tipo_telefono', icono: 'fas fa-solid fa-blender-phone ml-2'},
        {titulo:'Tipo requisitos', url: 'tipo_requisito', icono: 'fas fa-solid fa-list-check ml-2'}
      ]
    },
    {
      titulo:'Contactos',
      icono: 'nav-icon fas fa-solid fa-address-book',
      submenu: [
        {titulo:'Contacto', url: 'contacto', icono: 'fas fa-solid fa-address-book ml-2'},
        {titulo:'Direcciones', url: 'contacto_direcciones', icono: 'fas fa-solid fa-route ml-2'},
        {titulo:'Teléfonos', url: 'contacto_telefono', icono: 'fas fa-solid fa-phone ml-2'},
      ]
    },
    {
      titulo:'Seguridad',
      icono: 'nav-icon fas fa-solid fa-lock',
      submenu: [
        {titulo:'Usuarios', url: 'usuarios', icono: 'fas fa-users ml-2'},
        {titulo:'Objetos', url: 'objetos', icono: 'fas fa-cubes ml-2'},
        {titulo:'Permisos', url: 'permisos', icono: 'fas fa-user-shield ml-2'},
        {titulo:'Roles', url: 'roles', icono: 'fas fa-solid fa-users-gear ml-2'},
        {titulo:'Preguntas', url: 'preguntas', icono: 'fas fa-solid fa-circle-question ml-2'},
        {titulo:'Parametros', url: 'parametros', icono: 'fas fa-solid fa-chalkboard-user ml-2'}
      ]
    },
    {
      titulo:'Administración',
      icono: 'nav-icon fas fa-solid fa-list',
      submenu: [
        {titulo:'Bitácora', url: 'bitacora', icono: 'fas fa-solid fa-book ml-2'},
        {titulo:'Backups', url: 'backup', icono: 'fas fa-solid fa-floppy-disk ml-2'},
        {titulo:'Restaurar', url: 'restore', icono: 'fas fa-solid fa-trash-arrow-up ml-2'},
      ]
    }
  ]
  constructor() { }
  
}
