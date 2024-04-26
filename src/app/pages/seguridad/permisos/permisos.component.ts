import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Permisos } from 'src/app/interfaces/seguridad/permisos';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { HttpErrorResponse } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { da, es, th } from 'date-fns/locale'; // Importa el idioma español
import { SubmenuData } from 'src/app/interfaces/subMenuData/subMenuData'; 
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit, OnDestroy {

  permisos: any; 
  submenusData: SubmenuData[] = [];
  objetosPrincipales: any[] | undefined;
  submenuSeleccionado: string | undefined;
  objetosFiltrados: any[] | undefined; // Lista de objetos filtrados
  roles: Roles[] = [];
  objetos: Objetos[] = [];
  permisoSeleccionado: any;
  permisoAnterior: any;

  id_rol: number = 0;
  id_objeto: number = 0;
  objetosSinRol: any[] = [];


  permisoeditando: Permisos = {
    id_permisos: 0,
    id_rol: 0,
    id_objeto: 0,
    permiso_consultar: false,
    permiso_insercion: false,
    permiso_actualizacion: false,
    permiso_eliminacion: false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };

  nuevoPermiso: Permisos = {
    id_permisos: 0,
    id_rol: 0,
    id_objeto: 0,
    permiso_consultar: false,
    permiso_insercion: false,
    permiso_actualizacion: false,
    permiso_eliminacion: false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };

  deletePermiso: Permisos = {
    id_permisos: 0,
    id_rol: 0,
    id_objeto: 0,
    permiso_consultar: false,
    permiso_insercion: false,
    permiso_actualizacion: false,
    permiso_eliminacion: false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };
  
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPermisos: Permisos[] = [];
  data: any;
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _permService: PermisosService, 
    private _objectService: ObjetosService,
    private _rolesService: RolesService, 
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filtrarObjetosPorTipo();
    this.getAllObjetos();
    this.getAllRoles();

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    };

    this._permService.getAllPermisos().subscribe({
      next: (data) =>{
      this.listPermisos = data;
      this.dtTrigger.next(0);
      }
    });
  this.getUsuario();
}

    /*this._permService.getAllPermisos().subscribe((res: any) => {
      this.listPermisos = res;
      this.dtTrigger.next(null);
    });
    this.getUsuario();
  }*/

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  idRol(event: Event): void {
    const idRol = (event.target as HTMLSelectElement).value;
    this.id_rol = Number(idRol);
    this.getobjetosSinRol();
  }
  idObjeto(event: Event): void{
    const idObjeto = (event.target as HTMLSelectElement).value;
    this.id_objeto = Number(idObjeto);
  }
  vaciarIdObjeto(){
    this.objetosSinRol = [];
  }
  getobjetosSinRol(){
    this._permService.objetosSinRol(this.id_rol).subscribe({
      next: (data) => {
        this.objetosSinRol = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    })
  }

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
  }
  
  getAllRoles() {
    this._rolesService.getAllRoles().subscribe(data => {
      this.roles = data.filter(rol => rol.estado_rol == 1);
    });
  }

  filtrarObjetosPorTipo() {
    if (this.submenuSeleccionado) {
      // Filtrar los objetos por el tipo seleccionado (basado en el submenu)
      this.objetosFiltrados = this.objetos.filter(objeto => objeto.tipo_objeto === this.submenuSeleccionado);
    } else {
      // Si no se ha seleccionado ningún submenu, mostrar todos los objetos
      this.objetosFiltrados = this.objetos;
    }
  }

  getAllObjetos() {
    this._objectService.getAllObjetos().subscribe((data: Objetos[]) => {
      this.objetos = data.filter(obj => obj.estado_objeto == 1);
    
      // Filtrar los objetos principales
      this.objetosPrincipales = this.objetos.filter(obj => obj.descripcion === 'MENUSIDEBAR');
  
      // Filtrar los submenús y asociar los datos con cada submenu
      this.submenusData = [
        { descripcion: 'BUSCAR PRODUCTOS', datos: this.objetos.filter(obj => obj.descripcion === 'BUSCAR PRODUCTOS') },
        { descripcion: 'DASHBOARD', datos: this.objetos.filter(obj => obj.descripcion === 'DASHBOARD') },
        { descripcion: 'PYMES', datos: this.objetos.filter(obj => obj.descripcion === 'PYMES') },
        { descripcion: 'EMPRESAS', datos: this.objetos.filter(obj => obj.descripcion === 'EMPRESAS') },
        { descripcion: 'SEGURIDAD', datos: this.objetos.filter(obj => obj.descripcion === 'SEGURIDAD') },
        { descripcion: 'ADMINISTRACION', datos: this.objetos.filter(obj => obj.descripcion === 'ADMINISTRACION') },
        { descripcion: 'MANTENIMIENTO', datos: this.objetos.filter(obj => obj.descripcion === 'MANTENIMIENTO') }
      ];
    });
  }


