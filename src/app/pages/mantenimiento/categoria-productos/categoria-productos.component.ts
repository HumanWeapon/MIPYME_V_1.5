//Elaborado Por Breydy Flores
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { NgZone } from '@angular/core';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { HttpErrorResponse } from '@angular/common/http';

                       

@Component({
  selector: 'app-categoria-productos',
  templateUrl:'./categoria-productos.component.html',
  styleUrls: ['./categoria-productos.component.css']
})

export class CategoriaProductosComponent implements OnInit{
 
  subscription: Subscription | undefined; 

  CategoriaEditando: Categoria = {
    id_categoria: 0,
    categoria: "",
    descripcion: "",
    creado_por: 'SYSTEM',
    fecha_creacion: new Date(), 
    modificado_por: 'SYSTEM',
    fecha_modificacion:new Date(), 
    estado: 0,
  };

  nuevaCategoriaProducto: Categoria = {
    id_categoria: 0,
    categoria: "",
    descripcion: "",
    creado_por: 'SYSTEM',
    fecha_creacion: new Date(), 
    modificado_por: 'SYSTEM',
    fecha_modificacion:new Date(), 
    estado: 0,
  };

  indice: any;
  dtOptions: DataTables.Settings = {};
  listCate: Categoria[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _categoriaService: CategoriaService,     
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _errorService: ErrorService,
    private _bitacoraService: BitacoraService,
    private _userService: UsuariosService
    ) { }
  
  ngOnInit(): void {
    this.getUsuario()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._categoriaService.getAllCategorias()
      .subscribe((res: any) => {
        this.listCate = res;
        this.dtTrigger.next(0);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  onInputChange(event: any, field: string) {
    if (field == 'categoria' || field == 'descripcion') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }

// Variable de estado para alternar funciones

toggleFunction(cate: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (cate.estado === 1 ) {
    this.inactivarCategoria(cate, i); // Ejecuta la primera función
  } else {
    this.activarCategoria(cate, i); // Ejecuta la segunda función
  }
}

  activarCategoria(categoria: Categoria, i: any){
    this._categoriaService.activarCategoria(categoria).subscribe(data => 
     this.toastr.success('La categoria: '+ categoria.categoria + ' ha sido activada')
     );
    this.listCate[i].estado = 1; 

  }
  
  inactivarCategoria(categoria: Categoria, i: any){
    this._categoriaService.inactivarCategoria(categoria).subscribe(data => 
     this.toastr.success('La categoria: '+ categoria.categoria + ' ha sido inactivada')
     );
    this.listCate[i].estado = 2; 
  }
  
  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Categoria', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listCate.forEach((cate, index) => {
    const row = [
      cate.categoria,
      cate.descripcion,
      cate.creado_por,
      cate.fecha_creacion,
      cate.modificado_por,
      cate.fecha_modificacion,
      this.getEstadoText(cate.estado) // Función para obtener el texto del estado
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

  agregarNuevaCategoriaProducto() {
    
    const userlocal=localStorage.getItem('usuario')
    if (userlocal){
      const catProducto = {
        categoria: this.nuevaCategoriaProducto.categoria,
        descripcion:this.nuevaCategoriaProducto.descripcion,
        creado_por: userlocal, 
        fecha_creacion: new Date(), 
        modificado_por: userlocal, 
        fecha_modificacion: new Date(),
        estado: 1,
      }
      this._categoriaService.addCategoriaProducto(catProducto).subscribe((data: Categoria) => {
        this.toastr.success('Categoría agregada exitosamente');
        location.reload();
      });
    }
  }


  obtenerIdCategoriaProducto(Cate: Categoria, i: any){
    this.CategoriaEditando = {
      id_categoria: Cate.id_categoria,
      categoria: Cate.categoria,
      descripcion: Cate.descripcion,
      creado_por: Cate.creado_por,
      fecha_creacion: Cate.fecha_creacion, 
      modificado_por: Cate.modificado_por,
      fecha_modificacion: Cate.fecha_modificacion, 
      estado: Cate.estado,

    };
    this.indice = i;
  }


  editarCategoriaProducto(){
    this._categoriaService.editarCategoriaProducto(this.CategoriaEditando).subscribe(data => {
      this.toastr.success('Categoria editada con éxito');
      this.listCate[this.indice].categoria = this.CategoriaEditando.categoria;
      this.listCate[this.indice].categoria = this.CategoriaEditando.descripcion;
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

  insertBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 5,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA LA EMPRESA CON EL ID: '+ dataCatProd.id_categoria
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 5,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA EL PAIS CON EL ID: '+ dataCatProd.id_categoria
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 5,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL CONTACTO CON EL ID: '+ dataCatProd.id_categoria
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 5,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL CONTACTO CON EL ID: '+ dataCatProd.id_categoria
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 5,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL CONTACTO CON EL ID: '+ dataCatProd.id_categoria
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}


