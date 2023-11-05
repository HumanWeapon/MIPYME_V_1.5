import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Preguntas } from 'src/app/interfaces/seguridad/preguntas';
import { PreguntasService } from 'src/app/services/seguridad/preguntas.service';
import { Preguntas_Usuario } from 'src/app/interfaces/seguridad/preguntasUsuario';
import { NgZone } from '@angular/core';


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
    private ngZone: NgZone 
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

  inactivarPregunta(preguntas: Preguntas, i: any){
    this._questionService.inactivarPregunta(preguntas).subscribe(data => this.toastr.success('La pregunta: '+ preguntas.id_pregunta+ ' ha sido inactivada'));
    this.listPreguntas[i].estado_pregunta = 2;
  }
  activarPregunta(preguntas: Preguntas, i: any){
    this._questionService.activarPregunta(preguntas).subscribe(data => this.toastr.success('La pregunta: '+ preguntas.id_pregunta+ ' ha sido activada'));
    this.listPreguntas[i].estado_pregunta = 1;
  }
 

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

        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
      
    });
  }
}










/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
