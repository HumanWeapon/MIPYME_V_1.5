import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { Pyme  } from 'src/app/interfaces/pyme/pyme';
import { ErrorService } from 'src/app/services/error.service';
import { NgZone } from '@angular/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español

@Component({
  selector: 'app-pyme',
  templateUrl: './pyme.component.html',
  styleUrls: ['./pyme.component.css']
})
export class PymeComponent {

  getEstadoText: any;
  getPyme: any;


  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}



  editPyme: Pyme = {
    id_pyme: 0,
    nombre_pyme: '',
    rtn:'',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    fecha_ultima_conexion: new Date(),
    estado: 0,
    id_rol: 0
  };

  newPyme: Pyme = {
    id_pyme: 0,
    nombre_pyme: '',
    rtn:'',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    fecha_ultima_conexion: new Date(),
    estado: 0,
    id_rol: 0
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPymes: Pyme[] = [];
  listCategorias: Categoria[] = [];
  data: any; 

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private categoriasService: CategoriaService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _pymesService: PymeService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
 
 
  this.dtOptions = {
    pagingType: 'full_numbers',
    pageLength: 10,
    language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
    responsive: true,
  };
    this._pymesService.getAllPymes()
    .subscribe({
      next: (data) =>{
        this.listPymes = data;
        this.dtTrigger.next(0);
      }
    });
    this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }



  

  
/**********************************************************/
// Variable de estado para alternar funciones

toggleFunction(pyme: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (pyme.estado == 1 ) {
    this.inactivarPyme(pyme, i); // Ejecuta la primera función
  } else {
    this.activarPyme(pyme, i); // Ejecuta la segunda función
  }
}
  
  activarPyme(nombre_pyme: any, i: number) {
    this._pymesService.activarPyme(nombre_pyme).subscribe(data => {
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido activada');
      this.activarBitacora(data);
  });
    this.listPymes[i].estado = 1;
  }

  inactivarPyme(nombre_pyme: any, i: number) {
    this._pymesService.inactivarPyme(nombre_pyme).subscribe(data =>{
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido inactivada');
      this.inactivarBitacora(data);
  });
    this.listPymes[i].estado = 2;
  }


  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'nombre_pyme') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9]/g, ''); // Solo permite letras y números
      } else if (field === 'rtn') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9@.]/g, ''); // Solo permite letras, números, @ y .
      }
      event.target.value = inputValue;
    });
  }
  

/*****************************************************************************************************/

generateExcel() {
  const headers = ['Id','Nombre Pyme', 'RTN',  'Creador', 'Fecha Creación', 'Ultima Conexión','Estado'];
  const data: any[][] = [];

  // Recorre los datos de tus Pymes y agrégalos a la matriz 'data'
  this.listPymes.forEach((pyme, index) => {
    const row = [
      pyme.id_pyme,
      pyme.nombre_pyme,
      pyme.rtn,
      pyme.creado_por,
      pyme.fecha_creacion,
      pyme.fecha_ultima_conexion,
      this.getEstadoText(pyme.estado), // Función para obtener el texto del estado
      pyme.id_rol
    ];
    data.push(row);
  });

  // Crea un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Agrega la hoja al libro de Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pymes');

  // Guarda el libro de Excel como un archivo binario
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Crea un objeto URL para el blob
  const url = window.URL.createObjectURL(blob);

  // Crea un enlace para descargar el archivo Excel
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Reporte de Pymes.xlsx';

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
  const headers = ['Id', 'Nombre Pyme', 'RTN', 'Creador', 'Fecha Creación', 'Ultima Conexión', 'Estado'];
  const usuario = localStorage.getItem('usuario');

  // Obtiene la fecha actual y la formatea
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toLocaleDateString();

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Reporte de Pymes", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + fechaFormateada, centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos de tu Pymes y agrégalos a la matriz 'data'
    this.listPymes.forEach((pyme, index) => {
      let estadoResult: any = '';
      if (pyme.estado === 1) {
        estadoResult = 'ACTIVO';
      } else {
        estadoResult = 'INACTIVO';
      }

      const row = [
        pyme.id_pyme,
        pyme.nombre_pyme,
        pyme.rtn,
        pyme.creado_por,
        pyme.fecha_creacion,
        pyme.fecha_ultima_conexion,
        estadoResult,
        pyme.id_rol
      ];
      data.push(row);
    });

    // Agregar la tabla al PDF
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 40 // Ajusta la posición inicial de la tabla según tu diseño
    });

    // Usuario en la parte inferior izquierda, debajo de la tabla
    doc.setFontSize(12);
    doc.text(`Reporte Generado por el Usuario: ${usuario}`, 10, doc.autoTable.previous.finalY + 10);

    // Guardar el PDF
    doc.save('Reporte de Pymes.pdf');
  };
  logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
}


