import { Component, NgZone } from '@angular/core';
import { Pyme } from 'src/app/interfaces/pyme/pyme';  
import { Empresa } from 'src/app/interfaces/empresa/empresas'; 
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { Historial } from 'src/app/interfaces/historialBusqueda/historial';
import { SubmenuData } from 'src/app/interfaces/subMenuData/subMenuData';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HistoriaBusquedaService } from 'src/app/services/pyme/historia-busqueda.service';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';

@Component({
  selector: 'app-historial-busqueda',
  templateUrl: './historial-busqueda.component.html',
  styleUrls: ['./historial-busqueda.component.css']
})
export class HistorialBusquedaComponent {

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;


  HistorialEditando: Historial = {
    id_historial: 0, 
    id_pyme: 0, 
    id_producto: 0, 
    id_pais: 0,
    id_empresa: 0, 
    descripcion:'', 
    estado: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };

  nuevoHistorial: Historial = {
    id_historial: 0, 
    id_pyme: 0, 
    id_producto: 0, 
    id_pais: 0, 
    id_empresa: 0, 
    descripcion:'', 
    estado: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listHistB: any[] = [];
  data: any;
  submenusData: SubmenuData[] = [];
  submenuSeleccionado: string | undefined;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
 




  constructor(
    private _historialB: HistoriaBusquedaService,
    private toastr: ToastrService,
    private _ngZone: NgZone,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private datePipe: DatePipe,
    private _permisosService: PermisosService
    ) {}

  
  ngOnInit(): void {
    this.getPermnisosObjetos();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._historialB.getAllHistorialB()
    .subscribe((data: any) => {
      this.listHistB = data;
      this.dtTrigger.next(0);
    });
    this.getUsuario();
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
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




  generateExcel() {
    const headers = ['ID', 'ID PYME', 'PYME', 'ID PRODUCTO', 'PRODUCTO', 'ID PAIS', 'PAIS', 'ID EMPRESA', 'EMPRESA', 'FECHA'];
    const data: any[][] = [];
  
    // Recorre los datos de historial y agrégalos a la matriz 'data'
    this.listHistB.forEach((historial, index) => {
      const row = [
        historial.id_historial,
        historial.id_pyme,
        historial.nombre_pyme,
        historial.id_producto,
        historial.producto,
        historial.id_pais,
        historial.pais,
        historial.id_empresa,
        historial.nombre_empresa,
        historial.fecha_creacion
      ];
      data.push(row);
    });
  
    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
  
    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
  
    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Reporte de Historial.xlsx';
  
    document.body.appendChild(a);
    a.click();
  
    // Limpia el objeto URL creado
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  

  generatePDF() {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF({ orientation: 'landscape' });

    const data: any[][] = [];
    const headers = ['ID', 'ID PYME', 'PYME', 'ID PRODUCTO', 'PRODUCTO', 'ID PAIS', 'PAIS', 'ID EMPRESA', 'EMPRESA', 'FECHA'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Historial", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' });
      doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' });  // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos del historial y agrégalos a la matriz 'data'
      this.listHistB.forEach((historial, index) => {
        const row = [
          historial.id_historial,
          historial.id_pyme,
          historial.nombre_pyme,
          historial.id_producto,
          historial.producto,
          historial.id_pais,
          historial.pais,
          historial.id_empresa,
          historial.nombre_empresa,
          historial.fecha_creacion
        ];
        data.push(row);
      });
  
      // Agregar la tabla al PDF
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 70, // Ajusta la posición inicial de la tabla según tu diseño
        styles: {
          fontSize: 8 // Tamaño de fuente para la tabla
        },
        columnStyles: {
          0: { cellWidth: 10 }, // Ancho de la columna ID
          1: { cellWidth: 15 }, // Ancho de la columna ID PYME
          2: { cellWidth: 30 }, // Ancho de la columna PYME
          3: { cellWidth: 15 }, // Ancho de la columna ID PRODUCTO
          4: { cellWidth: 30 }, // Ancho de la columna PRODUCTO
          5: { cellWidth: 15 }, // Ancho de la columna ID PAIS
          6: { cellWidth: 20 }, // Ancho de la columna PAIS
          7: { cellWidth: 15 }, // Ancho de la columna ID EMPRESA
          8: { cellWidth: 30 }, // Ancho de la columna EMPRESA
          9: { cellWidth: 20 } // Ancho de la columna FECHA
        }
      });
  
      // Guardar el PDF
      doc.save('Reporte de Historial.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
}

  
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
  }

  
}
