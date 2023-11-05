import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoDireccion } from 'src/app/interfaces/mantenimiento/tipoDireccion';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { NgZone } from '@angular/core';



@Component({
  selector: 'app-tipo-direccion',
  templateUrl:'./tipo-direccion.component.html',
  styleUrls: ['./tipo-direccion.component.css']
})
export class TipoDireccionComponent implements OnInit{

  tipoDireccionEditando: TipoDireccion = {
    id_tipo_direccion: 0, 
    tipo_direccion: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoTipoDireccion: TipoDireccion = {
    id_tipo_direccion: 0, 
    tipo_direccion: '', 
    descripcion:'',
    creado_por: 'SYSTEM', 
    fecha_creacion: new Date(), 
    modificado_por: 'SYSTEM', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listTipoD: TipoDireccion[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _tipoDService: TipoDireccionService, 
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
    this._tipoDService.getAllTipoDirecciones()
      .subscribe((res: any) => {
        this.listTipoD = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


 /* eliminarEspaciosBlanco() {
    this.ciudadEditando.ciudad = this.ciudadEditando.ciudad.toUpperCase(); // Convierte el texto a mayúsculas
    this.ciudadEditando.descripcion = this.ciudadEditando.descripcion.toUpperCase(); // Convierte el texto a mayúsculas
    this.nuevoCiudad.descripcion = this.nuevoCiudad.descripcion.toUpperCase(); // Convierte el texto a mayúsculas
    this.nuevoCiudad.ciudad = this.nuevoCiudad.ciudad.toUpperCase(); // Convierte el texto a mayúsculas
  }

*/

onInputChange(event: any, field: string) {
  if (field === 'tipo_direccion' || field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}


  inactivarTipoDireccion(tipoDireccion: TipoDireccion, i: any){
    this._tipoDService.inactivarTipoDireccion(tipoDireccion).subscribe(data => this.toastr.success('La Dirección: '+ tipoDireccion.tipo_direccion + ' ha sido inactivado'));
    this.listTipoD[i].estado = 2;
  }
  activarTipoDireccion(tipoDireccion: TipoDireccion, i: any){
    this._tipoDService.activarTipoDireccion(tipoDireccion).subscribe(data => this.toastr.success('La Dirección: '+ tipoDireccion.tipo_direccion + ' ha sido activado'));
    this.listTipoD[i].estado = 1;
  }

  agregarNuevoTipoDireccion() {

    this.nuevoTipoDireccion = {
      id_tipo_direccion: 0, 
      tipo_direccion: this.nuevoTipoDireccion.tipo_direccion, 
      descripcion:this.nuevoTipoDireccion.descripcion,
      creado_por: 'SYSTEM', 
      fecha_creacion: new Date(), 
      modificado_por: 'SYSTEM', 
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._tipoDService.addTipoDireccion(this.nuevoTipoDireccion).subscribe(data => {
      this.toastr.success('Dirección agregado con éxito');
      
       // Recargar la página
       location.reload();
       // Actualizar la vista
       this.ngZone.run(() => {        
       });
    });
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
    this._tipoDService.editarTipoDireccion(this.tipoDireccionEditando).subscribe(data => {
      this.toastr.success('Direccion editada con éxito');
      this.listTipoD[this.indice].tipo_direccion = this.tipoDireccionEditando.tipo_direccion;
      this.listTipoD[this.indice].descripcion = this.tipoDireccionEditando.descripcion;

      
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