import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { ErrorService } from 'src/app/services/error.service';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; 
import { PermisosService } from 'src/app/services/seguridad/permisos.service';



@Component({
  selector: 'app-roles',
  templateUrl:'./roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit{

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;

  rolAnterior: any;

  rolEditando: Roles = {
    id_rol: 0, 
    rol: '', 
    descripcion: '', 
    estado_rol: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
  };

  nuevoRol: Roles = {
    id_rol: 0, 
    rol: '', 
    descripcion: '', 
    estado_rol: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listRoles: Roles[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();

  getRol: any;


  constructor(
    private _rolService: RolesService,
    private _toastr: ToastrService,
    private _ngZone: NgZone,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _bitacoraService: BitacoraService,
    private _datePipe: DatePipe,
    private _permisosService: PermisosService
    ) { }

  
  ngOnInit(): void {
    this.getPermnisosObjetos();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._rolService.getAllRoles()
      .subscribe({
        next: (data) =>{
        this.listRoles = data;
        this.dtTrigger.next(0);
        }
      });
    this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'rol') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, '');  // Solo permite letras y números
      }else if (field === 'descripcion') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, ''); // Solo permite letras, números y espacios en blanco
      }
      event.target.value = inputValue;
    });
  }

  // Variable de estado para alternar funciones
  toggleFunction(roles: any, i: number) {
    if (roles.estado_rol == 1) {
      this.inactivarRol(roles, i);
    } else {
      this.activarRol(roles, i);
    }
  }

convertirAMayusculas(event: any, field: string) {
  setTimeout(() => {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
  });
}

