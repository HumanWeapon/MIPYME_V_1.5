//Elaborado Por Breydy Flores
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { NgZone } from '@angular/core';

                       

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
    private router: Router, 
    private ngZone: NgZone
    ) { }
  
  ngOnInit(): void {
    this.getCarProd();

    /*this.subscription = this._categoriaService.refresh$.subscribe( ()=>{
      this.ngOnDestroy();
      this.getCarProd();
    } )*/
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  getCarProd(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._categoriaService.getAllCategorias()
      .subscribe((res: any) => {
        this.listCate = res;
        this.dtTrigger.next(0);
      });
  }

  onInputChange(event: any, field: string) {
    if (field == 'categoria' || field == 'descripcion') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }

  activarCategoria(categoria: Categoria, i: any){
    this._categoriaService.activarCategoria(categoria).subscribe(data => this.toastr.success('La categoria: '+ categoria.id_categoria + ' ha sido activada'));
    this.listCate[i].estado = 1; 

  }
  
  inactivarCategoria(categoria: Categoria, i: any){
    this._categoriaService.inactivarCategoria(categoria).subscribe(data => this.toastr.success('La categoria: '+ categoria.id_categoria + ' ha sido inactivada'));
    this.listCate[i].estado = 2; 
  }
  

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
}