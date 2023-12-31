import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Parametros } from 'src/app/interfaces/seguridad/parametros';
import { ParametrosService } from 'src/app/services/seguridad/parametros.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-parametros',
  templateUrl:'./parametros.component.html',
  styleUrls: ['./parametros.component.css']
})
export class ParametrosComponent implements OnInit{

  parametroEditando: Parametros = {
    id_parametro: 0,
    parametro: '',
    estado_parametro: 0,
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
  };

  nuevoParametro: Parametros = {
    id_parametro: 0,
    parametro: '',
    estado_parametro: 0,
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
    
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listParametros: Parametros[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
 

  constructor(
    private _parametroService: ParametrosService, 
    private toastr: ToastrService,
    private router: Router, 
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService
    ) { }

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._parametroService.getAllParametros()
      .subscribe((res: any) => {
        this.listParametros = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'parametro') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    }
  }



   // Variable de estado para alternar funciones

toggleFunction(parametros: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (parametros.estado_parametro === 1 ) {
    this.inactivarParametro(parametros, i); // Ejecuta la primera función
  } else {
    this.activarParametro(parametros, i); // Ejecuta la segunda función
  }
}
 
inactivarParametro(parametros: any, i: number){
    this._parametroService.inactivarParametro(parametros).subscribe(data => 
    this.toastr.success('El parametro: '+ parametros.parametro+ ' ha sido inactivado')
    );
    this.listParametros[i].estado_parametro = 2;
  }
  activarParametro(parametros: any, i: number){
    this._parametroService.activarParametro(parametros).subscribe(data => 
    this.toastr.success('El parametro: '+ parametros.parametro+ ' ha sido activado')
    );
    this.listParametros[i].estado_parametro = 1;
  }



   /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['ID', 'Parametro', 'Valor', 'Id Usuario',  'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listParametros.forEach((parametro, index) => {
    const row = [
      parametro.id_parametro,
      parametro.parametro,
      parametro.valor,
      parametro.id_usuario,
      parametro.creado_por,
      parametro.fecha_creacion,
      parametro.modificado_por,
      parametro.fecha_modificacion,
      parametro.alerta_busqueda, 
      this.getEstadoText(parametro.estado_parametro) // Función para obtener el texto del estado
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


  agregarNuevoParametro() {

    this.nuevoParametro = {
      id_parametro: 0,
      parametro: this.nuevoParametro.parametro,
      estado_parametro: this.nuevoParametro.estado_parametro,
      valor: this.nuevoParametro.valor,
      id_usuario: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      alerta_busqueda: 0, 
    };

    this._parametroService.addParametro(this.nuevoParametro).subscribe(data => {
      this.toastr.success('Parametro agregado con éxito');
    });

      // Recargar la página
      location.reload();
      // Actualizar la vista
      this.ngZone.run(() => {        
      });
  }


  obtenerIdParametro(parametro: Parametros, i: any){
    this.parametroEditando = {
      id_parametro: parametro.id_parametro,
      parametro: parametro.parametro,
      estado_parametro: parametro.estado_parametro,
      valor: parametro.valor,
      id_usuario: parametro.id_usuario,
      creado_por: parametro.creado_por,
      fecha_creacion: parametro.fecha_creacion,
      modificado_por: parametro.modificado_por,
      fecha_modificacion: parametro.fecha_modificacion,
      alerta_busqueda: parametro.alerta_busqueda, 
    };
    this.indice = i;
  }


  editarParametro(){
    this._parametroService.editarParametro(this.parametroEditando).subscribe(data => {
      this.toastr.success('Parametro editado con éxito');
      this.listParametros[this.indice].parametro = this.parametroEditando.parametro;
      this.listParametros[this.indice].valor = this.parametroEditando.valor;

        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
      
    });
  }



  
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

  insertBitacora(dataParametro: Parametros){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 29,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA EL PARAMETRO CON EL ID: '+ dataParametro.parametro
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataParametro: Parametros){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA EL PARAMETRO CON EL ID: '+ dataParametro.parametro
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataParametro: Parametros){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL PARAMETRO CON EL ID: '+ dataParametro.parametro
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataParametro: Parametros){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL PARAMETRO CON EL ID: '+ dataParametro.parametro
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataParametro: Parametros){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL PARAMETRO CON EL ID: '+ dataParametro.parametro
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}










/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */