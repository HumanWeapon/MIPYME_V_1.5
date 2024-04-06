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

  getPyme: any;
  pymeAnterior: any;
  pymeSeleccionado: any;

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
    id_rol: 0,
    nombre_contacto: '',
    correo_contacto: '',
    telefono_contacto: '',
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
    id_rol: 0,
    nombre_contacto: '',
    correo_contacto: '',
    telefono_contacto: '',
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


getDate(): string {
  // Obtener la fecha actual
  const currentDate = new Date();
  // Formatear la fecha en el formato deseado
  return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
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
      if (field === 'nombre_pyme' || field === 'rtn' || field === 'nombre_contacto' || field === 'correo_contacto') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, ''); // Solo permite letras y números
      } else if (field === 'telefono_contacto') {
        inputValue = inputValue.replace(/[^\d]/g, ''); // Solo permite números
      }
      event.target.value = inputValue;
    });
  }
  

/*****************************************************************************************************/

generateExcel() {
  const headers = ['ID', 'Nombre Pyme', 'RTN', 'Creador', 'Fecha Creación', 'Ultima Conexión', 'Contacto', 'Correo', 'Teléfono', 'Estado'];
  const data: any[][] = [];

  // Recorre los datos de tu lista de Pymes y agrégalos a la matriz 'data'
  this.listPymes.forEach((pyme, index) => {
    const row = [
      pyme.id_pyme,
      pyme.nombre_pyme,
      pyme.rtn,
      pyme.creado_por,
      pyme.fecha_creacion,
      pyme.fecha_ultima_conexion,
      pyme.nombre_contacto,
      pyme.correo_contacto,
      pyme.telefono_contacto,
      this.getEstadoText(pyme.estado) // Función para obtener el texto del estado
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
  const headers = ['ID Pyme', 'Nombre Pyme', 'RTN', 'Creador', 'Fecha Creación', 'Ultima Conexión', 'Contacto', 'Correo', 'Teléfono', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Reporte de Pymes", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' });
    doc.text("Usuario: " + this.getUser.usuario, centerX, 40, { align: 'center' });  // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos de tu lista de Pymes y agrégalos a la matriz 'data'
    this.listPymes.forEach((pyme, index) => {
      const row = [
        pyme.id_pyme,
        pyme.nombre_pyme,
        pyme.rtn,
        pyme.creado_por,
        pyme.fecha_creacion,
        pyme.fecha_ultima_conexion,
        pyme.nombre_contacto,
        pyme.correo_contacto,
        pyme.telefono_contacto,
        this.getEstadoText(pyme.estado) // Función para obtener el texto del estado
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
    doc.save('Reporte de Pymes.pdf');
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
      id_rol: this.newPyme.id_rol,
      nombre_contacto: this.newPyme.nombre_contacto.toUpperCase(),
      correo_contacto: this.newPyme.correo_contacto.toUpperCase(),
      telefono_contacto: this.newPyme.telefono_contacto
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

  obtenerPyme(pyme: Pyme, i: any) {
    this.pymeSeleccionado = {
      id_pyme: pyme.id_pyme,
      nombre_pyme: pyme.nombre_pyme,
      rtn:pyme.rtn,
      creado_por: pyme.creado_por,
      fecha_creacion: pyme.fecha_creacion,
      modificado_por: pyme.modificado_por,
      fecha_modificacion: pyme.fecha_modificacion,
      fecha_ultima_conexion: pyme.fecha_ultima_conexion,
      estado: pyme.estado,
      id_rol: pyme.id_rol,
      nombre_contacto: pyme.nombre_contacto,
      correo_contacto: pyme.correo_contacto,
      telefono_contacto: pyme.telefono_contacto
    };
    this.indice = i;
  }

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
      id_rol: pyme.id_rol,
      nombre_contacto: pyme.nombre_contacto,
      correo_contacto: pyme.correo_contacto,
      telefono_contacto: pyme.telefono_contacto
    };
    this.indice = i;
    this.pymeAnterior = pyme;
  }


  editarPyme() {
    this.editPyme.nombre_pyme = this.editPyme.nombre_pyme;
    this.editPyme.rtn = this.editPyme.rtn;
  
    // Obtener el nombre de usuario del localStorage
    const userLocal = localStorage.getItem('usuario') ?? ''; // Si userLocal es null, asigna una cadena vacía
  
    // Agregar el nombre de usuario al objeto editPyme
    this.editPyme.modificado_por = userLocal;
  
    const esMismoTipo = this.listPymes[this.indice].nombre_pyme === this.editPyme.nombre_pyme;
    const esMismoRTN = this.listPymes[this.indice].rtn === this.editPyme.rtn;
  
    // Si la Pyme no es la misma, verifica si el nombre ya existe
    if (!esMismoTipo) {
      const PymeExistente = this.listPymes.some(user => user.nombre_pyme === this.editPyme.nombre_pyme);
      if (PymeExistente) {
        this.toastr.error('El nombre de la Pyme ya existe. Por favor, elige otro nombre.');
        return;
      }
    }
  
    // Si el RTN no es el mismo, verifica si el RTN ya existe
    if (!esMismoRTN) {
      const RTNExistente = this.listPymes.some(user => user.rtn === this.editPyme.rtn);
      if (RTNExistente) {
        this.toastr.error('El RTN ya está asociado a otra Pyme. Por favor, elige otro RTN.');
        return;
      }
    }
  
    this._pymesService.editarPyme(this.editPyme).subscribe(data => {
      // Actualizar la bitácora
      this.updateBitacora(data);
      this.toastr.success('Pyme editado con éxito');
      
      // Actualizar los datos en el arreglo listPymes
      this.listPymes[this.indice].nombre_pyme = this.editPyme.nombre_pyme;
      this.listPymes[this.indice].rtn = this.editPyme.rtn;
  
      // Asignar el nombre de usuario que modificó el registro
      this.listPymes[this.indice].modificado_por = userLocal;
    });
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


insertBitacora(dataPyme: Pyme) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 22,
    campo_original: 'NO EXISTE REGISTRO ANTERIOR',
    nuevo_campo: `SE AGREGÓ UNA NUEVA PYME:
                  Nombre Pyme: ${dataPyme.nombre_pyme},
                  RTN: ${dataPyme.rtn},
                  CONTACTO: ${dataPyme.nombre_contacto}
                  CORRERO: ${dataPyme.correo_contacto}
                  TELEFONO: ${dataPyme.telefono_contacto},`,
    accion: 'INSERTAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



updateBitacora(dataPyme: Pyme) {
  const cambios = [];
  if (this.pymeAnterior.nombre_pyme !== dataPyme.nombre_pyme) {
    cambios.push(`Nombre Pyme: ${dataPyme.nombre_pyme}`);
  }
  if (this.pymeAnterior.rtn !== dataPyme.rtn) {
    cambios.push(`RTN: ${dataPyme.rtn}`);
  }
  if (this.pymeAnterior.nombre_contacto !== dataPyme.nombre_contacto) {
    cambios.push(`Nombre Contacto: ${dataPyme.nombre_contacto}`);
  }
  if (this.pymeAnterior.correo_contacto !== dataPyme.correo_contacto) {
    cambios.push(`Correo: ${dataPyme.correo_contacto}`);
  }  
  if (this.pymeAnterior.telefono_contacto !== dataPyme.telefono_contacto) {
    cambios.push(`Teléfono: ${dataPyme.telefono_contacto}`);
  }
 
 
  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22, // ID del objeto correspondiente a las PyMes
      campo_original: `Nombre Pyme: ${this.pymeAnterior.nombre_pyme}, RTN: ${this.pymeAnterior.rtn}, Contacto: ${this.pymeAnterior.nombre_contacto}, Correo: ${this.pymeAnterior.correo_contacto}, Teléfono: ${this.pymeAnterior.telefono_contacto}`, 
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    }

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}



activarBitacora(dataPyme: Pyme) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 22,
    campo_original: 'LA PYME: '+ dataPyme.nombre_pyme + ' SE ENCUENTRA "INACTIVO" ', 
    nuevo_campo: 'LA PYME: '+ dataPyme.nombre_pyme + ' CAMBIO A "ACTIVO" ', 
    accion: 'ACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

inactivarBitacora(dataPyme: Pyme) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 22,
    campo_original: 'LA PYME: '+ dataPyme.nombre_pyme + ' SE ENCUENTRA "ACTIVO" ', 
    nuevo_campo: 'LA PYME: '+ dataPyme.nombre_pyme + ' CAMBIO A "INACTIVO" ', 
    accion: 'INACTIVAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

deleteBitacora(dataPyme: Pyme) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 22,
    campo_original: dataPyme.nombre_pyme,
    nuevo_campo: `SE ELIMINA LA PYME: ${dataPyme.nombre_pyme}`,
    accion: 'ELIMINAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


























}








