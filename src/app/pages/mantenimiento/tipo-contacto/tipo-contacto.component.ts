import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoContacto } from 'src/app/interfaces/mantenimiento/tipoContacto';
import { TipoContactoService } from 'src/app/services/mantenimiento/tipoContacto.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español
import { DatePipe } from '@angular/common';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';


@Component({
  selector: 'app-tipo-contacto',
  templateUrl:'./tipo-contacto.component.html',
  styleUrls: ['./tipo-contacto.component.css']
})
export class TipoContactoComponent implements OnInit{

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;

  tcAnterior: any;

  tipoContactoEditando: TipoContacto = {
    id_tipo_contacto: 0, 
    tipo_contacto: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoTipoContacto: TipoContacto = {
    id_tipo_contacto: 0, 
    tipo_contacto: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listTipoC: TipoContacto[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  
  getTipoContacto: any;
 


  constructor(
    private _tipoCService: TipoContactoService,   
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _datePipe: DatePipe,
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
    this._tipoCService.getAllTipoContactos()
      .subscribe((res: any) => {
        this.listTipoC = res;
        this.dtTrigger.next(null);
      });
      this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

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
      if (field === 'tipo_contacto') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, '');  // Solo permite letras y números
      }else if (field === 'descripcion') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, '');  // Solo permite letras, números y espacios en blanco
      }
      event.target.value = inputValue;
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

// Variable de estado para alternar funciones

toggleFunction(Tconta: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (Tconta.estado == 1 ) {
    this.inactivarTipoContacto(Tconta, i); // Ejecuta la primera función
  } else {
    this.activarTipoContacto(Tconta, i); // Ejecuta la segunda función
  }
}
  

