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
import { DatePipe } from '@angular/common';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { PaisesService } from 'src/app/services/empresa/paises.service';


@Component({
  selector: 'app-tipo-requisitos',
  templateUrl: './tipo-requisitos.component.html',
  styleUrls: ['./tipo-requisitos.component.css']
})
export class TipoRequisitosComponent implements OnInit {

    trAnterior: any;
    listPaises: Paises [] = [];

    tipoRequisitoEditando: TipoRequisito = {
      id_tipo_requisito: 0, 
      id_pais: 0,
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
        id_pais: 0,
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
  requisitosAllPaisesEmpresas: any[] = [];
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
    private ngZone: NgZone,
    private _datePipe: DatePipe,
    private _paisService: PaisesService
    ) {}

  ngOnInit(): void {
    this.getAllPaises();
    this.getUsuario()
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
        responsive: true
      };
      this._tipoRequisitoService.requisitosAllPaisesEmpresas().subscribe({
        next: (data) =>{
          this.requisitosAllPaisesEmpresas = data;
          this.dtTrigger.next(0);
        }
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
      
  // Variable de estado para alternar funciones
  toggleFunctionRequi(TRequi: any, i: number) {

    // Ejecuta una función u otra según el estado
    if (TRequi.estado == 1 ) {
      this.inactivarTipoRequi(TRequi, i); // Ejecuta la primera función
    } else {
      this.activarTipoRequi(TRequi, i); // Ejecuta la segunda función
    }
   }
  getAllPaises(){
    this._paisService.getAllPaises().subscribe({
      next: (data) =>{
        this.listPaises = data.filter(paises => paises.estado == 1);
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  paisSeleccionado(event: Event): void {
    const idPais = (event.target as HTMLSelectElement).value;
    this.nuevoTipoRequisito.id_pais = Number(idPais);
    this.tipoRequisitoEditando.id_pais = Number(idPais);
    console.log("ID_PAIS: "+idPais);
  }

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
  }

/*********************************************************************************************/
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
        this.requisitosAllPaisesEmpresas[i].estado = 2; 
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
        this.requisitosAllPaisesEmpresas[i].estado = 1;
        
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
    this.tipoRequisitoEditando.descripcion = this.tipoRequisitoEditando.descripcion.toUpperCase(); // Convierte el texto a mayúsculas
    this.nuevoTipoRequisito.descripcion = this.nuevoTipoRequisito.descripcion.toUpperCase(); // Convierte el texto a mayúsculas
  });
}

eliminarCaracteresEspeciales(event: any, field: string) {
  setTimeout(() => {
    let inputValue = event.target.value;

    // Elimina caracteres especiales dependiendo del campo
    if (field === 'tipo_requisito') {
      inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, ''); // Solo permite letras y números
    }else if (field === 'descripcion') {
      inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, '');  // Solo permite letras, números y espacios en blanco
    }
    event.target.value = inputValue;
  });
}

cancelarInput(){
   this.nuevoTipoRequisito.tipo_requisito = '';
   this.nuevoTipoRequisito.descripcion = '';
  }
  


/*****************************************************************************************************/
generateExcel() {
  const headers = ['Id', 'Requisitos', 'Descripción', 'Pais', 'Creado por', 'Fecha creación', 'Modificado', 'Fecha modificación', 'Estado'];
  const data: any[][] = [];

  // Recorre los datos de tipoRequisitoAll y agrégalo a la matriz 'data'
  this.requisitosAllPaisesEmpresas.forEach((TipoR, index) => {
    const row = [
      TipoR.id_tipo_requisito,
      TipoR.tipo_requisito,
      TipoR.descripcion,
      TipoR.paises.pais,
      TipoR.creado_por,
      TipoR.fecha_creacion,
      TipoR.modificado_por,
      TipoR.fecha_modificacion,
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
  const headers = ['Id', 'Requisitos', 'Descripción', 'Pais', 'Creado por', 'Fecha creación', 'Modificado', 'Fecha modificación', 'Estado'];

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
    doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
    this.requisitosAllPaisesEmpresas.forEach((TipoR, index) => {
      const row = [
        TipoR.id_tipo_requisito,
        TipoR.tipo_requisito,
        TipoR.descripcion,
        TipoR.paises.pais,
        TipoR.creado_por,
        TipoR.fecha_creacion,
        TipoR.modificado_por,
        TipoR.fecha_modificacion,
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
      const fechaActual = new Date();
      const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');
      this.nuevoTipoRequisito = {
        id_tipo_requisito: this.nuevoTipoRequisito.id_tipo_requisito,
        id_pais: this.nuevoTipoRequisito.id_pais, 
        tipo_requisito: this.nuevoTipoRequisito.tipo_requisito, 
        descripcion:this.nuevoTipoRequisito.descripcion,
        creado_por: userLocal, 
        fecha_creacion: fechaFormateada as unknown as Date, 
        modificado_por: userLocal, 
        fecha_modificacion: fechaFormateada as unknown as Date, 
        estado: 1,

      };
      console.log(this.nuevoTipoRequisito)
      if (!this.nuevoTipoRequisito.tipo_requisito || !this.nuevoTipoRequisito.descripcion) {
        this.toastr.warning('Debes completar los campos vacíos');
        this.nuevoTipoRequisito.tipo_requisito = '';
        this.nuevoTipoRequisito.descripcion = '';
      }else{
        this._tipoRequisitoService.addTipoRequisito(this.nuevoTipoRequisito).subscribe({
          next: (data) => {
            this.insertBitacora(data);
            this.toastr.success('Tipo de Requisito agregado con éxito')
            this.requisitosAllPaisesEmpresas.push(data);
            this.nuevoTipoRequisito.descripcion = '';
            this.nuevoTipoRequisito.id_pais = 0;
            this.nuevoTipoRequisito.tipo_requisito = '';
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
      }
    }
  }
    
  obtenerIdTipoRequisito(tipoR: TipoRequisito, i: any){

    this.tipoRequisitoEditando = {
      id_tipo_requisito: tipoR.id_tipo_requisito, 
      id_pais: tipoR.id_pais,
      tipo_requisito: tipoR.tipo_requisito, 
      descripcion: tipoR.descripcion,
      creado_por: tipoR.creado_por, 
      fecha_creacion: tipoR.fecha_creacion, 
      modificado_por: tipoR.modificado_por, 
      fecha_modificacion: tipoR.fecha_modificacion,
      estado: tipoR.estado,
    };
    this.indice = i;
    this.trAnterior = this.requisitosAllPaisesEmpresas;
  }
    
      editarTipoRequisito(){
        if (!this.tipoRequisitoEditando.tipo_requisito || !this.tipoRequisitoEditando.descripcion) {
          this.toastr.error('No pueden quedar campos vacíos. Por favor, completa todos los campos.');
          return;
      }
    
    this.tipoRequisitoEditando.tipo_requisito = this.tipoRequisitoEditando.tipo_requisito.toUpperCase();
    this.tipoRequisitoEditando.descripcion = this.tipoRequisitoEditando.descripcion.toUpperCase();

    const esMismoTipo = this.requisitosAllPaisesEmpresas[this.indice].tipo_requisito === this.tipoRequisitoEditando.tipo_requisito;

        // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
        if (!esMismoTipo) {
          const TipoRExistente = this.requisitosAllPaisesEmpresas.some(user => user.tipo_requisito === this.tipoRequisitoEditando.tipo_requisito);
          if (TipoRExistente) {
            this.toastr.error('El Tipo de Requisito ya existe. Por favor, elige otro Tipo de Requisito.');
            return;
          }
        }

        this._tipoRequisitoService.editarTipoRequisito(this.tipoRequisitoEditando).subscribe(data => {
          this.updateBitacora(data);
          this.toastr.success('Tipo de Requisito editado con éxito');
          this.requisitosAllPaisesEmpresas[this.indice].tipo_requisito = this.tipoRequisitoEditando.tipo_requisito;
          this.requisitosAllPaisesEmpresas[this.indice].descripcion = this.tipoRequisitoEditando.descripcion;
        
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
    id_objeto: 3, // El ID del objeto para tipos de requisito
    accion: 'INSERTAR',
    descripcion: `SE AGREGÓ UN NUEVO REQUISITO:
                  Requisito: ${dataRequisito.tipo_requisito},
                  Descripción: ${dataRequisito.descripcion}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



updateBitacora(dataRequisito: TipoRequisito) {
  const cambios = [];
  // Aquí compararías los cambios en los campos del tipo de requisito en lugar de los campos del usuario
  if (this.trAnterior.tipo_requisito !== dataRequisito.tipo_requisito) {
    cambios.push(`Tipo de requisito: ${dataRequisito.tipo_requisito}`);
  }
  if (this.trAnterior.descripcion !== dataRequisito.descripcion) {
    cambios.push(`Descripción: ${dataRequisito.descripcion}`);
  }
  
  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario, // Usar el ID del usuario actual para registrar el cambio
      id_objeto: 3, // ID del objeto correspondiente a los tipos de requisito
      campo_original: `Tipo de requisito: ${this.trAnterior.tipo_requisito}, Descripción: ${this.trAnterior.descripcion}`, 
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    }

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}

activarBitacora(dataRequisito: TipoRequisito){ 
  const bitacora = {
    fecha: new Date() ,
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3, // ID del objeto correspondiente a los tipos de requisito
    campo_original: 'EL TIPO REQUISITO: '+ dataRequisito.tipo_requisito + ' SE ENCUENTRA "INACTIVO" ', 
    nuevo_campo: 'EL TIPO REQUISITO: '+ dataRequisito.tipo_requisito + ' CAMBIO A "ACTIVO" ', 
    accion: 'ACTIVAR',
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    // Manejar la respuesta si es necesario
  });
}

inactivarBitacora(dataRequisito: TipoRequisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3, // ID del objeto correspondiente a los tipos de requisito
    campo_original: 'EL TIPO REQUISITO: '+ dataRequisito.tipo_requisito + ' SE ENCUENTRA "ACTIVO" ', 
    nuevo_campo: 'EL TIPO REQUISITO: '+ dataRequisito.tipo_requisito + ' CAMBIO A "INACTIVO" ', 
    accion: 'INACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    // Manejar la respuesta si es necesario
  });
}

deleteBitacora(dataRequisito: TipoRequisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3, // ID del objeto correspondiente a los tipos de requisito
    campo_original: `TIPO DE REQUISITO: ${dataRequisito.tipo_requisito}`,
    nuevo_campo: 'SE ELIMINA EL TIPO DE REQUISITO: '+ dataRequisito.tipo_requisito,
    accion: 'ELIMINAR',
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    // Manejar la respuesta si es necesario
  });
}

  
  

  
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
    
}

    
    
    
    