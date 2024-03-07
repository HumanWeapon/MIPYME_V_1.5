import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoRequisito } from 'src/app/interfaces/mantenimiento/tipoRequisito.service';
import { TipoRequisitoService } from 'src/app/services/mantenimiento/tipoRequisito.service';
import { es } from 'date-fns/locale'; // Importa el idioma español
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';


@Component({
  selector: 'app-tipo-requisitos',
  templateUrl: './tipo-requisitos.component.html',
  styleUrls: ['./tipo-requisitos.component.css']
})
export class TipoRequisitosComponent implements OnInit {

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

    tipoRequisitoEditando: TipoRequisito = {
      id_tipo_requisito: 0, 
      tipo_requisito: '', 
      descripcion:'',
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(),
      estado: 0,
    };
    nuevoTipoRequisito: TipoRequisito = {
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
  listTipoR: TipoRequisito[] = [];
  data: any;
  dtTrigger: Subject<any> = new Subject<any>();
  tipoRequisitoAll: any[] = []
  getRequisito: any;


  constructor(
    private _tipoRequisitoService: TipoRequisitoService,    
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private ngZone: NgZone
    ) {}

    ngOnInit(): void {
      this.getUsuario()
        this.dtOptions = {
          pagingType: 'full_numbers',
          pageLength: 10,
          language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
          responsive: true
        };
        this._tipoRequisitoService.getAllTipoRequisito().subscribe({
          next: (data) =>{
            this.listTipoR = data;
            this.dtTrigger.next(0);
          }
        });
    }

      ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
      }
      
      // Variable de estado para alternar funciones

 toggleFunction(TRequi: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (TRequi.estado == 1 ) {
    this.inactivarTipoRequi(TRequi, i); // Ejecuta la primera función
  } else {
    this.activarTipoRequi(TRequi, i); // Ejecuta la segunda función
  }
 }

