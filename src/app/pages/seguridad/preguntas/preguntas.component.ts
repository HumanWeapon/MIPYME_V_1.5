import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Preguntas } from 'src/app/interfaces/seguridad/preguntas';
import { PreguntasService } from 'src/app/services/seguridad/preguntas.service';
import { Preguntas_Usuario } from 'src/app/interfaces/seguridad/preguntasUsuario';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { da, es } from 'date-fns/locale'; // Importa el idioma español



@Component({
  selector: 'app-preguntas',
  templateUrl:'./preguntas.component.html',
  styleUrls: ['./preguntas.component.css']
})
export class PreguntasComponent implements OnInit{
  getPregunta: any;

  

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

editQuestion: Preguntas = {
    id_pregunta: 0,
    pregunta: '',
    estado_pregunta: 0,
    creado_por: '',
    fecha_creacion: new Date() ,
    modificado_por: '' ,
    fecha_modificacion: new Date() 

  };

  newQuestion: Preguntas = {
    id_pregunta: 0,
    pregunta: '',
    estado_pregunta: 0,
    creado_por: '',
    fecha_creacion: new Date() ,
    modificado_por: '' ,
    fecha_modificacion: new Date() 

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPreguntas: Preguntas[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
 

  constructor(
    private _questionService: PreguntasService,
    private toastr: ToastrService,
    private router: Router, 
    private ngZone: NgZone, 
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    ) { }


  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._questionService.getAllPreguntas().subscribe({
        next: (data) =>{
          this.listPreguntas = data;
          this.dtTrigger.next(0)
        }
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

    // Variable de estado para alternar funciones

toggleFunction(pregunta: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (pregunta.estado_pregunta == 1 ) {
    this.inactivarPregunta(pregunta, i); // Ejecuta la primera función
  } else {
    this.activarPregunta(pregunta, i); // Ejecuta la segunda función
  }
}


inactivarPregunta(pregunta: any, i: number){
    this._questionService.inactivarPregunta(pregunta).subscribe(data => {
    this.toastr.success('La pregunta: '+ pregunta.pregunta+ ' ha sido inactivado');
    this.inactivarBitacora(data);
});
    this.listPreguntas[i].estado_pregunta = 2;
  }

  activarPregunta(pregunta: any, i: number){
    this._questionService.activarPregunta(pregunta).subscribe(data => {
    this.toastr.success('La pregunta: '+ pregunta.pregunta+ ' ha sido activado');
    this.activarBitacora(data);
  });
    this.listPreguntas[i].estado_pregunta = 1;
  }


     /*****************************************************************************************************/
     generateExcel() {
      const headers = ['Código', 'Pregunta', 'Estado', 'Fecha de Creación', 'Fecha de Modificación'];
      const data: any[][] = [];
    
      // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
      this.listPreguntas.forEach((question, index) => {
        const row = [
          question.id_pregunta,
          question.pregunta,
          this.getEstadoText(question.estado_pregunta),
          question.fecha_creacion,
          question.fecha_modificacion
        ];
        data.push(row);
      });
    
      // Crea un nuevo libro de Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
      // Agrega la hoja al libro de Excel
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Preguntas');
    
      // Guarda el libro de Excel como un archivo binario
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
      // Crea un objeto URL para el blob
      const url = window.URL.createObjectURL(blob);
    
      // Crea un enlace para descargar el archivo Excel
      const a = document.createElement('a');
      a.href = url;
      a.download = 'My Pyme-Reporte Preguntas.xlsx';
    
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
    const headers = ['Código', 'Pregunta', 'Estado', 'Fecha de Creación', 'Fecha de Modificación'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Preguntas", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
      this.listPreguntas.forEach((question, index) => {
        const row = [
          question.id_pregunta,
          question.pregunta,
          this.getEstadoText(question.estado_pregunta),
          question.fecha_creacion,
          question.fecha_modificacion
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
      doc.save('My Pyme-Reporte Preguntas.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
  }
  
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
  }
  
  getEstadoText(estado_pregunta: number): string {
    switch (estado_pregunta) {
      case 1:
        return 'Activo';
      case 2:
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  }
  

/**************************************************************/
agregarNuevoPregunta() {
  const LocalUser = localStorage.getItem('usuario');
  if (LocalUser){

    const newQuestion = {
      id_pregunta: 0,
      pregunta: this.newQuestion.pregunta,
      estado_pregunta: 1,
      creado_por: LocalUser,
      fecha_creacion: new Date(),
      modificado_por: LocalUser,
      fecha_modificacion: new Date(),
      
    };

    this._questionService.addPregunta(newQuestion).subscribe({
      next: (data) => {
        this.toastr.success('Pregunta agregado con éxito');
        this.insertBitacora(data);
        this.listPreguntas.push(newQuestion)
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });

  }
}

cancelarInput(){;
  this.newQuestion.pregunta ='';
}

obtenerIdPregunta(pregunta: Preguntas, i: any) {
  const localuser = localStorage.getItem('usuario');
  if(localuser){
    this.editQuestion = {
      id_pregunta: pregunta.id_pregunta,
      pregunta: pregunta.pregunta,
      estado_pregunta: pregunta.estado_pregunta,
      creado_por: pregunta.creado_por,
      fecha_creacion: pregunta.fecha_creacion ,
      modificado_por: pregunta.modificado_por,
      fecha_modificacion: pregunta.fecha_modificacion  
     
    };
  }
  this.indice = i;
}

  editarPregunta(){
    this.editQuestion.pregunta = this.editQuestion.pregunta.toUpperCase();

    const esMismaPregunta = this.listPreguntas[this.indice].pregunta === this.editQuestion.pregunta;
    if (!esMismaPregunta) {
      const PreguntaExistente = this.listPreguntas.some(user => user.pregunta === this.editQuestion.pregunta);
      if (PreguntaExistente) {
        this.toastr.error('La Pregunta ya existe. Por favor, elige otra pregunta.');
        return;
      }
    }

    this._questionService.editarPregunta(this.editQuestion).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('Pregunta editada con éxito');
      this.listPreguntas[this.indice].pregunta = this.editQuestion.pregunta;
       // Actualizar la vista
       this.ngZone.run(() => {        
      });
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

  insertBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 27,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA LA PREGUNTA: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }


  updateBitacora(dataPregunta: Preguntas) {
    // Guardar la pregunta actual antes de actualizarla
    const preguntaAnterior = { ...this.getPregunta };
  
    // Actualizar la pregunta
    this.getPregunta = dataPregunta;
  
    // Comparar los datos anteriores con los nuevos datos
    const cambios = [];
    if (preguntaAnterior.pregunta !== dataPregunta.pregunta) {
      cambios.push(`Pregunta anterior: ${preguntaAnterior.pregunta} -> Nueva pregunta: ${dataPregunta.pregunta}`);
    }
    // Puedes agregar más comparaciones para otros campos según tus necesidades
  
    // Si se realizaron cambios, registrar en la bitácora
    if (cambios.length > 0) {
      // Crear el objeto bitácora
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 27, // ID del objeto correspondiente a las preguntas
        accion: 'ACTUALIZAR',
        descripcion: `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`
      };
  
      // Insertar la bitácora
      this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
        // Manejar la respuesta si es necesario
      });
    }
  }
  
  


  activarBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 27,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA LA PREGUNTA: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  
}


  inactivarBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 27,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA LA PREGUNTA: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }


  deleteBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 27,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA LA PREGUNTA: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}










/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
