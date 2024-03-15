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

  id_rol: number = 0;
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
  getobjetosSinRol(){
    this._permService.objetosSinRol(this.id_rol).subscribe({
      next: (data) => {
        this.objetosSinRol = data;
        console.log(this.objetosSinRol);
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
    const doc = new jsPDF();
    const data: any[][] = [];
    const headers = ['ID Permiso', 'ID Rol', 'ID Objeto', 'Insercion', 'Eliminacion', 'Consultar', 'Actualizacion', 'Estado', 'Creador', 'Fecha Creacion', 'Fecha Modificacion'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Permisos", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
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
  
      // Agregar la tabla al PDF
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 70 // Ajusta la posición inicial de la tabla según tu diseño
      });
  
      // Guardar el PDF
      doc.save('My Pyme-Reporte Permisos.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
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
  


/**************************************************************/
  agregarNuevoPermiso() {
    const LocalUser = localStorage.getItem('usuario');
    if (LocalUser){
      const permisoEnviado: Permisos = {
        id_permisos: this.nuevoPermiso.id_permisos,
        id_rol: this.nuevoPermiso.id_rol,
        id_objeto: this.nuevoPermiso.id_objeto,
        permiso_consultar: this.nuevoPermiso.permiso_consultar,
        permiso_insercion: this.nuevoPermiso.permiso_insercion,
        permiso_actualizacion: this.nuevoPermiso.permiso_actualizacion,
        permiso_eliminacion: this.nuevoPermiso.permiso_eliminacion,
        creado_por: LocalUser,
        fecha_creacion: new Date(),
        modificado_por: LocalUser,
        fecha_modificacion: new Date(),
        estado_permiso: 1,
      }
      console.log(permisoEnviado);
      console.log(this.objetosFiltrados);
      this._permService.addPermiso(permisoEnviado).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.toastr.success('Permiso agregado exitosamente', 'Éxito')
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
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
    accion: 'INSERTAR',
    descripcion: `SE INSERTA EL PERMISO:
                  ID: ${dataPermisos.id_permisos},
                  Rol: ${dataPermisos.id_rol},
                  Objeto: ${dataPermisos.id_objeto},
                  }`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


updateBitacora(dataPermisos: Permisos) {
  // Guardar una copia de los permisos antes de actualizarlos
  const permisosAnteriores = { ...this.permisos };

  // Actualizar los permisos
  this.permisos = dataPermisos;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];

  if (permisosAnteriores.id_rol !== dataPermisos.id_rol) {
    cambios.push(`Rol anterior: ${permisosAnteriores.id_rol} -> Nuevo rol: ${dataPermisos.id_rol}`);
  }

  if (permisosAnteriores.id_objeto !== dataPermisos.id_objeto) {
    cambios.push(`Objeto anterior: ${permisosAnteriores.id_objeto} -> Nuevo objeto: ${dataPermisos.id_objeto}`);
  }

  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear la descripción para la bitácora
    const descripcion = `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`;

    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 28,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}


activarBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 28,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}


inactivarBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 28,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}


deleteBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 28,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}


  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}


