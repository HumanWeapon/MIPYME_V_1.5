import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ContactoTelefono } from 'src/app/interfaces/contacto/contactoTelefono';
import { ContactoTService } from 'src/app/services/contacto/contactoTelefono.service';
import { NgZone } from '@angular/core';



@Component({
  selector: 'app-contacto-telefono',
  templateUrl:'./telefonos.component.html',
  styleUrls: ['./telefonos.component.css']
})
export class TelefonosComponent implements OnInit{

  contactoTEditando: ContactoTelefono = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: '', 
    extencion: '',
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoContactoT: ContactoTelefono = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: '', 
    extencion: '',
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listContactoT: ContactoTelefono[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private _contactoTService: ContactoTService,
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

    this._contactoTService.getAllContactosTelefono()
      .subscribe((res: any) => {
        this.listContactoT = res;
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
  if (field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}


  inactivarContactoTelefono(contactoTelefono: ContactoTelefono, i: any){
    this._contactoTService.inactivarContactoTelefono(contactoTelefono).subscribe(data => this.toastr.success('El telefono: '+ contactoTelefono.telefono + ' ha sido inactivado'));
    this.listContactoT[i].estado = 2;
  }
  activarContactoTelefono(contactoTelefono: ContactoTelefono, i: any){
    this._contactoTService.activarContactoTelefono(contactoTelefono).subscribe(data => this.toastr.success('La telefono: '+ contactoTelefono.telefono  + ' ha sido activado'));
    this.listContactoT[i].estado = 1;
  }

  agregarNuevoContactoT() {

    this.nuevoContactoT = {
      id_telefono: 0, 
      id_contacto: 0,
      id_tipo_telefono: 0,
      telefono: '', 
      extencion: '',
      descripcion:'',
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(),
      estado: 0,
    };

    this._contactoTService.addContactoT(this.nuevoContactoT).subscribe(data => {
      this.toastr.success('Contacto agregado con éxito');
      
       // Recargar la página
       location.reload();
       // Actualizar la vista
       this.ngZone.run(() => {        
       });
    });
  }


  obtenerIdContactoT(contactoT: ContactoTelefono, i: any){
    this.contactoTEditando = {
      id_telefono: contactoT.id_telefono, 
      id_contacto: contactoT.id_contacto,
      id_tipo_telefono: contactoT. id_tipo_telefono,
      telefono: contactoT.telefono, 
      extencion: contactoT.extencion,
      descripcion: contactoT.descripcion,
      creado_por: contactoT.creado_por, 
      fecha_creacion: contactoT.fecha_creacion, 
      modificado_por: contactoT.modificado_por, 
      fecha_modificacion: contactoT.fecha_modificacion,
      estado: contactoT.estado,
    

    };
    this.indice = i;
  }


  editarContactoTelefono(){
    this._contactoTService.editarContactoTelefono(this.contactoTEditando).subscribe(data => {
      this.toastr.success('contacto editado con éxito');
      this.listContactoT[this.indice].telefono = this.contactoTEditando.telefono;
      this.listContactoT[this.indice].extencion = this.contactoTEditando.extencion;
      this.listContactoT[this.indice].descripcion = this.contactoTEditando.descripcion;

      
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

