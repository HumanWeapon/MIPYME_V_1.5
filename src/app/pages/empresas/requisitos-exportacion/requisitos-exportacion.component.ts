import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RequisitoService } from 'src/app/services/empresa/requisitos.service';
import { NgZone } from '@angular/core';
import { Requisito } from 'src/app/interfaces/empresa/requisitos';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-requisitos-exportacion',
  templateUrl:'./requisitos-exportacion.component.html',
  styleUrls: ['./requisitos-exportacion.component.css']
})
export class RequisitosExportacionComponent implements OnInit{

  RequisitoEditando: Requisito = {
    id_tipo_requisito: 0, 
    tipo_requisito: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoRequisito: Requisito = {
    id_tipo_requisito: 0, 
    tipo_requisito: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listrequisito: Requisito[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private _requisitoService: RequisitoService,   
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private ngZone: NgZone
    ) { }

  
  ngOnInit(): void {
    this.getUsuario()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._requisitoService.getAllRequisito()
      .subscribe((res: any) => {
        this.listrequisito = res;
        this.dtTrigger.next(null);
      });
      this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


onInputChange(event: any, field: string) {
  if (field === 'tipo_requisito' || field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}




generateExcel() {
  const headers = ['Id','Tipo de Requisito', 'Descripción', 'Creado por', 'Fecha de Creación', 'Estado'];
  const data: any[][] = [];

  // Recorre los datos de tu lista de requisitos y agrégalos a la matriz 'data'
  this.listrequisito.forEach((requisito, index) => {
    const row = [
      requisito.id_tipo_requisito,
      requisito.tipo_requisito,
      requisito.descripcion,
      requisito.creado_por,
      requisito.fecha_creacion,
          this.getEstadoText(requisito.estado) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  // Crea un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Agrega la hoja al libro de Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requisitos');

  // Guarda el libro de Excel como un archivo binario
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Crea un objeto URL para el blob
  const url = window.URL.createObjectURL(blob);

  // Crea un enlace para descargar el archivo Excel
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Reporte de Requisitos.xlsx';

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
  const headers = ['Id', 'Tipo de Requisito', 'Descripción', 'Creado por', 'Fecha de Creación', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Reporte de Requisitos", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' }); 

    // Recorre los datos de la lista de requisitos y agrégalo a la matriz 'data'
    this.listrequisito.forEach((requisito, index) => {
      const row = [
        requisito.id_tipo_requisito,
        requisito.tipo_requisito,
        requisito.descripcion,
        requisito.creado_por,
        requisito.fecha_creacion,
        this.getEstadoText(requisito.estado) // Función para obtener el texto del estado
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
    doc.save('My Pyme-Reporte Requisitos.pdf');
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
      return 'Activo';
    case 2:
      return 'Inactivo';
    default:
      return 'Desconocido';
  }
}


/**************************************************************/
toggleFunction(Trequi: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (Trequi.estado == 1 ) {
    this.inactivarRequisito(Trequi, i); // Ejecuta la primera función
  } else {
    this.activarRequisito(Trequi, i); // Ejecuta la segunda función
  }
}

activarRequisito(tipo_requisito: any, i: number) {
  this._requisitoService.activarRequisito(tipo_requisito).subscribe(data =>{
    this.toastr.success('El Requisito: ' + tipo_requisito.tipo_requisito + ' ha sido activado');
    this.activarBitacora(data);
});
  this.listrequisito[i].estado = 1;
}

inactivarRequisito(tipo_requisito: any, i: number) {
  this._requisitoService.inactivarRequisito(tipo_requisito).subscribe(data =>{
    this.toastr.success('El Requisito: ' + tipo_requisito.tipo_requisito + ' ha sido Inactivado');
    this.inactivarBitacora(data);
});
  this.listrequisito[i].estado = 2;
}


getDate(): string {
  // Obtener la fecha actual
  const currentDate = new Date();
  // Formatear la fecha en el formato deseado
  return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}


agregarRequisito() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal) {
    this.nuevoRequisito = {
      id_tipo_requisito: 0,
      tipo_requisito: this.nuevoRequisito.tipo_requisito,
      descripcion: this.nuevoRequisito.descripcion,
      creado_por: userLocal,
      fecha_creacion: new Date(),
      modificado_por: userLocal,
      fecha_modificacion: new Date(),
      estado: 1,
    };
    if (!this.nuevoRequisito.tipo_requisito || !this.nuevoRequisito.descripcion) {
      this.toastr.warning('Debes completar los campos vacíos');
      this.nuevoRequisito.tipo_requisito = '';
      this.nuevoRequisito.descripcion = '';
    } else {
      this._requisitoService.addRequisito(this.nuevoRequisito).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.toastr.success('Requisito agregado exitosamente');
          // Agrega el nuevo requisito a la lista de requisitos si es necesario
        },
      });
    }
  }
}


  obtenerIdTipoRequisito(tipoR: Requisito, i: any){

    this.RequisitoEditando = {
      
    id_tipo_requisito: tipoR.id_tipo_requisito, 
    tipo_requisito: tipoR.tipo_requisito, 
    descripcion: tipoR.descripcion,
    creado_por: tipoR.creado_por, 
    fecha_creacion: tipoR.fecha_creacion, 
    modificado_por: tipoR.modificado_por, 
    fecha_modificacion: tipoR.fecha_modificacion,
    estado: tipoR.estado,

    };
    this.indice = i;
  }


  editarRequisito() {
    if (!this.RequisitoEditando.tipo_requisito || !this.RequisitoEditando.descripcion) {
      this.toastr.error('No pueden quedar campos vacíos. Por favor, completa todos los campos.');
      return;
    }
  
    this.RequisitoEditando.tipo_requisito = this.RequisitoEditando.tipo_requisito.toUpperCase();
    this.RequisitoEditando.descripcion = this.RequisitoEditando.descripcion.toUpperCase();
  
    const esMismoRequisito = this.listrequisito[this.indice].tipo_requisito === this.RequisitoEditando.tipo_requisito;
  
    // Verifica si el requisito editado ya existe
    if (!esMismoRequisito) {
      const requisitoExistente = this.listrequisito.some(requisito => requisito.tipo_requisito === this.RequisitoEditando.tipo_requisito);
      if (requisitoExistente) {
        this.toastr.error('El requisito ya existe. Por favor, elige otro requisito.');
        return;
      }
    }
  
    // Llama al servicio para editar el requisito
    this._requisitoService.editarRequisito(this.RequisitoEditando).subscribe({
      next: (data) => {
        this.updateBitacora(data);
        this.toastr.success('Requisito editado con éxito');
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  
    // Actualiza los datos en la lista local
    this.listrequisito[this.indice].tipo_requisito = this.RequisitoEditando.tipo_requisito.toUpperCase();
    this.listrequisito[this.indice].descripcion = this.RequisitoEditando.descripcion.toUpperCase();
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

insertBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 15,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 15,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 15,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 15,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 15,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


}

