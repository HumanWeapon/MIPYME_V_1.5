import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css']
})

export class PaisesComponent implements OnInit{

  paisEditando: Paises = {
    id_pais: 0, 
    id_contacto:0,
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0,
    cod_pais: ''
  };

  nuevoPais: Paises = {
    id_pais: 0,
    id_contacto:0, 
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0,
    cod_pais: ''
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPaises: Paises[] = [];
  data: any;
  

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _paisService: PaisesService, 
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService
    ) {}

  
  ngOnInit(): void {
    this.getUsuario()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._paisService.getAllPaises()
      .subscribe((res: any) => {
        this.listPaises= res;
        console.log(res)
        this.dtTrigger.next(null);
      });
      this.getUsuario();

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
    } else if (field === 'paises'){
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  
  // Variable de estado para alternar funciones

toggleFunction(paises: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (paises.estado == 1 ) {
    this.inactivarPais(paises, i); // Ejecuta la primera función
  } else {
    this.activarPais(paises, i); // Ejecuta la segunda función
  }
}
 
  inactivarPais(paises: Paises, i: any){
    this._paisService.inactivarPais(paises).subscribe(data => {
    this.toastr.success('El pais: '+ paises.pais+ ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
    this.listPaises[i].estado = 2;
  }
  activarPais(paises: Paises, i: any){
    this._paisService.activarPais(paises).subscribe(data => {
    this.toastr.success('El pais: '+ paises.pais+ ' ha sido activado');
    this.activarBitacora(data);
  });
    this.listPaises[i].estado = 1;
  }

  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Pais', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listPaises.forEach((paises, index) => {
    const row = [
      paises.pais,
      paises.descripcion,
      paises.creado_por,
      paises.fecha_creacion,
      paises.modificado_por,
      paises.fecha_modificacion,
      this.getEstadoText(paises.estado) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  doc.autoTable({
    head: [headers],
    body: data,
  });

  doc.output('dataurlnewwindow', null, 'Pymes.pdf');
}

getEstadoText(estado: number): string {
  switch (estado) {
    case 1:
      return 'ACTIVO';
    case 2:
      return 'INACTIVO';
    default:
      return 'Desconocido';
  }
}


/**************************************************************/

  agregarNuevoPais() {

    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      this.nuevoPais = {
        id_pais: 0,  
        id_contacto:0,
        pais: this.nuevoPais.pais, 
        descripcion:this.nuevoPais.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: new Date(), 
        modificado_por: usuarioLocal, 
        fecha_modificacion: new Date(),
        cod_pais: ''
      };
      console.log(this.nuevoPais);
      this._paisService.addPais(this.nuevoPais).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.toastr.success('Pais agregado con éxito')
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
      location.reload();
      this.ngZone.run(() => {        
      });
    }
  }


  obtenerIdPais(paises: Paises, i: any){
    this.paisEditando = {
    id_contacto: paises.id_contacto,
    id_pais: paises.id_pais,
    pais: paises.pais, 
    descripcion: paises.descripcion,  
    creado_por: paises.creado_por, 
    fecha_creacion: paises.fecha_creacion, 
    modificado_por: paises.modificado_por, 
    fecha_modificacion: paises.fecha_modificacion,
    estado: paises.estado,
    cod_pais: ''
    };
    this.indice = i;
  
  }


  editarPais(){
    this._paisService.editarPais(this.paisEditando).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('Pais editado con éxito');
      this.listPaises[this.indice].pais = this.paisEditando.pais;
      this.listPaises[this.indice].pais = this.paisEditando.descripcion;
        // Recargar la página
        location.reload();
        // Actualizar la vista
              
        });
    
    };

/*************************************************************** Métodos de Bitácora ***************************************************************************/

getUser: Usuario = {
  id_usuario: 0,
  creado_por: '',
  fecha_creacion: new Date(),
  modificado_por: '',
  fecha_modificacion: new Date(),
  usuario: '',
  nombre_usuario: '',
  correo_electronico: '',
  estado_usuario: 0,
  contrasena: '',
  id_rol: 0,
  fecha_ultima_conexion: new Date(),
  primer_ingreso: new Date(),
  fecha_vencimiento: new Date(),
  intentos_fallidos: 0
};

getUsuario(){
  const userlocal = localStorage.getItem('usuario');
  if(userlocal){
    this.getUser = {
      usuario: userlocal,
      id_usuario: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      nombre_usuario: '',
      correo_electronico: '',
      estado_usuario: 0,
      contrasena: '',
      id_rol: 0,
      fecha_ultima_conexion: new Date(),
      primer_ingreso: new Date(),
      fecha_vencimiento: new Date(),
      intentos_fallidos: 0
  }
 }

 this._userService.getUsuario(this.getUser).subscribe({
   next: (data) => {
     this.getUser = data;
   },
   error: (e: HttpErrorResponse) => {
     this._errorService.msjError(e);
   }
 });
}

insertBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL PAIS: '+ dataPais.pais
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL PAIS: '+ dataPais.pais
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL PAIS: '+ dataPais.pais
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL PAIS: '+ dataPais.pais
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL PAIS: '+ dataPais.pais
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


}
