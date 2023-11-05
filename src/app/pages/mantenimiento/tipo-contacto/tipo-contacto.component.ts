import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoContacto } from 'src/app/interfaces/mantenimiento/tipoContacto';
import { TipoContactoService } from 'src/app/services/mantenimiento/tipoContacto.service';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-tipo-contacto',
  templateUrl:'./tipo-contacto.component.html',
  styleUrls: ['./tipo-contacto.component.css']
})
export class TipoContactoComponent implements OnInit{

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
    creado_por: 'SYSTEM', 
    fecha_creacion: new Date(), 
    modificado_por: 'SYSTEM', 
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
 


  constructor(
    private _tipoCService: TipoContactoService,   
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
    this._tipoCService.getAllTipoContactos()
      .subscribe((res: any) => {
        this.listTipoC = res;
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
  if (field === 'tipo_contacto' || field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}


  inactivarTipoContacto(tipoContacto: TipoContacto, i: any){
    this._tipoCService.inactivarTipoContacto(tipoContacto).subscribe(data => this.toastr.success('El contacto: '+ tipoContacto.tipo_contacto + ' ha sido inactivado'));
    this.listTipoC[i].estado = 2; 
  }
  activarTipoContacto(tipoContacto: TipoContacto, i: any){
    this._tipoCService.activarTipoContacto(tipoContacto).subscribe(data => this.toastr.success('El contacto: '+ tipoContacto.tipo_contacto + ' ha sido activado'));
    this.listTipoC[i].estado = 1;
  }

  agregarNuevoTipoContacto() {

    this.nuevoTipoContacto = {
      id_tipo_contacto: 0, 
      tipo_contacto: this.nuevoTipoContacto.tipo_contacto, 
      descripcion:this.nuevoTipoContacto.descripcion,
      creado_por: 'SYSTEM', 
      fecha_creacion: new Date(), 
      modificado_por: 'SYSTEM', 
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._tipoCService.addTipoContacto(this.nuevoTipoContacto).subscribe(data => {
      this.toastr.success('contacto agregado con éxito');
      
       // Recargar la página
       location.reload();
       // Actualizar la vista
       this.ngZone.run(() => {        
       });
    });
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
  }


  editarTipoContacto(){
    this._tipoCService.editarTipoContacto(this.tipoContactoEditando).subscribe(data => {
      this.toastr.success('contacto editada con éxito');
      this.listTipoC[this.indice].tipo_contacto = this.tipoContactoEditando.tipo_contacto;
      this.listTipoC[this.indice].descripcion = this.tipoContactoEditando.descripcion;

      
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