// Variable de estado para alternar funciones

toggleFunction(permiso: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (permiso.estado_permiso == 1 ) {
    this.inactivarPermiso(permiso, i); // Ejecuta la primera función
  } else {
    this.activarPermiso(permiso, i); // Ejecuta la segunda función
  }
}


inactivarPermiso(permiso: any, i: number){
  this._permService.inactivarPermiso(permiso).subscribe(data => {
      this.inactivarBitacora(data);
      this.toastr.success('El Permiso: '+ permiso.id_permisos+ ' ha sido inactivado');
      this.listPermisos[i].estado_permiso = 2; // Cambia el estado del permiso en la lista local
      this.cdr.detectChanges(); // Detecta los cambios y actualiza la vista
    });
}

activarPermiso(permiso: any, i: number){
  this._permService.activarPermiso(permiso).subscribe(data => {
    this.toastr.success('El Permiso: '+ permiso.id_permisos+ ' ha sido activado');
    this.activarBitacora(data);
    this.listPermisos[i].estado_permiso = 1; // Cambia el estado del permiso en la lista local
    this.cdr.detectChanges(); // Detecta los cambios y actualiza la vista
  });
}

  /*****************************************************************************************************/



  generateExcel() {
    const headers = ['ID Permiso', 'ID Rol', 'ID Objeto', 'Inserción', 'Eliminación', 'Consultar', 'Actualización', 'Estado', 'Creador', 'Fecha Creación', 'Fecha Modificación'];
    const data: any[][] = [];
  
    // Recorre los datos y agrégalos a la matriz 'data'
    this.listPermisos.forEach((perm, index) => {
      const row = [
        perm.id_permisos,
        this.getRolNombre(perm.id_rol),
        this.getObjetoNombre(perm.id_objeto),
        perm.permiso_insercion,
        perm.permiso_eliminacion,
        perm.permiso_consultar,
        perm.permiso_actualizacion,
        this.getEstadoText(perm.estado_permiso),
        perm.creado_por,
        perm.fecha_creacion,
        perm.fecha_modificacion
      ];
      data.push(row);
    });
  
    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Permisos');
  
    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
  
    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Permisos.xlsx';
  
    document.body.appendChild(a);
    a.click();
  
    // Limpia el objeto URL creado
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
 /*****************************************************************************************************/

 generatePDF() {
  const { jsPDF } = require("jspdf");
  const doc = new jsPDF({ orientation: 'landscape' });

    const headers = ['ID', 'ID Rol', 'ID Objeto', 'Inserción', 'Eliminación', 'Consultar', 'Actualización', 'Estado', 'Creador', 'Fecha Creación', 'Fecha Modificación'];
    const data: any[][] = [];
  
    const logoImg = new Image();
    logoImg.onload = () => {
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);
  
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(14); // Tamaño de fuente más pequeño
      doc.text("Utilidad Mi Pyme", centerX, 30, { align: 'center' });
      doc.text("Reporte de Permisos", centerX, 40, { align: 'center' });
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 50, { align: 'center' });
      doc.text("Usuario: " + this.getUser.usuario, centerX, 60, { align: 'center' });
  
      this.listPermisos.forEach(perm => {
        const row = [
          perm.id_permisos,
          this.getRolNombre(perm.id_rol),
          this.getObjetoNombre(perm.id_objeto),
          perm.permiso_insercion,
          perm.permiso_eliminacion,
          perm.permiso_consultar,
          perm.permiso_actualizacion,
          this.getEstadoText(perm.estado_permiso),
          perm.creado_por,
          perm.fecha_creacion,
          perm.fecha_modificacion
        ];
        data.push(row);
      });
  
      doc.autoTable({
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
        head: [headers],
        body: data,
        startY: 80, // Ajuste de la posición inicial de la tabla
        theme: 'grid',
        margin: { top: 70, bottom: 30, left: 10, right: 10 }, // Ajuste de los márgenes
        styles: {
          fontSize: 8, // Tamaño de fuente más pequeño para la tabla
          cellPadding: 3,
          fillColor: [255, 255, 255],
          cellWidth: 'auto' // Ancho de la celda ajustado automáticamente
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 }, // Ancho de la columna de ID Rol aumentado
          2: { cellWidth: 30 }, // Ancho de la columna de ID Objeto aumentado
          3: { cellWidth: 20 }, // Ancho de la columna de Inserción aumentado
          4: { cellWidth: 20 }, // Ancho de la columna de Eliminación aumentado
          5: { cellWidth: 20 }, // Ancho de la columna de Consultar aumentado
          6: { cellWidth: 20 }, // Ancho de la columna de Actualización aumentado
          7: { cellWidth: 25 }, // Ancho de la columna de Estado aumentado
          8: { cellWidth: 30 }, // Ancho de la columna de Creador aumentado
          9: { cellWidth: 30 }, // Ancho de la columna de Fecha Creación aumentado
          10: { cellWidth: 30 }, // Ancho de la columna de Fecha Modificación aumentado
        },
      });
  
      doc.save('My Pyme-Reporte Permisos.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png';
  }
  

  
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
  }
  
  getEstadoText(estado: number): string {
    switch (estado) {
      case estado: 1
        return 'ACTIVO';
      case estado: 2
        return 'INACTIVO';
      default:
        return 'DESCONOCIDO';
    }
  }

  
