import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';


@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})

export class ProductosComponent implements OnInit{

  productoEditando: Productos = {
    id_producto: 0, 
    id_categoria: 0, 
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
    private _objService: ProductosService, 
    private toastr: ToastrService,
    private _categoriaProductos: CategoriaService
    ) { }

  
  ngOnInit(): void {

    this._categoriaProductos.getAllCategorias().subscribe(data => {
      this.listCategorias = data
      console.log(this.listCategorias)
    });


    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._objService.getAllProductos()
      .subscribe((res: any) => {
        this.listProductos= res;
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
    if (field === 'productos') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    } else if (field === 'tipo_producto' || field === 'descripcion'){
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  
 
  
  inactivarProducto(productos: Productos, i: any){
    this._objService.inactivarProductos(productos).subscribe(data => this.toastr.success('El producto: '+ productos.producto+ ' ha sido inactivado'));
    this.listProductos[i].estado = 2;
  }
  activarProductos(productos: Productos, i: any){
    this._objService.activarProductos(productos).subscribe(data => this.toastr.success('El producto: '+ productos.producto+ ' ha sido activado'));
    this.listProductos[i].estado = 1;
  }

  agregarNuevoProducto() {

    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      this.nuevoProducto = {
        id_producto: 0, 
        id_categoria: this.nuevoProducto.id_categoria, 
        producto: this.nuevoProducto.producto, 
        descripcion:this.nuevoProducto.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: new Date(), 
        modificado_por: usuarioLocal, 
        fecha_modificacion: new Date()

      };
      console.log(this.nuevoProducto);
      this._objService.addProducto(this.nuevoProducto).subscribe(data => {
        this.toastr.success('Producto agregado con éxito');
         location.reload();
      });
    }
  }


  obtenerIdProductos(productos: Productos, i: any){
    this.productoEditando = {
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
    
    this._objService.editarProducto(this.productoEditando).subscribe(data => {
      this.toastr.success('Producto editado con éxito');
      if(this.productoAllCategoria == null){
        //no se puede editar el usuario
      }else{
      this.productoAllCategoria[this.indice].producto = this.productoEditando.producto;
      this.productoAllCategoria[this.indice].descripcion = this.productoEditando.descripcion;
      this.productoAllCategoria[this.indice].categoria.cat = cat.cat;
       // Recargar la página
       location.reload();
      }

    });
  }}
