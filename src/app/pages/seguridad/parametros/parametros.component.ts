import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Parametros } from 'src/app/interfaces/seguridad/parametros';
import { ParametrosService } from 'src/app/services/seguridad/parametros.service';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-parametros',
  templateUrl:'./parametros.component.html',
  styleUrls: ['./parametros.component.css']
})
export class ParametrosComponent implements OnInit{

  parametroEditando: Parametros = {
    id_parametro: 0,
    parametro: '',
    estado_parametro: 0,
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
  };

  nuevoParametro: Parametros = {
    id_parametro: 0,
    parametro: '',
    estado_parametro: 0,
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
    
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
    private ngZone: NgZone
    ) { }

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._parametroService.getAllParametros()
      .subscribe((res: any) => {
        this.listParametros = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'parametro') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    }
  }


  inactivarParametro(parametros: Parametros, i: any){
    this._parametroService.inactivarParametro(parametros).subscribe(data => this.toastr.success('El parametro: '+ parametros.parametro+ ' ha sido inactivado'));
    this.listParametros[i].estado_parametro = 2;
  }
  activarParametro(parametros: Parametros, i: any){
    this._parametroService.activarParametro(parametros).subscribe(data => this.toastr.success('El parametro: '+ parametros.parametro+ ' ha sido activado'));
    this.listParametros[i].estado_parametro = 1;
  }


  agregarNuevoParametro() {

    this.nuevoParametro = {
      id_parametro: 0,
      parametro: this.nuevoParametro.parametro,
      estado_parametro: this.nuevoParametro.estado_parametro,
      valor: this.nuevoParametro.valor,
      id_usuario: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      alerta_busqueda: 0, 
    };

    this._parametroService.addParametro(this.nuevoParametro).subscribe(data => {
      this.toastr.success('Parametro agregado con éxito');
    });

      // Recargar la página
      location.reload();
      // Actualizar la vista
      this.ngZone.run(() => {        
      });
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
  }


  editarParametro(){
    this._parametroService.editarParametro(this.parametroEditando).subscribe(data => {
      this.toastr.success('Parametro editado con éxito');
      this.listParametros[this.indice].parametro = this.parametroEditando.parametro;
      this.listParametros[this.indice].valor = this.parametroEditando.valor;

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