import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css']
})

export class PaisesComponent implements OnInit{

  paisEditando: Paises = {
    id_pais: 0, 
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };

  nuevoPais: Paises = {
    id_pais: 0, 
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPaises: Paises[] = [];
  data: any;
  

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _objService: PaisesService, 
    private toastr: ToastrService,
    ) { }

  
  ngOnInit(): void {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._objService.getAllPaises()
      .subscribe((res: any) => {
        this.listPaises= res;
        console.log(res)
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'paises') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    } else if (field === 'paises' || field === 'descripcion'){
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  
 
  
  inactivarPais(paises: Paises, i: any){
    this._objService.inactivarPais(paises).subscribe(data => this.toastr.success('El pais: '+ paises.pais+ ' ha sido inactivado'));
    this.listPaises[i].estado = 2;
  }
  activarPais(paises: Paises, i: any){
    this._objService.activarPais(paises).subscribe(data => this.toastr.success('El pais: '+ paises.pais+ ' ha sido activado'));
    this.listPaises[i].estado = 1;
  }

  agregarNuevoPais() {

    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      this.nuevoPais = {
        id_pais: 0,  
        pais: this.nuevoPais.pais, 
        descripcion:this.nuevoPais.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: new Date(), 
        modificado_por: usuarioLocal, 
        fecha_modificacion: new Date()

      };
      console.log(this.nuevoPais);
      this._objService.addPais(this.nuevoPais).subscribe(data => {
        this.toastr.success('Pais agregado con éxito');
         location.reload();
      });
    }
  }


  obtenerIdPais(paises: Paises, i: any){
    this.paisEditando = {
    id_pais: paises.id_pais,
    pais: paises.pais, 
    descripcion: paises.descripcion,  
    creado_por: paises.creado_por, 
    fecha_creacion: paises.fecha_creacion, 
    modificado_por: paises.modificado_por, 
    fecha_modificacion: paises.fecha_modificacion,
    estado: paises.estado

    };
    this.indice = i;
  
  }


  editarPais(){
    this._objService.editarPais(this.paisEditando).subscribe(data => {
      this.toastr.success('Pais editado con éxito');
      this.listPaises[this.indice].pais = this.paisEditando.pais;
      this.listPaises[this.indice].pais = this.paisEditando.descripcion;
        // Recargar la página
        location.reload();
        // Actualizar la vista
              
        });
    
    };
  }
