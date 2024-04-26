import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Historial } from 'src/app/interfaces/historialBusqueda/historial';
import { ErrorService } from 'src/app/services/error.service';
import { HistoriaBusquedaService } from 'src/app/services/pyme/historia-busqueda.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';

@Component({
  selector: 'app-historial-pyme',
  templateUrl: './historial-pyme.component.html',
  styleUrls: ['./historial-pyme.component.css']
})
export class HistorialPymeComponent {

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;


  id_pyme: any;

  dtOptions: DataTables.Settings = {};
  listHistB: any[] = [];
  data: any;
  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();




  constructor(
    private _historialB: HistoriaBusquedaService,
    private _toastr: ToastrService,
    private _errorService: ErrorService,
    private _pymeService: PymeService,
    private _permisosService: PermisosService
    ) {}

  
  ngOnInit(): void {
    this.getIdPyme();
    this.getPermnisosObjetos();
  }


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  getIdPyme(){
    const idPYME = localStorage.getItem('nombre_pyme');
    if(idPYME){
      this._pymeService.getOnePyme(idPYME).subscribe({
        next: (data) => {
          console.log(data);
          this.id_pyme = data.id_pyme;
          this.dataTable();
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
  dataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._historialB.gethistorial_busqueda_PYME(this.id_pyme)
    .subscribe((data: any) => {
      this.listHistB = data;
      this.dtTrigger.next(0);
    });
  }



  getPermnisosObjetos(){
    const idObjeto = localStorage.getItem('id_objeto');
    const idRol = localStorage.getItem('id_rol');
    if(idObjeto && idRol){
      this._permisosService.getPermnisosObjetos(idRol, idObjeto).subscribe({
        next: (data: any) => {
          this.consultar = data.permiso_consultar;
          this.insertar = data.permiso_insercion;
          this.actualizar = data.permiso_actualizacion;
          this.eliminar = data.permiso_eliminacion;
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
}
