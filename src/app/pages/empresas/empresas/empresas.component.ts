import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Empresa  } from 'src/app/interfaces/empresa/empresas';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { ErrorService } from 'src/app/services/error.service';
import { NgZone } from '@angular/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { Router } from '@angular/router';
import { TipoEmpresa } from 'src/app/interfaces/mantenimiento/tipoEmpresa';
import { TipoEmpresaService } from 'src/app/services/mantenimiento/tipoEmpresa.service';
import { da } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent {

  empresaAnterior: any;

  /*******Empresas************/
  empresaEditando: Empresa = {
    id_empresa: 0,
    id_tipo_empresa:0,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevaEmpresa: Empresa = {
    id_empresa: 0,
    id_tipo_empresa:0,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 1,
  };

  list_tipoEmpresa: any[] = [];
  id_tipo_empresa: number = 0;


  indice: any;

  dtOptions: DataTables.Settings = {};
  listEmpresa: any[] = [];
  data: any; 

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  
  getEmpresa: any;

  constructor(
    private _empresaService: EmpresaService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _tipoEmpresa: TipoEmpresaService,
    private el: ElementRef,
    private _router: Router
  ) {}
  
  ngOnInit(): void {
  this.getUsuario();
  this.getTipoEmpresa();
  
  this.dtOptions = {
    pagingType: 'full_numbers',
    pageLength: 10,
    language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
    responsive: true,
  };
    this._empresaService.getAllEmpresas()
    .subscribe((res: any) => {
      this.listEmpresa = res;
      this.dtTrigger.next(null);
    });
    this.getUsuario();
  }

  getAllTipoEmpresa(){
    this._tipoEmpresa.getAllTipoEmpresa().subscribe(data => {
      this.list_tipoEmpresa = data.filter(empresa => empresa.estado == 1);
    });
  }

  getTipoEmpresa(){
    this._tipoEmpresa.getAllTipoEmpresa().subscribe({
      next: (data) => {
        this.list_tipoEmpresa = data;
        this.list_tipoEmpresa = data.filter(empresa => empresa.estado == 1);
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  tipoEmpresaSeleccionado(event: Event): void {
    const idTipoEmpresa = (event.target as HTMLSelectElement).value;
    this.id_tipo_empresa = Number(idTipoEmpresa);
  }
  navigateToOperacionesEmpresas(idempresa: any ,empresa: string, descripcion: string) {
    localStorage.setItem('idEmpresa', idempresa);
    localStorage.setItem('nombreEmpresa', empresa);
    localStorage.setItem('descripcionEmpresa', descripcion);
    this._router.navigate(['/dashboard/operaciones_empresas']);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

/*****************Insertar Datos****************************/

agregarNuevaEmpresa() {
  const userLocal = localStorage.getItem('usuario');

  if (!userLocal) {
    // Manejar el caso en el que no hay usuario local
    return;
  }

  this.nuevaEmpresa = {
    id_empresa: 0,
    id_tipo_empresa: this.id_tipo_empresa,
    nombre_empresa: this.nuevaEmpresa.nombre_empresa,
    descripcion: this.nuevaEmpresa.descripcion,
    creado_por: userLocal,
    fecha_creacion: new Date(),
    modificado_por: userLocal,
    fecha_modificacion: new Date(),
    estado: 1,
  };
  this._empresaService.addEmpresa(this.nuevaEmpresa).subscribe({
    next: (data) => {
      this.toastr.success('Empresa agregada con éxito');
      console.log(data);
      this.listEmpresa.push(data);
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
}

handleError(error: HttpErrorResponse, errorMessage: string) {
  if (error.error instanceof ErrorEvent) {
    // Error del lado del cliente
    console.error('Ocurrió un error:', error.error.message);
  } else {
    // El backend retornó un código de error
    console.error(
      `El servidor retornó el código ${error.status}, ` +
      `mensaje: ${error.error}`);
  }

  // Mostrar mensaje de error al usuario
  this.toastr.error(errorMessage);
}



getDate(): string {
  // Obtener la fecha actual
  const currentDate = new Date();
  // Formatear la fecha en el formato deseado
  return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

/************************************************************/
// Variable de estado para alternar funciones

  toggleFunction(empresa: any, i: number) {

    // Ejecuta una función u otra según el estado
    if (empresa.estado == 1 ) {
      this.inactivarEmpresa(empresa, i); // Ejecuta la primera función
    } else {
      this.activarEmpresa(empresa, i); // Ejecuta la segunda función
    }
  }
  
  activarEmpresa(empresa: Empresa, i: number) {
    this._empresaService.activarEmpresa(empresa).subscribe({
      next: (data) => {
        this.activarBitacora(data);
        this.toastr.success('La Empresa: ' + empresa.nombre_empresa + ' ha sido activada');
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.listEmpresa[i].estado = 1;
  }

  inactivarEmpresa(empresa: Empresa, i: number) {
    this._empresaService.inactivarEmpresa(empresa).subscribe({
      next: (data) => {
        this.inactivarBitacora(data);
        this.toastr.success('La Empresa: ' + empresa.nombre_empresa + ' ha sido inactivada');
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    }); // Aquí se cierra correctamente el paréntesis de la suscripción
    this.listEmpresa[i].estado = 2;
  }





/*****************************************************************************************************/


  generateExcel() {
    const headers = ['Nombre Empresa', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];

    // Recorre los datos de tu lista y agrégalo a la matriz 'data'
    this.listEmpresa.forEach((empresa, index) => {
        const row = [
            empresa.nombre_empresa,
            empresa.descripcion,
            empresa.creado_por,
            empresa.fecha_creacion,
            this.getEstadoText(empresa.estado) // Función para obtener el texto del estado
        ];
        data.push(row);
    });

    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Empresas.xlsx';

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
  const headers = ['Nombre Empresa', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Empresas", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

      // Recorre los datos de tu lista y agrégalo a la matriz 'data'
      this.listEmpresa.forEach((empresa, index) => {
          const row = [
              empresa.nombre_empresa,
              empresa.descripcion,
              empresa.creado_por,
              empresa.fecha_creacion,
              this.getEstadoText(empresa.estado) // Función para obtener el texto del estado
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
      doc.save('My Pyme-Reporte Empresas.pdf');
  };
  logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
}

getCurrentDate(): string {
  const currentDate = new Date();
  return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
}

getEstadoText(estado: number): string {
  switch (estado) {
      case 1:
          return 'ACTIVO';
      case 2:
          return 'INACTIVO';
      case 3:
          return 'BLOQUEADO';
      case 4:
          return 'VENCIDO';
      default:
          return 'Desconocido';
  }
}



/*******************************************************************************/



  onInputChange(event: any, field: string) {
    if (field === 'nombre_empresa' || field === 'descripcion') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
      this.nuevaEmpresa[field] = event.target.value.trim();
    }
  }



/************************************************************************************/
  obtenerIdEmpresa(empresa: Empresa, i: any) {
    this.empresaEditando = {
      id_empresa: empresa.id_empresa,
      id_tipo_empresa:empresa.id_tipo_empresa,
      nombre_empresa: empresa.nombre_empresa,
      descripcion:empresa.descripcion,
      creado_por: empresa.creado_por,
      fecha_creacion: empresa.fecha_creacion,
      modificado_por: empresa.modificado_por,
      fecha_modificacion: empresa.fecha_modificacion,
      estado: empresa.estado,
    };
    this.indice = i;
    this.empresaAnterior = empresa;
  }


  /************************************************************************/

  editarEmpresa(){
    this._empresaService.editarEmpresa(this.empresaEditando).subscribe(data => {
      this.updateBitacora(data);
      console.log(data);
      this.toastr.success('Empresa editada con éxito');
      this.listEmpresa[this.indice].nombre_empresa = this.empresaEditando.nombre_empresa;
      this.listEmpresa[this.indice].descripcion = this.empresaEditando.descripcion;
      this.listEmpresa[this.indice].tipoEmpresa.tipo_empresa = data.tipoEmpresa.tipo_empresa;
    });
  }

  /***********************************************************************/

  deleteEmpresa(id_empresa: number) {
    if (id_empresa !== undefined) {
        this._empresaService.deleteEmpresa(id_empresa).subscribe(
            (data) => {
                // Elimina la empresa de la lista actual en el componente después de la eliminación
                const index = this.listEmpresa.findIndex(empresa => empresa.id_empresa === id_empresa);
                if (index !== -1) {
                    this.listEmpresa.splice(index, 1);
                }
                this.toastr.success('La Empresa ha sido eliminada con éxito');
            },
            (error) => {
                console.error('Error al eliminar la Empresa', error);
                this.toastr.error('Error al eliminar la Empresa');
            }
        );
    } else {
        console.error('El valor de id_empresa es indefinido o no válido.');
    }
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

 insertBitacora(dataEmpresa: Empresa) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 9, // ID del objeto correspondiente a las empresas
    accion: 'INSERTAR',
    descripcion: `SE INSERTA LA EMPRESA:
                  ID Empresa: ${dataEmpresa.id_empresa},
                  Nombre Empresa: ${dataEmpresa.nombre_empresa},
                  Descripción: ${dataEmpresa.descripcion},
                  `
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


updateBitacora(dataEmpresa: Empresa) {
  const cambios = [];
  if (this.empresaAnterior.id_empresa !== dataEmpresa.id_empresa) {
    cambios.push(`ID Empresa: ${dataEmpresa.id_empresa}`);
  }
  if (this.empresaAnterior.nombre_empresa !== dataEmpresa.nombre_empresa) {
    cambios.push(`Nombre Empresa: ${dataEmpresa.nombre_empresa}`);
  }
  if (this.empresaAnterior.descripcion !== dataEmpresa.descripcion) {
    cambios.push(`Descripción: ${dataEmpresa.descripcion}`);
  }
 
 
  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 9, // ID del objeto correspondiente a las empresas
      campo_original: `ID Empresa: ${this.empresaAnterior.id_empresa}, Nombre Empresa: ${this.empresaAnterior.nombre_empresa}, Descripción: ${this.empresaAnterior.descripcion}, `,
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}



  activarBitacora(dataEmpresa: any){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 9,
      campo_anterior: dataEmpresa.empresa,
      nuevo_campo: 'CAMBIO DE ESTADO: ',
      accion: 'ACTIVAR',
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }

  inactivarBitacora(dataEmpresa: any){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 9,
      campo_anterior: dataEmpresa.empresa,
      nuevo_campo: 'CAMBIO DE ESTADO: ',
      accion: 'INACTIVAR',
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataEmpresa: any){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 9,
      campo_anterior: dataEmpresa.empresa,
      nuevo_campo: 'SE ELIMINA LA EMPRESA ',
      accion: 'ELIMINAR',
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}

