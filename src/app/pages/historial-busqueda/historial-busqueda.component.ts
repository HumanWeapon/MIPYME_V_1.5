import { Component, NgZone } from '@angular/core';
import { Pyme } from 'src/app/interfaces/pyme/pyme';  
import { Empresa } from 'src/app/interfaces/empresa/empresas'; 
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { Historial } from 'src/app/interfaces/historialBusqueda/historial';
import { SubmenuData } from 'src/app/interfaces/subMenuData/subMenuData';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HistoriaBusquedaService } from 'src/app/services/pyme/historia-busqueda.service';

@Component({
  selector: 'app-historial-busqueda',
  templateUrl: './historial-busqueda.component.html',
  styleUrls: ['./historial-busqueda.component.css']
})
export class HistorialBusquedaComponent {


  HistorialEditando: Historial = {
    id_historial: 0, 
    id_pyme: 0, 
    id_producto: 0, 
    id_pais: 0, 
    id_empresa: 0, 
    descripcion:'', 
    estado: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };

  nuevoHistorial: Historial = {
    id_historial: 0, 
    id_pyme: 0, 
    id_producto: 0, 
    id_pais: 0, 
    id_empresa: 0, 
    descripcion:'', 
    estado: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listHistB: any[] = [];
  data: any;
  submenusData: SubmenuData[] = [];
  submenuSeleccionado: string | undefined;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();




  constructor(
    private _historialB: HistoriaBusquedaService,
    private toastr: ToastrService,
    private _ngZone: NgZone,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private datePipe: DatePipe
    ) {}

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._historialB.getAllHistorialB()
    .subscribe((data: any) => {
      this.listHistB = data;
      this.dtTrigger.next(0);
    });
  }


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

 


/*
  agregarNuevoHistorial() {
    const userLocal = localStorage.getItem('usuario');
    if (userLocal) {
      this.nuevoHistorial = {
        id_historial: 0, 
        id_pyme: 0, 
        id_producto: 0, 
        id_pais: 0, 
        id_empresa: 0, 
        descripcion: this.nuevoHistorial.descripcion, 
        estado: 1,
        creado_por: userLocal, 
        fecha_creacion: new Date(), 
        modificado_por: userLocal, 
        fecha_modificacion: new Date()
      };
    
      this._historialB.addHistorialB(this.nuevoHistorial).subscribe({
        next: (data) => {
          this.toastr.success(data.msg, 'Historial  agregado con éxito');
          // Puedes hacer otras acciones aquí después de agregar el objeto con éxito, como actualizar la lista de objetos
        },
        error: (e: HttpErrorResponse) => {
          if (e.error && e.error.msg) {
            this.toastr.error(e.error.msg, 'Error al agregar Historial');
          } else {
            this.toastr.error('Error al agregar Historial', 'Error');
          }
        }
      });
    }
  }
  */

    obtenerIdHistorialB(historial: Historial, i: any){
      this.HistorialEditando = {
        id_historial: historial.id_historial, 
        id_pyme: historial.id_pyme,
        id_producto: historial.id_producto, 
        id_pais: historial.id_pais, 
        id_empresa: historial.id_empresa, 
        descripcion: historial.descripcion, 
        estado: historial.estado,
        creado_por: historial.creado_por, 
        fecha_creacion: historial.fecha_creacion, 
        modificado_por: historial.modificado_por, 
        fecha_modificacion: historial.fecha_modificacion
      };
      this.indice = i;
      
    }
  

}