  inactivarTipoContacto(tipoContacto: TipoContacto, i: any){
    this._tipoCService.inactivarTipoContacto(tipoContacto).subscribe(data => {
    this.toastr.success('El contacto: '+ tipoContacto.tipo_contacto + ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
    this.listTipoC[i].estado = 2; 
  }
  activarTipoContacto(tipoContacto: TipoContacto, i: any){
    this._tipoCService.activarTipoContacto(tipoContacto).subscribe(data => {
    this.toastr.success('El contacto: '+ tipoContacto.tipo_contacto + ' ha sido activado');
    this.activarBitacora(data);
  });
    this.listTipoC[i].estado = 1;
  }



  /*******************GENERAR excel*******************************************/


  generateExcel() {
    const headers = ['Tipo de Contacto', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];

    // Recorre los datos de tu lista y agrégalo a la matriz 'data'
    this.listTipoC.forEach((Tconta, index) => {
        const row = [
            Tconta.tipo_contacto,
            Tconta.descripcion,
            Tconta.creado_por,
            Tconta.fecha_creacion,
            this.getEstadoText(Tconta.estado) // Función para obtener el texto del estado
        ];
        data.push(row);
    });

    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos de Contacto');

    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Tipo de Contacto.xlsx';

    document.body.appendChild(a);
    a.click();

    // Limpia el objeto URL creado
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}




  /*******************GENERAR PDF*******************************************/

  generatePDF() {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF({ orientation: 'landscape' });
    
    const data: any[][] = [];
    const headers = ['ID', 'Tipo de Contacto', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
    
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
        // Dibujar el logo en el PDF
        doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
    
        // Agregar los comentarios al PDF centrados horizontalmente
        const centerX = doc.internal.pageSize.getWidth() / 2;
        doc.setFontSize(12);
        doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
        doc.text("Reporte de Tipos de Contacto", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
        doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
        doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    
        // Recorre los datos de tu lista y agrégalo a la matriz 'data'
        this.listTipoC.forEach((Tconta, index) => {
            const row = [
              Tconta.id_tipo_contacto,
                Tconta.tipo_contacto,
                Tconta.descripcion,
                Tconta.creado_por,
                Tconta.fecha_creacion,
                this.getEstadoText(Tconta.estado) // Función para obtener el texto del estado
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
                0: { cellWidth: 30 }, // Ancho de la columna de Tipo de Contacto ajustado
                1: { cellWidth: 60 }, // Ancho de la columna de Descripción aumentado
                2: { cellWidth: 30 }, // Ancho de la columna de Creador ajustado
                3: { cellWidth: 40 }, // Ancho de la columna de Fecha de Creación aumentado
                4: { cellWidth: 20 } // Ancho de la columna de Estado ajustado
            },
        });
    
        // Guardar el PDF
        doc.save('My Pyme-Reporte Tipo de Contacto.pdf');
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

  agregarNuevoTipoContacto() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
      const fechaActual = new Date();
      const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');
    this.nuevoTipoContacto = {
      id_tipo_contacto: 0, 
      tipo_contacto: this.nuevoTipoContacto.tipo_contacto, 
      descripcion:this.nuevoTipoContacto.descripcion,
      creado_por: userLocal, 
      fecha_creacion: fechaFormateada as unknown as Date,
      modificado_por: userLocal, 
      fecha_modificacion: fechaFormateada as unknown as Date,
      estado: 1,

    };
    if (!this.nuevoTipoContacto.tipo_contacto || !this.nuevoTipoContacto.descripcion) {
      this.toastr.warning('Debes completar los campos vacíos');
      this.nuevoTipoContacto.tipo_contacto = '';
      this.nuevoTipoContacto.descripcion = '';
    }else{
    this._tipoCService.addTipoContacto(this.nuevoTipoContacto).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('contacto agregado con éxito');
        this.listTipoC.push(this.nuevoTipoContacto)
      },
    });
  }
  }
}


  obtenerIdTipoContacto(tipoC: TipoContacto, i: any){

    this.tipoContactoEditando = {
      
    id_tipo_contacto: tipoC.id_tipo_contacto, 
    tipo_contacto: tipoC.tipo_contacto, 
    descripcion: tipoC.descripcion,
    creado_por: tipoC.creado_por, 
    fecha_creacion: tipoC.fecha_creacion, 
    modificado_por: tipoC.modificado_por, 
    fecha_modificacion: tipoC.fecha_modificacion,
    estado: tipoC.estado,

    };
    this.indice = i;
    this.tcAnterior = tipoC;
  }

  cancelarInput(){
    this.nuevoTipoContacto.tipo_contacto = '';
    this.nuevoTipoContacto.descripcion = '';
   }

  editarTipoContacto(){
    if (!this.tipoContactoEditando.tipo_contacto || !this.tipoContactoEditando.descripcion) {
      this.toastr.error('No pueden quedar campos vacíos. Por favor, completa todos los campos.');
      return;
  }
    this.tipoContactoEditando.tipo_contacto = this.tipoContactoEditando.tipo_contacto.toUpperCase();
    this.tipoContactoEditando.descripcion = this.tipoContactoEditando.descripcion.toUpperCase();
    
    const esMismoTipoC = this.listTipoC[this.indice].tipo_contacto === this.tipoContactoEditando.tipo_contacto;

        // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
        if (!esMismoTipoC) {
          const TipoCOExistente = this.listTipoC.some(user => user.tipo_contacto === this.tipoContactoEditando.tipo_contacto);
          if (TipoCOExistente) {
            this.toastr.error('El Tipo de Contacto ya existe. Por favor, elige otro Tipo de Contacto.');
            return;
          }
        }

    this._tipoCService.editarTipoContacto(this.tipoContactoEditando).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('contacto editada con éxito');
      this.listTipoC[this.indice].tipo_contacto = this.tipoContactoEditando.tipo_contacto;
      this.listTipoC[this.indice].descripcion = this.tipoContactoEditando.descripcion;
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

insertBitacora(dataTipContacto: TipoContacto) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12, // ID del objeto correspondiente a los tipos de contacto
    campo_original: 'NO EXISTE REGISTRO ANTERIOR',
    nuevo_campo: `SE AGREGÓ UN NUEVO TIPO DE CONTACTO:
                  Tipo de Contacto: ${dataTipContacto.tipo_contacto},
                  Descripción: ${dataTipContacto.descripcion}`,
    accion: 'INSERTAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



updateBitacora(dataTipContacto: TipoContacto) {
  const cambios = [];
  if (this.tcAnterior.tipo_contacto !== dataTipContacto.tipo_contacto) {
    cambios.push(`Tipo de Contacto: ${dataTipContacto.tipo_contacto}`);
  }
  if (this.tcAnterior.descripcion !== dataTipContacto.descripcion) {
    cambios.push(`Descripción: ${dataTipContacto.descripcion}`);
  }

  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario, // Usar el ID del usuario anterior para registrar el cambio
      id_objeto: 12, // ID del objeto correspondiente a los tipos de contacto
      campo_original: `Tipo de Contacto: ${this.tcAnterior.tipo_contacto}, Descripción: ${this.tcAnterior.descripcion}`, 
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    }

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}



activarBitacora(dataTipContacto: TipoContacto){ 
  const bitacora = {
    fecha: new Date() ,
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    campo_original: 'EL TIPO CONTACTO: '+ dataTipContacto.tipo_contacto + ' SE ENCUENTRA "INACTIVO" ', 
    nuevo_campo: 'EL TIPO CONTACTO: '+ dataTipContacto.tipo_contacto + ' CAMBIO A "ACTIVO" ', 
    accion: 'ACTIVAR',
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}

inactivarBitacora(dataTipContacto: TipoContacto){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    campo_original: 'EL TIPO CONTACTO: '+ dataTipContacto.tipo_contacto + ' SE ENCUENTRA "ACTIVO" ', 
    nuevo_campo: 'EL TIPO CONTACTO: '+ dataTipContacto.tipo_contacto + ' CAMBIO A "INACTIVO" ', 
    accion: 'INACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    // Manejar la respuesta si es necesario
  });
  
}

deleteBitacora(dataTipContacto: TipoContacto){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    campo_original: `EL TIPO DE CONTACTO: ${dataTipContacto.tipo_contacto}`,
    nuevo_campo: `SE ELIMINA EL TIPO DE CONTACTO: ${dataTipContacto.tipo_contacto}`,
    accion: 'ELIMINAR',
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}

  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


}














/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */