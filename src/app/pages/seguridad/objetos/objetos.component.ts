import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; 
import { SubmenuData } from 'src/app/interfaces/subMenuData/subMenuData';


@Component({
  selector: 'app-objetos',
  templateUrl:'./objetos.component.html',
  styleUrls: ['./objetos.component.css']
})
export class ObjetosComponent implements OnInit{

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

  objetoEditando: Objetos = {
    id_objeto: 0, 
    objeto: '', 
    descripcion:'', 
    tipo_objeto: '', 
    url:'',
    icono: '',
    estado_objeto: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };

  nuevoObjeto: Objetos = {
    id_objeto: 0, 
    objeto: '', 
    descripcion:'', 
    tipo_objeto: '', 
    url:'',
    icono: '',
    estado_objeto: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listObjetos: Objetos[] = [];
  data: any;
  submenusData: SubmenuData[] = [];
  submenuSeleccionado: string | undefined;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _objService: ObjetosService,
    private toastr: ToastrService,
    private _ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private datePipe: DatePipe
    ) {}

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._objService.getAllObjetos()
      .subscribe( 
        {next: (data) =>{
        this.listObjetos = data;
        this.dtTrigger.next(0);
        }
      });
    this.getUsuario();
  }


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'objeto') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase();
    } else if (field === 'tipo_objeto' || field === 'descripcion'){
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  

  // Variable de estado para alternar funciones

toggleFunction(obj: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (obj.estado_objeto == 1 ) {
    this.inactivarObjeto(obj, i); // Ejecuta la primera función
  } else {
    this.activarObjeto(obj, i); // Ejecuta la segunda función
  }
}
 

eliminarCaracteresEspeciales(event: any, field: string) {
  setTimeout(() => {
    let inputValue = event.target.value;

    // Elimina caracteres especiales dependiendo del campo
    if (field === 'objeto') {
      inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, '');  // Solo permite letras y números
      inputValue = inputValue.toUpperCase();
    }else if (field === 'descripcion') {
      inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, ''); // Solo permite letras, números y espacios en blanco
      inputValue = inputValue.toUpperCase();
    }
    event.target.value = inputValue;
  });
}


inactivarObjeto(obj: any, i: number){
  this._objService.inactivarObjeto(obj).subscribe(data => {
    this.toastr.success('El Objeto: '+ obj.objeto+ ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
  this.listObjetos[i].estado_objeto = 2;
}


activarObjeto(obj: any, i: number){
  this._objService.activarObjeto(obj).subscribe(data => {
    this.toastr.success('El Objeto: '+ obj.objeto+ ' ha sido activado');
    this.activarBitacora(data);
    
  });
  this.listObjetos[i].estado_objeto = 1;
}

filtrarObjetosUnicos() {
  const tiposUnicos = new Set();
  return this.listObjetos.filter(objeto => {
    if (!tiposUnicos.has(objeto.tipo_objeto)) {
      tiposUnicos.add(objeto.tipo_objeto);
      return true;
    }
    return false;
  });
}

  /*****************************************************************************************************/

  generateExcel() {
    const headers = ['Id','Nombre', 'Descripción', 'Tipo Objeto', 'Creado', 'Fecha Creación', 'Fecha Modificación', 'Estado'];
    const data: any[][] = [];

    // Convertir los objetos en una matriz de datos
    this.listObjetos.forEach((obj, index) => {
        const row = [
            obj.id_objeto,
            obj.objeto,
            obj.descripcion,
            obj.tipo_objeto,
            obj.creado_por,
            obj.fecha_creacion,
            obj.fecha_modificacion,
            this.getEstadoText(obj.estado_objeto) // Función para obtener el texto del estado
        ];
        data.push(row);
    });

    // Crear un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Agregar la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Objetos');

    // Guardar el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crear un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Crear un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Objetos.xlsx';

    document.body.appendChild(a);
    a.click();

    // Limpiar el objeto URL creado
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}


  /*****************************************************************************************************/

  generatePDF() {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();
    const headers = ['Id','Nombre', 'Descripción', 'Tipo', 'Creador', 'Fecha Creación', 'Modificado por', 'Fecha Modificación', 'Estado'];

    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
        // Dibujar el logo en el PDF
        doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

        // Agregar los comentarios al PDF centrados horizontalmente
        const centerX = doc.internal.pageSize.getWidth() / 2;
        doc.setFontSize(12);
        doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
        doc.text("Reporte de Objetos", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
        doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
        doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

        // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
        const data = this.listObjetos.map(obj => [
            obj.id_objeto,
            obj.objeto,
            obj.descripcion,
            obj.tipo_objeto,
            obj.creado_por,
            obj.fecha_creacion,
            obj.modificado_por,
            obj.fecha_modificacion,
            this.getEstadoText(obj.estado_objeto) // Función para obtener el texto del estado
        ]);

        // Agregar la tabla al PDF
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 70 // Ajusta la posición inicial de la tabla según tu diseño
        });

        // Guardar el PDF
        doc.save('My Pyme-Reporte Objetos.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
}

getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
}

getEstadoText(estado_objeto: number): string {
    switch (estado_objeto) {
        case 1:
            return 'ACTIVO';
        case 2:
            return 'INACTIVO';
        default:
            return 'Desconocido';
    }
}


/**************************************************************/
agregarNuevoObjeto() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal) {
    this.nuevoObjeto = {
      id_objeto: 0,
      objeto: this.nuevoObjeto.objeto,
      descripcion: this.nuevoObjeto.descripcion,
      tipo_objeto: this.nuevoObjeto.tipo_objeto,
      url:this.nuevoObjeto.url,
      icono: '',
      estado_objeto: 1,
      creado_por: userLocal,
      fecha_creacion: new Date(),
      modificado_por: userLocal,
      fecha_modificacion: new Date()
    };

    console.log('Datos que se están enviando:', this.nuevoObjeto);

    this._objService.addObjeto(this.nuevoObjeto).subscribe({
      next: (data) => {
        this.toastr.success(data.msg, 'Objeto agregado con éxito');
        // Puedes hacer otras acciones aquí después de agregar el objeto con éxito, como actualizar la lista de objetos
      },
      error: (e: HttpErrorResponse) => {
        if (e.error && e.error.msg) {
          this.toastr.error(e.error.msg, 'Error al agregar objeto');
        } else {
          this.toastr.error('Error al agregar objeto', 'Error');
        }
      }
    });
  }
}

  obtenerIdObjeto(objetos: Objetos, i: any){
    this.objetoEditando = {
      id_objeto: objetos.id_objeto, 
      objeto: objetos.objeto, 
      descripcion: objetos.descripcion, 
      tipo_objeto: objetos.tipo_objeto, 
      url: objetos.url,
      icono: objetos.icono,
      estado_objeto: objetos.estado_objeto,
      creado_por: objetos.creado_por, 
      fecha_creacion: objetos.fecha_creacion, 
      modificado_por: objetos.modificado_por, 
      fecha_modificacion: objetos.fecha_modificacion
    };
    this.indice = i;
  }

  editarObjeto(){
    if (!this.objetoEditando.objeto || !this.objetoEditando.descripcion) {
      this.toastr.error('No pueden quedar campos vacíos. Por favor, completa todos los campos.');
      return;
  }
    this.objetoEditando.objeto = this.objetoEditando.objeto.toUpperCase();
    this.objetoEditando.descripcion = this.objetoEditando.descripcion.toUpperCase();

    const esMismoObjeto = this.listObjetos[this.indice].objeto === this.objetoEditando.objeto;
  
    // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
    if (!esMismoObjeto) {
      const ObjetoExistente = this.listObjetos.some(user => user.objeto === this.objetoEditando.objeto);
      if (ObjetoExistente) {
        this.toastr.error('El Objeto ya existe. Por favor, elige otro nombre para el nuevo Objeto.');
        return;
      }
    }


    this._objService.editarObjeto(this.objetoEditando).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('Objeto editado con éxito');
      this.listObjetos[this.indice].objeto = this.objetoEditando.objeto.toUpperCase();
      this.listObjetos[this.indice].descripcion = this.objetoEditando.descripcion.toUpperCase();      // Actualizar la vista
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


 insertBitacora(dataObjeto: Objetos) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 4,
    accion: 'INSERTAR',
    descripcion: `SE INSERTA EL OBJETO: ${dataObjeto.objeto}. Descripción: ${dataObjeto.descripcion}. Tipo de objeto: ${dataObjeto.tipo_objeto}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


  updateBitacora(dataObjeto: {
    nombreAnterior: string; nombre: string, descripcion: string, objeto: string, descripcionAnterior: string, descripcionNueva: string 
}) {
    let descripcionCambios = '';

    if (dataObjeto.nombre !== dataObjeto.nombreAnterior) {
        descripcionCambios += `Nombre modificado: ${dataObjeto.nombreAnterior} -> ${dataObjeto.nombre}. `;
    }

    if (dataObjeto.descripcion !== dataObjeto.descripcionAnterior) {
        descripcionCambios += `Descripción modificada: ${dataObjeto.descripcionAnterior} -> ${dataObjeto.descripcion}. `;
    }

    if (descripcionCambios !== '') {
        const bitacora = {
            fecha: new Date(),
            id_usuario: this.getUser.id_usuario,
            id_objeto: 4,
            accion: 'ACTUALIZAR',
            descripcion: `SE ACTUALIZA EL OBJETO: ${dataObjeto.objeto}. ${descripcionCambios}`
        };

        this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
            // Aquí puedes agregar cualquier lógica adicional después de insertar la bitácora
        });
    }
}


  

  activarBitacora(dataObjeto: Objetos){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 4,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL OBJETO: '+ dataObjeto.objeto
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataObjeto: Objetos){
    console.log(dataObjeto)
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 4,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL OBJETO: '+ dataObjeto.objeto
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataObjeto: Objetos){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 4,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL OBJETO: '+ dataObjeto.objeto
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
