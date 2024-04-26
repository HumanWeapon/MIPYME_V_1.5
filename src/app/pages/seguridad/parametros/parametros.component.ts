import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Parametros } from 'src/app/interfaces/seguridad/parametros';
import { ParametrosService } from 'src/app/services/seguridad/parametros.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import { DatePipe } from '@angular/common';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';


@Component({
  selector: 'app-parametros',
  templateUrl:'./parametros.component.html',
  styleUrls: ['./parametros.component.css']
})
export class ParametrosComponent implements OnInit{

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;

  getUserId: any;
 getParametro: any;
 parametrosAnterior: any;

 
  parametroEditando: Parametros = {
    id_parametro: 0,
    parametro: '',
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
    estado_parametro: 0,
  };

  nuevoParametro: Parametros = {
    id_parametro: 0,
    parametro: '',
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
    estado_parametro: 0,
    
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listParametros: Parametros[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
 

  constructor(
    private _parametroService: ParametrosService, 
    private toastr: ToastrService,
    private router: Router, 
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
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
    this._parametroService.getAllParametros().subscribe({
      next: (data) => {
        this.listParametros = data;
        this.dtTrigger.next(0);
      }
    });
    this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  cancelarInput(){;
    this.nuevoParametro.parametro ='';
    this.nuevoParametro.valor = 0;
  }

  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
      // Elimina espacios en blanco al inicio y al final
      inputValue = inputValue.trim();
   
      // Elimina espacios en blanco al inicio y al final, permitiendo espacios entre letras
      inputValue = inputValue.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
   
      event.target.value = inputValue;
    });
  }

  convertirAMayusculas(event: any, field: string) {
    setTimeout(() => {
      const inputValue = event.target.value;
      event.target.value = inputValue.toUpperCase();
    });
  }



