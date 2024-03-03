import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { HttpErrorResponse } from '@angular/common/http';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { da } from 'date-fns/locale';


@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})

export class ProductosComponent implements OnInit{

  productos: any[] = [];


  productoEditando: Productos = {
    id_producto: 0, 
    id_categoria: 0,
    id_contacto:0,
    id_pais:0,
    producto:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };

  nuevoProducto: Productos = {
    id_producto: 0, 
    id_categoria: 0, 
    id_contacto:0,
    id_pais:0,
    producto:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listProductos: Productos[] = [];
  data: any;
  listCategorias: Categoria[] = [];

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  cat: Categoria[] = [];
  productoAllCategoria: any[] = []


  constructor(
    private _productoService: ProductosService, 
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _ngZone: NgZone,
    private _categoriaProductos: CategoriaService
    ) {}

  
  ngOnInit(): void {
    this.getUsuario()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._productoService.getAllProductos()
      .subscribe((res: any) => {
        this.productos = res;
        this.dtTrigger.next(null);
      });

      this._categoriaProductos.getAllCategorias().subscribe(data => {
        this.listCategorias = data
      });
      this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onInputChange(event: any, field: string) {
    if (field == 'producto') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }
  

  agregarNuevoProducto() {
    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      this.nuevoProducto = {
        id_producto: 0, 
        id_contacto:0,
        id_pais:0,
        id_categoria: this.nuevoProducto.id_categoria,
        producto: this.nuevoProducto.producto, 
        descripcion:this.nuevoProducto.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: new Date(), 
        modificado_por: usuarioLocal, 
        fecha_modificacion: new Date()

      };
      if (!this.nuevoProducto.producto || !this.nuevoProducto.descripcion) {
        this.toastr.warning('Debes completar los campos vacíos');
      }else{
        this._productoService.addProducto(this.nuevoProducto).subscribe({
          next: (data) => {
            console.log(data);
            this.insertBitacora(data);
            this.toastr.success('Producto agregado con éxito');
            this.productos.push(data);
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
      }
    }
  }
  


  obtenerIdProductos(productos: Productos, i: any){
    this.productoEditando = {
    id_contacto:productos.id_contacto,
    id_pais:productos.id_pais,
    id_producto: productos.id_producto,
    id_categoria: productos.id_categoria, 
    producto: productos.producto, 
    descripcion: productos.descripcion,  
    creado_por: productos.creado_por, 
    fecha_creacion: productos.fecha_creacion, 
    modificado_por: productos.modificado_por, 
    fecha_modificacion: productos.fecha_modificacion,
    estado: productos.estado

    };
    this.indice = i;
  
  }


  editarProducto(cat: any) {
    this.productoEditando.producto = this.productoEditando.producto.toUpperCase();
    this.productoEditando.descripcion = this.productoEditando.descripcion.toUpperCase();

    this._productoService.editarProducto(this.productoEditando).subscribe({
      next: (data) =>  {
        this.updateBitacora(data);
        this.toastr.success('Producto editado con éxito');
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  /**********************************************************/
// Variable de estado para alternar funciones

toggleFunction(productos: Productos, i: number) {
  // Ejecuta una función u otra según el estado
  if (productos.estado == 1) {
    this.inactivarProducto(productos, i); // Ejecuta la primera función
  } else {
    this.activarProductos(productos, i); // Ejecuta la segunda función
  }
}

  
activarProductos(productos: Productos, i: any) {
  this._productoService.activarProductos(productos).subscribe(data => {
    this.toastr.success('El producto: ' + productos.producto + ' ha sido activado');
    this.activarBitacora(data);
    this.productos[i].estado = 1; // Actualizar el estado localmente
  });
}

inactivarProducto(productos: Productos, i: any) {
   this._productoService.inactivarProductos(productos).subscribe(data => {
    this.toastr.success('El producto: ' + productos.producto + ' ha sido inactivado');
    this.inactivarBitacora(data);
    this.productos[i].estado = 2; // Actualizar el estado localmente
  });
}

/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Producto', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listProductos.forEach((obj, index) => {
    const row = [
      obj.producto,
      obj.descripcion,
      obj.creado_por,
      obj.fecha_creacion,
      obj.modificado_por,
      obj.fecha_modificacion,
      this.getEstadoText(obj.estado) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  doc.autoTable({
    head: [headers],
    body: data,
  });

  doc.output('dataurlnewwindow', null, 'Productos.pdf');
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

insertBitacora(dataProductos: Productos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 16,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL PRODUCTO: '+ dataProductos.producto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataProductos: Productos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 16,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL PRODUCTO: '+ dataProductos.producto
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataProductos: Productos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 16,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL PRODUCTO CON EL ID: '+ dataProductos.producto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataProductos: Productos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 16,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL PRODUCTO: '+ dataProductos.producto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataProductos: Productos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 16,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL PRODUCTO CON EL ID: '+ dataProductos.producto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}

