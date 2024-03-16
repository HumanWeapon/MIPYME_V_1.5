import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDireccion } from 'src/app/interfaces/mantenimiento/tipoDireccion';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { es } from 'date-fns/locale'; // Importa el idioma español
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tipo-direccion',
  templateUrl: './tipo-direccion.component.html',
  styleUrls: ['./tipo-direccion.component.css']
})
export class TipoDireccionComponent {

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

    tipoDireccionEditando: TipoDireccion = {
      id_tipo_direccion: 0,
      tipo_direccion: '', 
      descripcion: '',
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '',
      fecha_modificacion: new Date(), 
      estado: 1,
    };

    nuevoTipoDireccion: TipoDireccion = {
      id_tipo_direccion: 0,
      tipo_direccion: '', 
      descripcion: '',
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '',
      fecha_modificacion: new Date(), 
      estado: 0,
    
      };
      indice: any;

  dtOptions: DataTables.Settings = {};
  listTipoDireccion: TipoDireccion[] = [];
  data: any;
  getDireccion: any;
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _tipoDireccionService: TipoDireccionService,    
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private ngZone: NgZone,
    private _datePipe: DatePipe
    ) {}

    ngOnInit(): void {
      this.getUsuario()
        this.dtOptions = {
          pagingType: 'full_numbers',
          pageLength: 10,
          language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
          responsive: true
        };
        this._tipoDireccionService.getAllTipoDirecciones().subscribe({
          next: (data) =>{
            this.listTipoDireccion = data;
            this.dtTrigger.next(0);
          }
        });
    }

      ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
      }
      
      // Variable de estado para alternar funciones

 toggleFunction(TipoD: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (TipoD.estado == 1 ) {
    this.inactivarTipoDirec(TipoD, i); // Ejecuta la primera función
  } else {
    this.activarTipoDirec(TipoD, i); // Ejecuta la segunda función
  }
 }

      inactivarTipoDirec(tipoDireccion: TipoDireccion, i: any){
        this._tipoDireccionService.inactivarTipoDireccion(tipoDireccion).subscribe({
          next: (data) => {
            this.inactivarBitacora(data);
            this.toastr.success('El tipo de Direccion: '+ tipoDireccion.tipo_direccion + ' ha sido inactivado')
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
        this.listTipoDireccion[i].estado = 2; 
      }

      activarTipoDirec(tipoDireccion: TipoDireccion, i: any){
        this._tipoDireccionService.activarTipoDireccion(tipoDireccion).subscribe({
          next: (data) => {
            this.inactivarBitacora(data);
            this.toastr.success('El tipo de requisito: '+ tipoDireccion.tipo_direccion + ' ha sido activado')
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
        this.listTipoDireccion[i].estado = 1;
        
      }
    
/*****************************************************************************************************/
convertirAMayusculas(event: any, field: string) {
  setTimeout(() => {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
  });
}

eliminarCaracteresEspeciales(event: any, field: string) {
  setTimeout(() => {
    let inputValue = event.target.value;

    // Elimina caracteres especiales dependiendo del campo
    if (field === 'tipo_direccion') {
      inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Solo permite letras y números
    }else if (field === 'descripcion') {
      inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Solo permite letras, números y espacios en blanco
    }
    event.target.value = inputValue;
  });
}

cancelarInput(){
   this.nuevoTipoDireccion.tipo_direccion = '';
   this.nuevoTipoDireccion.descripcion = '';
  }
  


/*****************************************************************************************************/
generateExcel() {
  const headers = ['Tipo de Requisito', 'Descripción', 'Creado Por', 'Fecha de Creación'];
  const data: any[][] = [];

  // Recorre los datos de tipoRequisitoAll y agrégalo a la matriz 'data'
  this.listTipoDireccion.forEach((TipoD, index) => {
    const row = [
      TipoD.tipo_direccion,
      TipoD.descripcion,
      TipoD.creado_por,
      TipoD.fecha_creacion,

      this.getEstadoText(TipoD.estado) // Función para obtener el texto del estado
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
    doc.text("Usuario: " + this.getUser.usuario, centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
    this.listTipoDireccion.forEach((TipoD, index) => {
      const row = [
        TipoD.tipo_direccion,
        TipoD.descripcion,
        TipoD.creado_por,
        TipoD.fecha_creacion,
  
        this.getEstadoText(TipoD.estado) // Función para obtener el texto del estado
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
  if (userLocal) {
    const fechaActual = new Date();
    const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');

    // Convertir los valores a mayúsculas antes de asignarlos
    const tipoDireccionMayuscula = this.nuevoTipoDireccion.tipo_direccion.toUpperCase();
    const descripcionMayuscula = this.nuevoTipoDireccion.descripcion.toUpperCase();

    this.nuevoTipoDireccion = {
      id_tipo_direccion: 0,
      tipo_direccion: tipoDireccionMayuscula,
      descripcion: descripcionMayuscula,
      creado_por: userLocal,
      fecha_creacion: fechaFormateada as unknown as Date,
      modificado_por: userLocal,
      fecha_modificacion: fechaFormateada as unknown as Date,
      estado: 1,
    };

    if (!this.nuevoTipoDireccion.tipo_direccion || !this.nuevoTipoDireccion.descripcion) {
      this.toastr.warning('Debes completar los campos vacíos');
      this.nuevoTipoDireccion.tipo_direccion = '';
      this.nuevoTipoDireccion.descripcion = '';
    } else {
      this._tipoDireccionService.addTipoDireccion(this.nuevoTipoDireccion).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.toastr.success('Tipo de Dirección agregado con éxito');
          this.listTipoDireccion.push(this.nuevoTipoDireccion);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
}

    
      obtenerIdTipoDireccion(tipoD: TipoDireccion, i: any){
    
        this.tipoDireccionEditando = {
          
        id_tipo_direccion: tipoD.id_tipo_direccion, 
        tipo_direccion: tipoD.tipo_direccion, 
        descripcion: tipoD.descripcion,
        creado_por: tipoD.creado_por, 
        fecha_creacion: tipoD.fecha_creacion, 
        modificado_por: tipoD.modificado_por, 
        fecha_modificacion: tipoD.fecha_modificacion,
        estado: tipoD.estado,
    
        };
        this.indice = i;
      }
    
      editarTipoDireccion(){
    
    this.tipoDireccionEditando.tipo_direccion = this.tipoDireccionEditando.tipo_direccion.toUpperCase();
    this.tipoDireccionEditando.descripcion = this.tipoDireccionEditando.descripcion.toUpperCase();

    const esMismoTipo = this.listTipoDireccion[this.indice].tipo_direccion === this.tipoDireccionEditando.tipo_direccion;

        // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
        if (!esMismoTipo) {
          const TipoRExistente = this.listTipoDireccion.some(user => user.tipo_direccion === this.tipoDireccionEditando.tipo_direccion);
          if (TipoRExistente) {
            this.toastr.error('El Tipo de Direccion ya existe. Por favor, elige otro Tipo de Direccion.');
            return;
          }
        }

        this._tipoDireccionService.editarTipoDireccion(this.tipoDireccionEditando).subscribe(data => {
          this.updateBitacora(data);
          this.toastr.success('Tipo de Requisito editado con éxito');
          this.listTipoDireccion[this.indice].tipo_direccion = this.tipoDireccionEditando.tipo_direccion;
          this.listTipoDireccion[this.indice].descripcion = this.tipoDireccionEditando.descripcion;
        
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

 insertBitacora(dataDireccion: TipoDireccion) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    accion: 'INSERTAR',
    descripcion: `SE AGREGÓ UNA NUEVA DIRECCION:
                  Direccion: ${dataDireccion.tipo_direccion},
                  Descripcion: ${dataDireccion.descripcion}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



updateBitacora(dataDireccion: TipoDireccion) {
  // Guardar el usuario actual antes de actualizarlo
  const DireccionAnterior = { ...this.getDireccion };

  // Actualizar el usuario
  this.getDireccion = dataDireccion;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (DireccionAnterior.tipo_direccion !== dataDireccion.tipo_direccion) {
    cambios.push(`Direccion anterior: ${DireccionAnterior.tipo_direccion} -> Nueva Direccion: ${dataDireccion.tipo_direccion}`);
  }
  if (DireccionAnterior.descripcion !== dataDireccion.descripcion) {
    cambios.push(`Descripcion Anterior: ${DireccionAnterior.descripcion} -> Nueva Descripcion: ${dataDireccion.descripcion}`);
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

  activarBitacora(dataDireccion: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3,
      accion: 'ACTIVAR',
      descripcion: 'ACTIVA LA DIRECCION: '+ dataDireccion.id_tipo_direccion
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataDireccion: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3,
      accion: 'INACTIVAR',
      descripcion: 'INACTIVA LA DIRECCION: '+ dataDireccion.id_tipo_direccion
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataDireccion: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 3,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA LA DIRECCION CON EL ID: '+ dataDireccion.id_tipo_direccion
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
    
}

    
    
    
    