   // Variable de estado para alternar funciones

toggleFunction(parametros: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (parametros.estado_parametro == 1 ) {
    this.inactivateParametro(parametros, i); // Ejecuta la primera función
  } else {
    this.activateParametro(parametros, i); // Ejecuta la segunda función
  }
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


inactivateParametro(parametro: any, i: number){
  this._parametroService.inactivateParametro(parametro).subscribe(data => {
    this.toastr.success('El Parámetro: '+ parametro.parametro+ ' ha sido inactivado');
    
    this.inactivarBitacora(data);
  });
  this.listParametros[i].estado_parametro = 2;
}
activateParametro(parametro: any, i: number){
  this._parametroService.activateParametro(parametro).subscribe(data => {
    this.toastr.success('El Parámetro: '+ parametro.parametro+ ' ha sido activado');

    this.activarBitacora(data);
    
  });
  this.listParametros[i].estado_parametro = 1;
}
 


   /*****************************************************************************************************/

generateExcel() {
  const headers = ['ID', 'Parámetro', 'Valor', 'ID Usuario', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];
  const data: any[][] = [];

  // Recorre los datos y agrégalos a la matriz 'data'
  this.listParametros.forEach((parametro) => {
    const row = [
      parametro.id_parametro,
      parametro.parametro,
      parametro.valor,
      parametro.id_usuario,
      parametro.creado_por,
      parametro.fecha_creacion,
      parametro.modificado_por,
      parametro.fecha_modificacion,
      this.getEstadoText(parametro.estado_parametro) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  // Crea un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Agrega la hoja al libro de Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parámetros');

  // Guarda el libro de Excel como un archivo binario
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Crea un objeto URL para el blob
  const url = window.URL.createObjectURL(blob);

  // Crea un enlace para descargar el archivo Excel
  const a = document.createElement('a');
  a.href = url;
  a.download = 'My Pyme-Reporte Parámetros.xlsx';

  document.body.appendChild(a);
  a.click();

  // Limpia el objeto URL creado
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}



   /*****************************************************************************************************/

   generatePDF() {
   // Importar jsPDF y crear un nuevo documento con orientación horizontal
   const { jsPDF } = require("jspdf");
   const doc = new jsPDF({ orientation: 'landscape' });


    const data: any[][] = [];
    const headers = ['ID', 'Parámetro', 'Valor', 'ID Usuario', 'Creador', 'Fecha de Creación', 'Modificado por', 'Fecha de Modificación', 'Estado'];
    
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(14);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Parámetros", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos y agrégalos a la matriz 'data'
      this.listParametros.forEach((parametro, index) => {
        const row = [
          parametro.id_parametro,
          parametro.parametro,
          parametro.valor,
          parametro.id_usuario,
          parametro.creado_por,
          parametro.fecha_creacion,
          parametro.modificado_por,
          parametro.fecha_modificacion,
          this.getEstadoText(parametro.estado_parametro) // Función para obtener el texto del estado
        ];
        data.push(row);
      });
  
      // Agregar la tabla al PDF
      doc.autoTable({
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
        head: [headers],
        body: data,
        startY: 70, // Ajusta la posición inicial de la tabla según tu diseño
        theme: 'grid',
        margin: { top: 60, bottom: 30, left: 10, right: 10 }, // Ajuste de los márgenes
        styles: {
          fontSize: 10, // Tamaño de fuente para la tabla
          cellPadding: 3,
          fillColor: [255, 255, 255],
          cellWidth: 'auto' // Ancho de la celda ajustado automáticamente
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 40 }, // Ancho de la columna de Parámetro aumentado
          2: { cellWidth: 40 }, // Ancho de la columna de Valor aumentado
          3: { cellWidth: 20 }, // Ancho de la columna de ID Usuario aumentado
          4: { cellWidth: 30 }, // Ancho de la columna de Creador aumentado
          5: { cellWidth: 40 }, // Ancho de la columna de Fecha de Creación aumentado
          6: { cellWidth: 30 }, // Ancho de la columna de Modificado por aumentado
          7: { cellWidth: 40 }, // Ancho de la columna de Fecha de Modificación aumentado
          8: { cellWidth: 25 } // Ancho de la columna de Estado aumentado
        },
      });
  
      // Guardar el PDF
      doc.save('My Pyme-Reporte Parámetros.pdf');
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
      default:
        return 'Desconocido';
    }
  }
  

/**************************************************************/


  agregarNuevoParametro() {
    const LocalUser = localStorage.getItem('usuario')
    if (LocalUser){

    const fechaActual = new Date();
    const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');
    const nuevoParametro = {
      id_parametro: 0,
      parametro: this.nuevoParametro.parametro.trim(),
      estado_parametro: 1,
      valor: this.nuevoParametro.valor,
      id_usuario: 0,
      creado_por: LocalUser,
      fecha_creacion: fechaFormateada as unknown as Date,
      modificado_por: LocalUser,
      fecha_modificacion: fechaFormateada as unknown as Date,
      alerta_busqueda: 0, 
    };
    if (!this.nuevoParametro.parametro || !this.nuevoParametro.valor) {
      this.toastr.warning('Debes completar los campos vacíos');
      this.nuevoParametro.parametro = '';
      this.nuevoParametro.valor = 0;
    }else{
    this._parametroService.addParametro(nuevoParametro).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Parametro agregado con éxito');
        this.listParametros.push(nuevoParametro)
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  }
}


  obtenerIdParametro(parametro: Parametros, i: any){
    this.parametroEditando = {
      id_parametro: parametro.id_parametro,
      parametro: parametro.parametro,
      estado_parametro: parametro.estado_parametro,
      valor: parametro.valor,
      id_usuario: parametro.id_usuario,
      creado_por: parametro.creado_por,
      fecha_creacion: parametro.fecha_creacion,
      modificado_por: parametro.modificado_por,
      fecha_modificacion: parametro.fecha_modificacion,
      alerta_busqueda: parametro.alerta_busqueda, 
    };
    this.indice = i;
    this.parametrosAnterior = parametro;
  }


  editarParametro(){
    if (!this.parametroEditando.parametro || !this.parametroEditando.valor) {
      this.toastr.error('No pueden quedar campos vacíos. Por favor, completa todos los campos.');
      return;
  }
    this.parametroEditando.parametro = this.parametroEditando.parametro.toUpperCase();
    this.parametroEditando.creado_por = this.parametroEditando.creado_por.toUpperCase();
    this.parametroEditando.modificado_por = this.parametroEditando.modificado_por.toUpperCase();

    const esMismoParametro = this.listParametros[this.indice].parametro === this.parametroEditando.parametro;
    if (!esMismoParametro) {
      const ParametroExistente = this.listParametros.some(user => user.parametro === this.parametroEditando.parametro);
      if (ParametroExistente) {
        this.toastr.error('El Parametro ya existe. Por favor, elige otro Parametro.');
        return;
      }
    }

    this._parametroService.editarParametro(this.parametroEditando).subscribe({
      next: (data) => {
        //this.listContacto[this.indice].tipo_contacto =
        this.toastr.success('Parametro editado con éxito');
        this.updateBitacora(data);
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.listParametros[this.indice].parametro = this.parametroEditando.parametro.toUpperCase();
    this.listParametros[this.indice].valor = this.parametroEditando.valor
  
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

 insertBitacora(dataParametro: Parametros) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 2,
    campo_original: 'NO EXISTE REGISTRO ANTERIOR',
    nuevo_campo: `SE AGREGÓ UN NUEVO PARÁMETRO:
                  Parámetro: ${dataParametro.parametro},
                  Valor: ${dataParametro.valor}`,
    accion: 'INSERTAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


  
updateBitacora(dataParametro: Parametros) {

  const cambios = [];

  if (this.parametrosAnterior.parametro !== dataParametro.parametro) {
    cambios.push(`Parámetro: ${dataParametro.parametro}`);
  }
  if (this.parametrosAnterior.valor !== dataParametro.valor) {
    cambios.push(`Valor: ${dataParametro.valor}`);
  }
 
  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario, // Usar el ID del usuario anterior para registrar el cambio
      id_objeto: 2, // ID del objeto correspondiente a los parámetros
      campo_original: `Parámetro: ${this.parametrosAnterior.parametro}, Valor: ${this.parametrosAnterior.valor}`, 
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}

  
activarBitacora(dataParametro: Parametros) { 
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 2, // Suponiendo que el ID del objeto de parámetros es 2
    campo_original: 'EL PARAMETRO: '+ dataParametro.parametro + ' SE ENCUENTRA "INACTIVO" ', 
    nuevo_campo: 'EL PARAMETRO: '+ dataParametro.parametro + ' CAMBIO A "ACTIVO" ', 
    accion: 'ACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

inactivarBitacora(dataParametro: Parametros) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 2, // Suponiendo que el ID del objeto de parámetros es 2
    campo_original: 'EL PARÁMETRO: '+ dataParametro.parametro + ' SE ENCUENTRA "ACTIVO" ', 
    nuevo_campo: 'EL PARÁMETRO: '+ dataParametro.parametro + ' CAMBIO A "INACTIVO" ', 
    accion: 'INACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

deleteBitacora(dataParametro: Parametros) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 2, // Suponiendo que el ID del objeto de parámetros es 2
    campo_original: `Parámetro: ${dataParametro.parametro}`,
    nuevo_campo: `SE ELIMINA EL PARÁMETRO: ${dataParametro.parametro}`,
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