/**************************************************************/


agregarNuevaPyme() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal) {
    this.newPyme = {
      id_pyme: 0,
      nombre_pyme: this.newPyme.nombre_pyme.toUpperCase(),
      rtn:this.newPyme.rtn,
      creado_por: userLocal,
      fecha_creacion: new Date(),
      modificado_por: userLocal,
      fecha_modificacion: new Date(),
      fecha_ultima_conexion: new Date(),
      estado: 1,
      id_rol: this.newPyme.id_rol
    };
    if (!this.newPyme.nombre_pyme || !this.newPyme.rtn ) {
      this.toastr.warning('Campos vacíos');
    }  
    else {
      this._pymesService.addPyme(this.newPyme).subscribe({
        next: (data) => {
          console.log(data);
          this.insertBitacora(data);
          this.toastr.success('Pyme Agregada Exitosamente');
          this.listPymes.push(data);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
  }
}
}
    

/*******************************************************************************/
  onInputChange(event: any, field: string) {
    if (field === 'nombre_pyme' || field === 'categoria') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }

  /************************************************************************************/

  obtenerIdPyme(pyme: Pyme, i: any) {
    this.editPyme = {
      id_pyme: pyme.id_pyme,
      nombre_pyme: pyme.nombre_pyme,
      rtn:pyme.rtn,
      creado_por: pyme.creado_por,
      fecha_creacion: pyme.fecha_creacion,
      modificado_por: pyme.modificado_por,
      fecha_modificacion: pyme.fecha_modificacion,
      fecha_ultima_conexion: pyme.fecha_ultima_conexion,
      estado: pyme.estado,
      id_rol: pyme.id_rol
    };
    this.indice = i;
  }

  editarPyme() {
    this._pymesService.editarPyme(this.editPyme).subscribe({
      next: (data) => {
        this.updateBitacora(data);
        this.toastr.success('Pyme editado con éxito'); 
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
     this.listPymes[this.indice].nombre_pyme = this.editPyme.nombre_pyme.toUpperCase();
     this.listPymes[this.indice].rtn = this.editPyme.rtn;
  }
  


  /***********************************************************************/

  deletePyme(id_pyme: number) {
    if (id_pyme !== undefined) {
        this._pymesService.deletePyme(id_pyme).subscribe(
            (data) => {
                // Elimina la pyme de la lista actual en el componente después de la eliminación
                const index = this.listPymes.findIndex(pyme => pyme.id_pyme === id_pyme);
                if (index !== -1) {
                    this.listPymes.splice(index, 1);
                }
                this.toastr.success('La Pyme ha sido eliminada con éxito');
                this.deleteBitacora(data)
                this.ngZone.run(() => {        
                });
            },
            (error) => {
                console.error('Error al eliminar la Pyme', error);
                this.toastr.error('Error al eliminar la Pyme');
            }
        );
    } else {
        console.error('El valor de id_pyme es indefinido o no válido.');
    }
}

  /*********************************************************************************************/












  /************************************************************************************************/


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

 insertBitacora(dataPyme: Pyme){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 22,
    accion: 'INSERTAR',
    descripcion: `SE INSERTA LA PYME:
                  Nombre Pyme: ${dataPyme.nombre_pyme},
                  RTN: ${dataPyme.rtn},
                  Estado: ${this.getEstadoText(dataPyme.estado)}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    // Manejar la respuesta si es necesario
  });
}


updateBitacora(dataPyme: Pyme) {
  // Guardar la pyme actual antes de actualizarla
  const pymeAnterior = { ...this.getPyme };

  // Actualizar la pyme
  this.getPyme = dataPyme;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (pymeAnterior.nombre_pyme !== dataPyme.nombre_pyme) {
    cambios.push(`Nombre de Pyme anterior: ${pymeAnterior.nombre_pyme} -> Nuevo Nombre de Pyme: ${dataPyme.nombre_pyme}`);
  }
  if (pymeAnterior.rtn !== dataPyme.rtn) {
    cambios.push(`RTN anterior: ${pymeAnterior.rtn} -> Nuevo RTN: ${dataPyme.rtn}`);
  }
  if (pymeAnterior.estado !== dataPyme.estado) {
    cambios.push(`Estado anterior: ${this.getEstadoText(pymeAnterior.estado)} -> Nuevo Estado: ${this.getEstadoText(dataPyme.estado)}`);
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
      id_objeto: 22,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}


  activarBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA LA PYME: '+ dataPyme.nombre_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA LA PYME: '+ dataPyme.nombre_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA LA PYME: '+ dataPyme.nombre_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


























}








