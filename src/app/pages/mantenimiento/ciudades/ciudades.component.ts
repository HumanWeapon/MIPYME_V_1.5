import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Ciudades } from 'src/app/interfaces/mantenimiento/ciudades';
import { CiudadesService } from 'src/app/services/mantenimiento/ciudades.service';
import { NgZone } from '@angular/core';



@Component({
  selector: 'app-ciudades',
  templateUrl:'./ciudades.component.html',
  styleUrls: ['./ciudades.component.css']
})
export class CiudadesComponent implements OnInit{

  ciudadEditando: Ciudades = {
    id_ciudad: 0, 
    ciudad: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
    

  };

  nuevoCiudad: Ciudades = {
    id_ciudad: 0, 
    ciudad: '', 
    descripcion:'',
    creado_por: 'SYSTEM', 
    fecha_creacion: new Date(), 
    modificado_por: 'SYSTEM', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listCiudades: Ciudades[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private _ciudadService: CiudadesService, 
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
    this._ciudadService.getAllCiudades()
      .subscribe((res: any) => {
        this.listCiudades = res;
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
  if (field === 'ciudad' || field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}


  inactivarCiudad(ciudades: Ciudades, i: any){
    this._ciudadService.inactivarCiudad(ciudades).subscribe(data => this.toastr.success('La Ciudad: '+ ciudades.ciudad + ' ha sido inactivado'));
    this.listCiudades[i].estado = 2;
  }
  activarCiudad(ciudades: Ciudades, i: any){
    this._ciudadService.activarCiudad(ciudades).subscribe(data => this.toastr.success('La ciudad: '+ ciudades.ciudad + ' ha sido activado'));
    this.listCiudades[i].estado = 1;
  }

  agregarNuevoCiudad() {

    this.nuevoCiudad = {
      id_ciudad: 0, 
      ciudad: this.nuevoCiudad.ciudad, 
      descripcion:this.nuevoCiudad.descripcion,
      creado_por: 'SYSTEM', 
      fecha_creacion: new Date(), 
      modificado_por: 'SYSTEM', 
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._ciudadService.addCiudad(this.nuevoCiudad).subscribe(data => {
      this.toastr.success('Ciudad agregado con éxito');
      
       // Recargar la página
       location.reload();
       // Actualizar la vista
       this.ngZone.run(() => {        
       });
    });
  }


  obtenerIdCiudad(ciudades: Ciudades, i: any){
    this.ciudadEditando = {
    id_ciudad: ciudades.id_ciudad, 
    ciudad: ciudades.ciudad, 
    descripcion: ciudades.descripcion,
    creado_por: ciudades.creado_por, 
    fecha_creacion: ciudades.fecha_creacion, 
    modificado_por: ciudades.modificado_por, 
    fecha_modificacion: ciudades.fecha_modificacion,
    estado: ciudades.estado,

    };
    this.indice = i;
  }


  editarCiudad(){
    this._ciudadService.editarCiudad(this.ciudadEditando).subscribe(data => {
      this.toastr.success('Ciudad editada con éxito');
      this.listCiudades[this.indice].ciudad = this.ciudadEditando.ciudad;
      this.listCiudades[this.indice].descripcion = this.ciudadEditando.descripcion;

      
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
