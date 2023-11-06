import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoContacto } from 'src/app/interfaces/mantenimiento/tipoContacto';
import { RequisitoService } from 'src/app/services/empresa/requisitos.service';
import { NgZone } from '@angular/core';
import { Requisito } from 'src/app/interfaces/empresa/requisitos';


@Component({
  selector: 'app-requisitos-exportacion',
  templateUrl:'./requisitos-exportacion.component.html',
  styleUrls: ['./requisitos-exportacion.component.css']
})
export class RequisitosExportacionComponent implements OnInit{

  RequisitoEditando: Requisito = {
    id_tipo_requisito: 0, 
    tipo_requisito: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoRequisito: Requisito = {
    id_tipo_requisito: 0, 
    tipo_requisito: '', 
    descripcion:'',
    creado_por: 'SYSTEM', 
    fecha_creacion: new Date(), 
    modificado_por: 'SYSTEM', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listrequisito: Requisito[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private _requisitoService: RequisitoService,   
    private toastr: ToastrService,
    private ngZone: NgZone
    ) { }

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 8,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._requisitoService.getAllRequisito()
      .subscribe((res: any) => {
        this.listrequisito = res;
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
  if (field === 'tipo_requisito' || field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}


  inactivarRequisito(requisito: Requisito, i: any){
    this._requisitoService.inactivarRequisito(requisito).subscribe(data => this.toastr.success('El requisito: '+ requisito.tipo_requisito + ' ha sido inactivado'));
    this.listrequisito[i].estado = 2; 
  }
  activarRequisito(requisito: Requisito, i: any){
    this._requisitoService.activarRequisito(requisito).subscribe(data => this.toastr.success('El requisito: '+ requisito.id_tipo_requisito + ' ha sido activado'));
    this.listrequisito[i].estado = 1;
  }

  agregarRequisito() {

    this.nuevoRequisito = {
      id_tipo_requisito: 0, 
      tipo_requisito: this.nuevoRequisito.tipo_requisito, 
      descripcion:this.nuevoRequisito.descripcion,
      creado_por: 'SYSTEM', 
      fecha_creacion: new Date(), 
      modificado_por: 'SYSTEM', 
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._requisitoService.addRequisito(this.nuevoRequisito).subscribe(data => {
      this.toastr.success('requisito agregado con éxito');
      
       // Recargar la página
       location.reload();
    });
  }


  obtenerIdTipoRequisito(tipoR: Requisito, i: any){

    this.RequisitoEditando = {
      
    id_tipo_requisito: tipoR.id_tipo_requisito, 
    tipo_requisito: tipoR.tipo_requisito, 
    descripcion: tipoR.descripcion,
    creado_por: tipoR.creado_por, 
    fecha_creacion: tipoR.fecha_creacion, 
    modificado_por: tipoR.modificado_por, 
    fecha_modificacion: tipoR.fecha_modificacion,
    estado: tipoR.estado,

    };
    this.indice = i;
  }


  /*editarRequisito2(){
    this._requisitoService.editarRequisito(this.RequisitoEditando).subscribe(data => {
      this.toastr.success('requisito editado con éxito');
      this.listrequisito[this.indice].tipo_requisito = this.RequisitoEditando.tipo_requisito;
      this.listrequisito[this.indice].descripcion = this.RequisitoEditando.descripcion;      
        // Recargar la página
        location.reload();
    });
  }*/
  editarRequisito(){
    this._requisitoService.editarRequisito(this.RequisitoEditando).subscribe(data => {
      this.toastr.success('Requisito editado con éxito');
      this.listrequisito[this.indice].tipo_requisito = this.RequisitoEditando.tipo_requisito;
      this.listrequisito[this.indice].descripcion = this.RequisitoEditando.descripcion;      
    }, error => {
      this.toastr.error('Hubo un error al editar el requisito');
    });
  }
  

}