cancelarInput(){
  this.nuevoPermiso.id_rol = -1;
  this.nuevoPermiso.id_objeto = -1;
  this.nuevoPermiso.id_objeto = -1;
  this.nuevoPermiso.permiso_consultar = false,
  this.nuevoPermiso.permiso_insercion = false,
  this.nuevoPermiso.permiso_actualizacion = false,
  this.nuevoPermiso.permiso_eliminacion = false

 }

/**************************************************************/
  agregarNuevoPermiso() {
    const LocalUser = localStorage.getItem('usuario');
    if (LocalUser){
      const permisoEnviado: Permisos = {
        id_permisos: this.nuevoPermiso.id_permisos,
        id_rol: this.id_rol,
        id_objeto: this.id_objeto,
        permiso_consultar: this.nuevoPermiso.permiso_consultar,
        permiso_insercion: this.nuevoPermiso.permiso_insercion,
        permiso_actualizacion: this.nuevoPermiso.permiso_actualizacion,
        permiso_eliminacion: this.nuevoPermiso.permiso_eliminacion,
        creado_por: LocalUser,
        fecha_creacion: new Date(),
        modificado_por: LocalUser,
        fecha_modificacion: new Date(),
        estado_permiso: 1,
      };
      console.log(permisoEnviado);
      if (!this.id_rol || !this.id_objeto) {
        this.toastr.warning('Debes completar los campos vacíos');
      }else{
      this._permService.addPermiso(permisoEnviado).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.listPermisos.push(data);
          this.toastr.success('Permiso agregado exitosamente', 'Éxito');
          this.vaciarIdObjeto();
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
      // Después de enviar el registro, restablecer los valores del formulario
      const formulario = document.getElementById('formularioNuevoPermiso') as HTMLFormElement;
      formulario.reset();
      this.nuevoPermiso = {
        id_permisos: 0,
        id_rol: 0,
        id_objeto: 0,
        permiso_consultar: false,
        permiso_insercion: false,
        permiso_actualizacion: false,
        permiso_eliminacion: false,
        estado_permiso: 0,
        creado_por: '',
        fecha_creacion: new Date(),
        modificado_por: '',
        fecha_modificacion: new Date(),
      };;
    }}
  }


 

  
  obtenerPermiso(permisos: Permisos, i: any) {
    this.permisoSeleccionado = {
      id_permisos: permisos.id_permisos,
      id_rol: permisos.id_rol,
      id_objeto: permisos.id_objeto,
      permiso_consultar: permisos.permiso_consultar,
      permiso_insercion: permisos.permiso_insercion,
      permiso_actualizacion: permisos.permiso_actualizacion,
      permiso_eliminacion: permisos.permiso_eliminacion,
      estado_permiso: permisos.estado_permiso,
      creado_por: permisos.creado_por,
      fecha_creacion: permisos.fecha_creacion,
      modificado_por: permisos.modificado_por,
      fecha_modificacion: permisos.fecha_modificacion,

    };
    
    this.indice = i;
  }


  obtenerIdPermiso(permisos: Permisos, i: any) {
    this.permisoeditando = {
      id_permisos: permisos.id_permisos,
      id_rol: permisos.id_rol,
      id_objeto: permisos.id_objeto,
      permiso_consultar: permisos.permiso_consultar,
      permiso_insercion: permisos.permiso_insercion,
      permiso_actualizacion: permisos.permiso_actualizacion,
      permiso_eliminacion: permisos.permiso_eliminacion,
      estado_permiso: permisos.estado_permiso,
      creado_por: permisos.creado_por,
      fecha_creacion: permisos.fecha_creacion,
      modificado_por: permisos.modificado_por,
      fecha_modificacion: permisos.fecha_modificacion,
    };
    this.indice = i;
    this.permisoAnterior = permisos;
  }



  editarPermiso() {
    this._permService.editarPermiso(this.permisoeditando).subscribe(() => {
      this.updateBitacora(this.data);
      this.toastr.success('Permiso editado con éxito');
      this.listPermisos[this.indice] = { ...this.permisoeditando };
      // Actualizar la vista
      this.ngZone.run(() => {        
      });
    });
  }
  getRolNombre(idRol: number): string {
    const rol = this.roles.find(rol => rol.id_rol === idRol);
    return rol ? rol.rol : 'Rol no encontrado';
  }
  getObjetoNombre(idObjeto: number): string {
    const objeto = this.objetos.find(objeto => objeto.id_objeto === idObjeto);
    return objeto ? objeto.objeto : 'Objeto no encontrado';
  }
  getObjetoTipo(idObjeto: number): string {
    const tipo_objeto = this.objetos.find(objeto => objeto.id_objeto === idObjeto);
    return tipo_objeto ? tipo_objeto.tipo_objeto: 'Objeto no encontrado';
  }

