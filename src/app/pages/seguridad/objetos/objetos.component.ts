import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-objetos',
  templateUrl:'./objetos.component.html',
  styleUrls: ['./objetos.component.css']
})
export class ObjetosComponent implements OnInit{

  objetoEditando: Objetos = {
    id_objeto: 0, 
    objeto: '', 
    descripcion:'', 
    tipo_objeto: '', 
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

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _objService: ObjetosService,
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
    this._objService.getAllObjetos()
      .subscribe((res: any) => {
        this.listObjetos = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'objeto') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    } else if (field === 'tipo_objeto' || field === 'descripcion'){
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  
 
  
  inactivarObjeto(objetos: Objetos, i: any){
    this._objService.inactivarObjeto(objetos).subscribe(data => this.toastr.success('El objeto: '+ objetos.objeto+ ' ha sido inactivado'));
    this.listObjetos[i].estado_objeto = 2;
  }
  activarObjeto(objetos: Objetos, i: any){
    this._objService.activarObjeto(objetos).subscribe(data => this.toastr.success('El objeto: '+ objetos.objeto+ ' ha sido activado'));
    this.listObjetos[i].estado_objeto = 1;
  }

  agregarNuevoObjeto() {

    this.nuevoObjeto = {
      id_objeto: 0, 
      objeto: this.nuevoObjeto.objeto, 
      descripcion:this.nuevoObjeto.descripcion, 
      tipo_objeto: this.nuevoObjeto.tipo_objeto, 
      estado_objeto: 0,
      creado_por: 'SYSTEM', 
      fecha_creacion: new Date(), 
      modificado_por: 'SYSTEM', 
      fecha_modificacion: new Date()

    };

    this._objService.addObjeto(this.nuevoObjeto).subscribe(data => {
      this.toastr.success('Objeto agregado con éxito');
      
       // Recargar la página
       location.reload();
       // Actualizar la vista
       this.ngZone.run(() => {        
       });
    });
  }


  obtenerIdObjeto(objetos: Objetos, i: any){
    this.objetoEditando = {
    id_objeto: objetos.id_objeto, 
    objeto: objetos.objeto, 
    descripcion: objetos.descripcion, 
    tipo_objeto: objetos.tipo_objeto, 
    estado_objeto: objetos.estado_objeto,
    creado_por: objetos.creado_por, 
    fecha_creacion: objetos.fecha_creacion, 
    modificado_por: objetos.modificado_por, 
    fecha_modificacion: objetos.fecha_modificacion

    };
    this.indice = i;
  }


  editarObjeto(){
    this._objService.editarObjeto(this.objetoEditando).subscribe(data => {
      this.toastr.success('Objeto editado con éxito');
      this.listObjetos[this.indice].objeto = this.objetoEditando.objeto;
      this.listObjetos[this.indice].descripcion = this.objetoEditando.descripcion;
      this.listObjetos[this.indice].estado_objeto = this.objetoEditando.estado_objeto;
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
