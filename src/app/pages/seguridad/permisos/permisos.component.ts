import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Permisos } from 'src/app/interfaces/seguridad/permisos';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit, OnDestroy {
  roles: Roles[] = [];
  objetos: Objetos[] = [];

  permisoeditando: Permisos = {
    id_permisos: 0,
    id_rol: 0,
    id_objeto: 0,
    permiso_insercion: false,
    permiso_eliminacion: false,
    permiso_actualizacion: false,
    permiso_consultar: false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };

  nuevoPermiso: Permisos = {
    id_permisos: 0,
    id_rol: 0,
    id_objeto: 0,
    permiso_insercion: false,
    permiso_eliminacion: false,
    permiso_actualizacion: false,
    permiso_consultar: false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };

  deletePermiso: Permisos = {
    id_permisos: 0, 
    id_rol: 0, 
    id_objeto: 0,
    permiso_insercion: false,
    permiso_eliminacion: false,
    permiso_actualizacion: false,
    permiso_consultar:false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };

  limpiarFormulario() {
    this.permisoeditando = {
      id_permisos: 0,
      id_rol: 0,
      id_objeto: 0,
      permiso_insercion: false,
      permiso_eliminacion: false,
      permiso_actualizacion: false,
      permiso_consultar: false,
      estado_permiso: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
    };
  }
  

  indice: any;

  dtOptions: DataTables.Settings = {};
  listPermisos: Permisos[] = [];
  data: any;
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private _permService: PermisosService, 
    private _objectService: ObjetosService,
    private _rolesService: RolesService, 
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.getAllObjetos();
    this.getAllRoles();

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    };

    this._permService.getAllPermisos().subscribe((res: any) => {
      this.listPermisos = res;
      this.dtTrigger.next(null);
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getAllRoles() {
    this._rolesService.getAllRoles().subscribe((data: Roles[]) => {
      this.roles = data;
    });
  }

  getAllObjetos() {
    this._objectService.getAllObjetos().subscribe((data: Objetos[]) => {
      this.objetos = data;
    });
  }

  inactivarPermiso(permisos: Permisos, i: any){
    this._permService.inactivarPermiso(permisos).subscribe(data => this.toastr.success('El permiso: ha sido inactivado'));
    this.listPermisos[i].estado_permiso = 2;
  }
  activarPermiso(permisos: Permisos, i: any){
    this._permService.activarPermiso(permisos).subscribe(data => this.toastr.success('El permiso: ha sido activado'));
    this.listPermisos[i].estado_permiso = 1;
  }


  agregarNuevoPermiso() {
    this.nuevoPermiso.id_rol = 3; // Asigna el ID del rol 
    this.nuevoPermiso.id_objeto = 3; // Asigna el ID del objeto

    this._permService.addPermiso(this.nuevoPermiso).subscribe(() => {
      this.toastr.success('Permiso agregado con éxito');
      // Recargar la página
        location.reload();  
      this.ngZone.run(() => {
        // Actualizar la vista
      });    
    });
  }

  /*agregarNuevoPermiso() {
    // Obtén el valor seleccionado en el campo de selección de rol y objeto
    const selectedRol = this.nuevoPermiso.id_rol; // Asigna el valor del rol seleccionado
    const selectedObjeto = this.nuevoPermiso.id_objeto; // Asigna el valor del objeto seleccionado
  
    // Luego, asigna estos valores a this.nuevoPermiso
    this.nuevoPermiso.id_rol = selectedRol;
    this.nuevoPermiso.id_objeto = selectedObjeto;
  
    this._permService.addPermiso(this.nuevoPermiso).subscribe(() => {
      this.toastr.success('Permiso agregado con éxito');
    });
  }*/
  

  obtenerIdPermiso(permisos: Permisos, i: any) {
    this.permisoeditando = { ...permisos };
    this.indice = i;
  }

  editarPermiso() {
    this._permService.editarPermiso(this.permisoeditando).subscribe(() => {
      this.toastr.success('Permiso editado con éxito');
      this.listPermisos[this.indice] = { ...this.permisoeditando };
      // Recargar la página
      location.reload();
      // Actualizar la vista
      this.ngZone.run(() => {        
      });
    });
  }
  getRolNombre(idRol: number): string {
    const rol = this.roles.find(rol => rol.id_rol === idRol);
    return rol ? rol.rol : 'Rol no encontrado';
  }
  getObjetoNombre(idObjeto: number): string {
    const objeto = this.objetos.find(objeto => objeto.id_objeto === idObjeto);
    return objeto ? objeto.objeto : 'Objeto no encontrado';
  }


}
