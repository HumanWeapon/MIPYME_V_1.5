import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { ErrorService } from 'src/app/services/error.service';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-roles',
  templateUrl:'./roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit{

  rolEditando: Roles = {
    id_rol: 0, 
    rol: '', 
    descripcion: '', 
    estado_rol: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
  };

  nuevoRol: Roles = {
    id_rol: 0, 
    rol: '', 
    descripcion: '', 
    estado_rol: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listRoles: Roles[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _rolService: RolesService,
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
    this._rolService.getAllRoles()
      .subscribe((res: any) => {
        this.listRoles = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'rol') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    }
  }

  
  inactivarRol(roles: Roles, i: any){
    this._rolService.inactivarRol(roles).subscribe(data => this.toastr.success('El rol: '+ roles.rol+ ' ha sido inactivado'));
    this.listRoles[i].estado_rol = 2;
  }
  activarRol(roles: Roles, i: any){
    this._rolService.activarRol(roles).subscribe(data => this.toastr.success('El rol: '+ roles.rol+ ' ha sido activado'));
    this.listRoles[i].estado_rol = 1;
  }

  agregarNuevoRol() {

    this.nuevoRol = {
      id_rol: 0, 
      rol: this.nuevoRol.rol , 
      descripcion: '', 
      estado_rol: 1,
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(),
    };

    this._rolService.addRol(this.nuevoRol).subscribe(data => {
      this.toastr.success('Rol agregado con éxito');

        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    });
  }


  obtenerIdRol(roles: Roles, i: any){
    this.rolEditando = {
      id_rol: roles.id_rol, 
      rol: roles.rol , 
      descripcion: roles.descripcion, 
      estado_rol: roles.estado_rol,
      creado_por: roles.creado_por, 
      fecha_creacion: roles.fecha_creacion, 
      modificado_por: roles.modificado_por, 
      fecha_modificacion: roles.fecha_modificacion,
    };
    this.indice = i;
  }


  editarRol(){
    this._rolService.editarRol(this.rolEditando).subscribe(data => {
      this.toastr.success('Rol editado con éxito');
      this.listRoles[this.indice].rol = this.rolEditando.rol;

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