      inactivarTipoRequi(tipoRequisito: TipoRequisito, i: any){
        this._tipoRequisitoService.inactivarTipoRequisito(tipoRequisito).subscribe({
          next: (data) => {
            this.inactivarBitacora(data);
            this.toastr.success('El tipo de requisito: '+ tipoRequisito.tipo_requisito + ' ha sido inactivado')
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
        this.listTipoR[i].estado = 2; 
      }

      activarTipoRequi(tipoRequisito: TipoRequisito, i: any){
        this._tipoRequisitoService.activarTipoRequisito(tipoRequisito).subscribe({
          next: (data) => {
            this.inactivarBitacora(data);
            this.toastr.success('El tipo de requisito: '+ tipoRequisito.tipo_requisito + ' ha sido activado')
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
        this.listTipoR[i].estado = 1;
        
      }
    
/*****************************************************************************************************/
convertirAMayusculas(event: any, field: string) {
  setTimeout(() => {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
  });
}

eliminarEspaciosBlanco(event: any, field: string) {

  setTimeout(() => {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
    this.tipoRequisitoEditando.tipo_requisito = this.tipoRequisitoEditando.tipo_requisito.replace(/\s/g, ''); // Elimina espacios en blanco
    this.tipoRequisitoEditando.descripcion = this.tipoRequisitoEditando.descripcion.toUpperCase(); // Convierte el texto a mayúsculas
    this.nuevoTipoRequisito.tipo_requisito = this.nuevoTipoRequisito.tipo_requisito.replace(/\s/g, ''); // Elimina espacios en blanco
    this.nuevoTipoRequisito.descripcion = this.nuevoTipoRequisito.descripcion.toUpperCase(); // Convierte el texto a mayúsculas
  });
}


/*****************************************************************************************************/
generateExcel() {
  const headers = ['Tipo de Requisito', 'Descripción', 'Creado Por', 'Fecha de Creación'];
  const data: any[][] = [];

  // Recorre los datos de tipoRequisitoAll y agrégalo a la matriz 'data'
  this.tipoRequisitoAll.forEach((TipoR, index) => {
    const row = [
      TipoR.tipo_requisito,
      TipoR.descripcion,
      TipoR.creado_por,
      TipoR.fecha_creacion,

      this.getEstadoText(TipoR.estado) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  // Crea un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Agrega la hoja al libro de Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipo de Requisitos');

  // Guarda el libro de Excel como un archivo binario
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Crea un objeto URL para el blob
  const url = window.URL.createObjectURL(blob);

  // Crea un enlace para descargar el archivo Excel
  const a = document.createElement('a');
  a.href = url;
  a.download = 'My Pyme-Reporte Tipo de Requisitos.xlsx';

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
  const headers = ['Tipo Requisito', 'Descripcion', 'Creador', 'Fecha Creacion',  'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Reporte de Tipos de Requisito", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
    this.tipoRequisitoAll.forEach((TipoR, index) => {
      const row = [
        TipoR.tipo_requisito,
        TipoR.descripcion,
        TipoR.creado_por,
        TipoR.fecha_creacion,
  
        this.getEstadoText(TipoR.estado) // Función para obtener el texto del estado
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
    doc.save('My Pyme-Reporte Tipo Requisito.pdf');
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


/**************************************************************/



/**************************************************************/

      agregarNuevoTipoRequisito() {
    
        const userLocal = localStorage.getItem('usuario');
    if (userLocal){

        this.nuevoTipoRequisito = {
          id_tipo_requisito: 0, 
          tipo_requisito: this.nuevoTipoRequisito.tipo_requisito, 
          descripcion:this.nuevoTipoRequisito.descripcion,
          creado_por: userLocal, 
          fecha_creacion: new Date(), 
          modificado_por: userLocal, 
          fecha_modificacion: new Date(),
          estado: 1,
    
        };
    
        this._tipoRequisitoService.addTipoRequisito(this.nuevoTipoRequisito).subscribe({
          next: (data) => {
            this.insertBitacora(data);
            this.toastr.success('Tipo de Requisito agregado con éxito')
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
      }
    }
    
      obtenerIdTipoRequisito(tipoR: TipoRequisito, i: any){
    
        this.tipoRequisitoEditando = {
          
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
    
    
      editarTipoRequisito(){
        
        this._tipoRequisitoService.editarTipoRequisito(this.tipoRequisitoEditando).subscribe(data => {
          this.updateBitacora(data);
          this.toastr.success('Tipo de Requisito editado con éxito');
          this.listTipoR[this.indice].tipo_requisito = this.tipoRequisitoEditando.tipo_requisito;
          this.listTipoR[this.indice].descripcion = this.tipoRequisitoEditando.descripcion;
        
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

 insertBitacora(dataRequisito: TipoRequisito) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    accion: 'INSERTAR',
    descripcion: `SE AGREGÓ UN NUEVO REQUISITO:
                  Requisitto: ${dataRequisito.tipo_requisito},
                  Descripcion: ${dataRequisito.descripcion}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



updateBitacora(dataRequisito: TipoRequisito) {
  // Guardar el usuario actual antes de actualizarlo
  const RequisitoAnterior = { ...this.getRequisito };

  // Actualizar el usuario
  this.getRequisito = dataRequisito;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (RequisitoAnterior.tipo_requisito !== dataRequisito.tipo_requisito) {
    cambios.push(`Requisito anterior: ${RequisitoAnterior.tipo_requisito} -> Nuevo Requisito: ${dataRequisito.tipo_requisito}`);
  }
  if (RequisitoAnterior.descripcion !== dataRequisito.descripcion) {
    cambios.push(`Descripcion Anterior: ${RequisitoAnterior.descripcion} -> Nueva Descripcion: ${dataRequisito.descripcion}`);
  }
  // Puedes agregar más comparaciones para otros campos según tus necesidades

  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear la descripción para la bitácora
    const descripcion = `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`;

    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}

  
  

  activarBitacora(dataRequisito: TipoRequisito){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3,
      accion: 'ACTIVAR',
      descripcion: 'ACTIVA EL USUARIO: '+ dataRequisito.id_tipo_requisito
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataRequisito: TipoRequisito){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3,
      accion: 'INACTIVAR',
      descripcion: 'INACTIVA EL REQUISITO: '+ dataRequisito.id_tipo_requisito
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataRequisito: TipoRequisito){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL REQUISITO CON EL ID: '+ dataRequisito.id_tipo_requisito
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
    
}

    
    
    
    