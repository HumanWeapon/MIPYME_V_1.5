import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Bitacora } from 'src/app/interfaces/administracion/bitacora';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit{

  fechaDesde: string = '';
  fechaHasta: string = '';
  bitacoraFilter: any[] = [];


  bitacora: any[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  
  getAllUser: Usuario[] = [];

  constructor(
    private _bitacoraService: BitacoraService,
    private _userService: UsuariosService,
    private _toastr: ToastrService,
    private _errorService: ErrorService){}

  ngOnInit(): void {
    this.getBitacora();
  }
  getBitacora(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._bitacoraService.getBitacora().subscribe((res: any) =>{
      this.bitacora = res;
      this.dtTrigger.next(0);
      this.filtrarRegistros();
    })
  }
  getUsuario(){
   this._userService.getAllUsuarios().subscribe({
     next: (data) => {
       this.getAllUser = data;
     },
     error: (e: HttpErrorResponse) => {
       this._errorService.msjError(e);
     }
   });
 }
 
 
 deleteBitacora() {
  this._bitacoraService.DeleteBitacora().subscribe(
    data => {
      this._toastr.success('La bitácora se ha limpiado exitosamente');
      this.getBitacora(); // Actualiza la vista después de borrar
    },
    error => {
      this._toastr.error('Hubo un error al limpiar la bitácora');
    }
  );
}

getDate(): string {
  // Obtener la fecha actual
  const currentDate = new Date();
  // Formatear la fecha en el formato deseado
  return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

filtrarRegistros() {
  // Verificar que se hayan seleccionado ambas fechas
  if (!this.fechaDesde || !this.fechaHasta) {
   this.bitacoraFilter = this.bitacora
   console.log("Debe seleccionar ambas fechas.");
   return;
 }

 // Filtrar los registros según las fechas seleccionadas
 this.bitacoraFilter = this.bitacora.filter(registro => {
   // Suponiendo que la fecha de cada registro está en un campo llamado 'fecha'
   const fechaRegistro = new Date(registro.fecha);
   const fechaInicio = new Date(this.fechaDesde);
   const fechaFin = new Date(this.fechaHasta);
   return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
 });

 // Ordenar los registros filtrados por fecha
 this.bitacoraFilter.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

 console.log("Registros filtrados y ordenados por fecha:", this.bitacoraFilter);
}






generateExcel() {
  // Definir los encabezados de las columnas
  const headers = ['ID','Fecha', 'Usuario', 'Tabla', 'Campo Original', 'Nuevo Campo', 'Operación'];

  // Crear matriz para almacenar los datos
  const data: any[][] = [];

  // Recorrer los registros de la bitácora y agregarlos a la matriz 'data'
  this.bitacora.forEach((registro) => {
    const row = [
      registro.Id_bitacora,
      registro.fecha,
      registro.usuario,
      registro.objeto,
      registro.campo_original,
      registro.nuevo_campo,
      registro.accion,
      
    ];
    data.push(row);
  });

  // Crear un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Agregar la hoja al libro de Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bitácora');

  // Guardar el libro de Excel como un archivo binario
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Crear un objeto URL para el blob
  const url = window.URL.createObjectURL(blob);

  // Crear un enlace para descargar el archivo Excel
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Reporte_Bitacora.xlsx';

  document.body.appendChild(a);
  a.click();

  // Limpiar el objeto URL creado
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}



generatePDF() {
  const { jsPDF } = require("jspdf");
  const doc = new jsPDF();
  const data: any[][] = [];
  const headers = ['ID','Fecha', 'Usuario', 'Tabla', 'Campo Original', 'Nuevo Campo', 'Operación'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    const logoWidth = 50; // Ancho del logo
    const logoHeight = logoWidth * (logoImg.height / logoImg.width); // Calcular la altura proporcional al ancho

    // Agregar el logo al PDF en la esquina superior izquierda
    doc.addImage(logoImg, 'PNG', 10, 10, logoWidth, logoHeight);

    // Calcular la posición central para la información
    const centerX = doc.internal.pageSize.getWidth() / 2;

    // Definir el texto para los comentarios
    const commentText = [
      "Utilidad Mi Pyme",
      "Reporte de Bitácora",
      "Fecha: " + this.getCurrentDate()
      
      
    ];

    // Agregar los comentarios al PDF centrados horizontalmente
    doc.setFontSize(12);
    doc.text(commentText[0], centerX, 10, { align: 'center' }); // Ajustar las coordenadas vertical y horizontalmente
    doc.text(commentText[1], centerX, 20, { align: 'center' }); // Ajustar las coordenadas vertical y horizontalmente
    doc.text(commentText[2], centerX, 30, { align: 'center' }); // Ajustar las coordenadas vertical y horizontalmente

    // Calcular la posición de inicio para la tabla de datos debajo de los comentarios
    const startY = 40;

    // Recorrer los registros y agregarlos a la tabla de datos
    this.bitacora.forEach((bitacora, index) => {
      const row = [
        bitacora.Id_bitacora,
        bitacora.fecha,
        bitacora.usuario,
        bitacora.objeto,
        bitacora.campo_original,
        bitacora.nuevo_campo,
        bitacora.accion,
      ];
      data.push(row);
    });

    // Agregar la tabla de datos al PDF
    doc.autoTable({
      head: [headers],
      body: data,
      startY: startY,
    });

    // Guardar el PDF
    doc.save('Reporte Bítacora.pdf');
  };
  logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
}

getCurrentDate(): string {
  const currentDate = new Date();
  return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
}



}