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


@Component({
  selector: 'app-preguntas',
  templateUrl:'./preguntas.component.html',
  styleUrls: ['./preguntas.component.css']
})
export class PreguntasComponent implements OnInit{

  preguntaEditando: Preguntas = {
    id_pregunta: 0,
    pregunta: '',
    estado_pregunta: 0,
    creado_por: '',
    fecha_creacion: new Date() ,
    modificado_por: '' ,
    fecha_modificacion: new Date() 

  };

  nuevoPregunta: Preguntas = {
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
    private _userService: UsuariosService
    ) { }

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._questionService.getAllPreguntas()
      .subscribe((res: any) => {
        this.listPreguntas = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


    // Variable de estado para alternar funciones

toggleFunction(pregunta: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (pregunta.estado_pregunta === 1 ) {
    this.inactivarPregunta(pregunta, i); // Ejecuta la primera función
  } else {
    this.activarPregunta(pregunta, i); // Ejecuta la segunda función
  }
}
 
inactivarPregunta(pregunta: any, i: number){
    this._questionService.inactivarPregunta(pregunta).subscribe(data => 
    this.toastr.success('La pregunta: '+ pregunta.pregunta+ ' ha sido inactivado')
    );
    this.listPreguntas[i].estado_pregunta = 2;
  }
  activarPregunta(pregunta: any, i: number){
    this._questionService.activarPregunta(pregunta).subscribe(data => 
    this.toastr.success('La pregunta: '+ pregunta.pregunta+ ' ha sido activado')
    );
    this.listPreguntas[i].estado_pregunta = 1;
  }


   /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['ID', 'Pregunta', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listPreguntas.forEach((preg, index) => {
    const row = [
    preg.id_pregunta,
    preg.pregunta,
    preg.creado_por,
    preg.fecha_creacion,
    preg.modificado_por,
    preg.fecha_modificacion, 
      this.getEstadoText(preg.estado_pregunta) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  doc.autoTable({
    head: [headers],
    body: data,
  });

  doc.output('dataurlnewwindow', null, 'Pymes.pdf');
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
 

  agregarNuevoPregunta() {

    this.nuevoPregunta = {
      id_pregunta: 0,
      pregunta: this.nuevoPregunta.pregunta,
      estado_pregunta: 1,
      creado_por: 'SYSTEM',
      fecha_creacion: new Date() ,
      modificado_por: 'SYSTEM' ,
      fecha_modificacion: new Date() 

    };

    this._questionService.addPregunta(this.nuevoPregunta).subscribe(data => {
      this.toastr.success('Pregunta agregado con éxito');

        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });

    });

  }


  obtenerIdPregunta(preguntas: Preguntas, i: any){
    this.preguntaEditando = {  
      id_pregunta: preguntas.id_pregunta,
      pregunta: preguntas.pregunta,
      estado_pregunta: preguntas.estado_pregunta,
      creado_por: preguntas.creado_por,
      fecha_creacion: preguntas.fecha_creacion ,
      modificado_por: preguntas.modificado_por,
      fecha_modificacion: preguntas.fecha_modificacion 

    };
    this.indice = i;
  }


  editarPregunta(){
    this._questionService.editarPregunta(this.preguntaEditando).subscribe(data => {
      this.toastr.success('Pregunta editada con éxito');
      this.listPreguntas[this.indice].pregunta = this.preguntaEditando.pregunta;

      
    });
      // Recargar la página
      location.reload();
      // Actualizar la vista
      this.ngZone.run(() => {        
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
    primer_ingreso: new Date(),
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
        primer_ingreso: new Date(),
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
      id_objeto: 29,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA LA PREGUNTA CON EL ID: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA LA PREGUNTA CON EL ID: '+ dataPregunta.pregunta
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA LA PREGUNTA CON EL ID: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA LA PREGUNTA CON EL ID: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataPregunta: Preguntas){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA LA PREGUNTA CON EL ID: '+ dataPregunta.pregunta
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}










/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