/*************************************************************** Métodos de Bitácora ***************************************************************************/

getUser: Usuario = {
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

getUsuario(){
  const userlocal = localStorage.getItem('usuario');
  if(userlocal){
    this.getUser = {
      usuario: userlocal,
      id_usuario: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      nombre_usuario: '',
      correo_electronico: '',
      estado_usuario: 0,
      contrasena: '',
      id_rol: 0,
      fecha_ultima_conexion: new Date(),
      fecha_vencimiento: new Date(),
      intentos_fallidos: 0
  }
 }

 this._userService.getUsuario(this.getUser).subscribe({
   next: (data) => {
     this.getUser = data;
   },
   error: (e: HttpErrorResponse) => {
     this._errorService.msjError(e);
   }
 });
}



insertBitacora(dataPermisos: Permisos) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 28,
    campo_original: 'NO EXISTE REGISTRO ANTERIOR',
    nuevo_campo: `SE AGREGÓ UN NUEVO PERMISO:
                  ID: ${dataPermisos.id_permisos},
                  Rol: ${dataPermisos.id_rol},
                  Objeto: ${dataPermisos.id_objeto}`,
    accion: 'INSERTAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


updateBitacora(dataPermiso: Permisos) {
  const cambios = [];
  if (this.permisoAnterior.id_permiso !== dataPermiso.id_permisos) {
    cambios.push(`ID de permiso: ${dataPermiso.id_permisos}`);
  }
  if (this.permisoAnterior.id_rol !== dataPermiso.id_rol) {
    cambios.push(`Rol: ${dataPermiso.id_rol}`);
  }
  if (this.permisoAnterior.id_objeto !== dataPermiso.id_objeto) {
    cambios.push(`Objeto: ${dataPermiso.id_objeto}`);
  }
  // Puedes agregar más comparaciones para otros campos según tus necesidades

  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario, // Usar el ID del usuario anterior para registrar el cambio
      id_objeto: 28, // Suponiendo que el ID del objeto de permisos es 28
      campo_original: `ID de permiso: ${this.permisoAnterior.id_permiso}, Rol: ${this.permisoAnterior.id_rol}, Objeto: ${this.permisoAnterior.id_objeto}`, 
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}



activarBitacora(dataPermiso: Permisos) { 
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 28, // Suponiendo que el ID del objeto de permisos es 28
    campo_original: 'EL PERMISO: '+ dataPermiso.id_permisos + ' SE ENCUENTRA "INACTIVO" ', 
    nuevo_campo: 'EL PERMISO: '+ dataPermiso.id_permisos + ' CAMBIO A "ACTIVO" ', 
    accion: 'ACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

inactivarBitacora(dataPermiso: Permisos) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 28, // Suponiendo que el ID del objeto de permisos es 28
    campo_original: 'EL PERMISO: '+ dataPermiso.id_permisos + ' SE ENCUENTRA "ACTIVO" ', 
    nuevo_campo: 'EL PERMISO: '+ dataPermiso.id_permisos + ' CAMBIO A "INACTIVO" ', 
    accion: 'INACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

deleteBitacora(dataPermiso: Permisos) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 28, // Suponiendo que el ID del objeto de permisos es 28
    campo_original: `ID de permiso: ${dataPermiso.id_permisos}`,
    nuevo_campo: `SE ELIMINA EL PERMISO: ${dataPermiso.id_permisos}`,
    accion: 'ELIMINAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}