getPermnisosObjetos(){
  const idObjeto = localStorage.getItem('id_objeto');
  const idRol = localStorage.getItem('id_rol');
  if(idObjeto && idRol){
    this._permisosService.getPermnisosObjetos(idRol, idObjeto).subscribe({
      next: (data: any) => {
        this.consultar = data.permiso_consultar;
        this.insertar = data.permiso_insercion;
        this.actualizar = data.permiso_actualizacion;
        this.eliminar = data.permiso_eliminacion;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
}


getDate(): string {
  // Obtener la fecha actual
  const currentDate = new Date();
  // Formatear la fecha en el formato deseado
  return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}
  
inactivarRol(rol: any, i: number){
  this._rolService.inactivarRol(rol).subscribe(data => {
    this._toastr.success('El rol: '+ rol.rol+ ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
  this.listRoles[i].estado_rol = 2;
}
activarRol(rol: any, i: number){
  this._rolService.activarRol(rol).subscribe(data => {
    this._toastr.success('El rol: '+ rol.rol+ ' ha sido activado');
    this.activarBitacora(data);
    
  });
  this.listRoles[i].estado_rol = 1;
}


  /*****************************************************************************************************/
  generateExcel() {
    const headers = ['Nombre del Rol', 'Estado', 'Descripción', 'Creador', 'Fecha de Creación', 'Modificado por', 'Fecha de Modificación'];
    const data: any[][] = [];
  
    // Recorre los datos de tu lista de roles y agrégalo a la matriz 'data'
    this.listRoles.forEach((role, index) => {
      const row = [
        role.rol,
        this.getEstadoText(role.estado_rol),
        role.descripcion,
        role.creado_por,
        role.fecha_creacion,
        role.modificado_por,
        role.fecha_modificacion,
      ];
      data.push(row);
    });
  
    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Roles');
  
    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
  
    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Roles.xlsx';
  
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
  
    const headers = ['Id', 'Nombre del Rol', 'Descripción', 'Creado por', 'Fecha de Creación', 'Fecha de Modificación', 'Estado'];
    const data: any[][] = [];
  
    const logoImg = new Image();
    logoImg.onload = () => {
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);
  
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(16); // Tamaño de fuente más grande
      doc.text("Utilidad Mi Pyme", centerX, 30, { align: 'center' });
      doc.text("Reporte de Roles", centerX, 40, { align: 'center' });
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 50, { align: 'center' });
      doc.text("Usuario: " + this.getUser.usuario, centerX, 60, { align: 'center' });
  
      this.listRoles.forEach(role => {
        const row = [
          role.id_rol,
          role.rol,
          role.descripcion,
          role.creado_por,
          role.fecha_creacion,
          role.fecha_modificacion,
          this.getEstadoText(role.estado_rol)
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
          fontSize: 10, // Tamaño de fuente para la tabla
          cellPadding: 3,
          fillColor: [255, 255, 255],
          cellWidth: 'auto' // Ancho de la celda ajustado automáticamente
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 50 }, // Ancho de la columna aumentado
          2: { cellWidth: 70 }, // Ancho de la columna aumentado
          3: { cellWidth: 40 }, // Ancho de la columna aumentado
          4: { cellWidth: 40 }, // Ancho de la columna aumentado
          5: { cellWidth: 40 }, // Ancho de la columna aumentado
          6: { cellWidth: 30 }, // Ancho de la columna aumentado
        },
      });
  
      doc.save('Reporte de Roles.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png';
  }
  
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
  }
  
  getEstadoText(estado_rol: number): string {
    switch (estado_rol) {
      case 1:
        return 'ACTIVO';
      case 2:
        return 'INACTIVO';
      default:
        return 'Desconocido';
    }
  }


/**************************************************************/

agregarNuevoRol() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal){
    const fechaActual = new Date();
    const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');
    const nuevoRolTmp = {
      id_rol: 0, 
      rol: this.nuevoRol.rol , 
      descripcion: this.nuevoRol.descripcion, 
      estado_rol: 1,
      creado_por: userLocal,
      fecha_creacion: fechaFormateada as unknown as Date, 
      modificado_por: userLocal, 
      fecha_modificacion: fechaFormateada as unknown as Date,
    };

    this._rolService.addRol(nuevoRolTmp).subscribe({
      next: (data) => {
        this._toastr.success('Rol agregado con éxito');
        this.insertBitacora(data);
        this.listRoles.push(nuevoRolTmp);
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });

    // Limpiar campos del formulario en el modal
    this.nuevoRol = {
      id_rol: 0, 
      rol: '', 
      descripcion: '', 
      estado_rol: 1,
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(),
    };
  }
}


  obtenerIdRol(roles: Roles, i: any){
    this.rolEditando = {
      id_rol: roles.id_rol, 
      rol: roles.rol, 
      descripcion: roles.descripcion, 
      estado_rol: roles.estado_rol,
      creado_por: roles.creado_por, 
      fecha_creacion: roles.fecha_creacion, 
      modificado_por: roles.modificado_por, 
      fecha_modificacion: roles.fecha_modificacion,
    };
    this.indice = i;
    this.rolAnterior = roles;
  }


  editarRol(){
    if (!this.rolEditando.rol || !this.rolEditando.descripcion) {
      this._toastr.error('No pueden quedar campos vacíos. Por favor, completa todos los campos.');
      return;
  }
    this.rolEditando.rol = this.rolEditando.rol.toUpperCase();
    this.rolEditando.descripcion = this.rolEditando.descripcion.toUpperCase();
    this.rolEditando.creado_por = this.rolEditando.creado_por.toUpperCase();
    this.rolEditando.modificado_por = this.rolEditando.modificado_por.toUpperCase();

    const esMismoRol = this.listRoles[this.indice].rol === this.rolEditando.rol;
  
    // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
    if (!esMismoRol) {
      const RolExistente = this.listRoles.some(user => user.rol === this.rolEditando.rol);
      if (RolExistente) {
        this._toastr.error('El Rol ya existe. Por favor, elige otro rol para el usuario.');
        return;
      }
    }

    this._rolService.editarRol(this.rolEditando).subscribe(data => {
      this.updateBitacora(data);
      this._toastr.success('Rol editado con éxito');
      this.listRoles[this.indice].rol = this.rolEditando.rol
      this.listRoles[this.indice].descripcion = this.rolEditando.descripcion
        // Actualizar la vista
        this._ngZone.run(() => {        
        });
    });
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


insertBitacora(dataRoles: Roles) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    campo_original: 'NO EXISTE REGISTRO ANTERIOR',
    nuevo_campo: `SE AGREGÓ UN NUEVO ROL:
                  Rol: ${dataRoles.rol},
                  Descripción: ${dataRoles.descripcion}`,
    accion: 'INSERTAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}




updateBitacora(dataRoles: Roles) {
  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (this.rolAnterior.rol !== dataRoles.rol) {
    cambios.push(`Rol: ${dataRoles.rol}`);
  }
  if (this.rolAnterior.descripcion !== dataRoles.descripcion) {
    cambios.push(`Descripción: ${dataRoles.descripcion}`);
  }
  
  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3, // Suponiendo que el ID del objeto de roles es 3
      campo_original: `Rol: ${this.rolAnterior.rol}, Descripción: ${this.rolAnterior.descripcion}`,
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}



activarBitacora(dataRoles: Roles) { 
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3, // Suponiendo que el ID del objeto de roles es 3
    campo_original: 'EL ROL: '+ dataRoles.rol + ' SE ENCUENTRA "INACTIVO" ', 
      nuevo_campo: 'EL ROL: '+ dataRoles.rol + ' CAMBIO A "ACTIVO" ', 
    accion: 'ACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

inactivarBitacora(dataRoles: Roles) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3, // Suponiendo que el ID del objeto de roles es 3
    campo_original: 'EL ROL: '+ dataRoles.rol + ' SE ENCUENTRA "ACTIVO" ', 
    nuevo_campo: 'EL ROL: '+ dataRoles.rol + ' CAMBIO A "INACTIVO" ', 
    accion: 'INACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


deleteBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3, // Suponiendo que el ID del objeto de roles es 3
    campo_original: dataRoles.rol,
    nuevo_campo: 'SE ELIMINA EL ROL: ' + dataRoles.rol,
    accion: 'ELIMINAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
 
}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */