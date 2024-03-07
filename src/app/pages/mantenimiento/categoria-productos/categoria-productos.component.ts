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
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español

                       

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
  getCate: any;


  constructor(
    private _categoriaService: CategoriaService,     
    private _toastr: ToastrService,
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
      this.getUsuario();
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
  if (cate.estado == 1 ) {
    this.inactivarCategoria(cate, i); // Ejecuta la primera función
  } else {
    this.activarCategoria(cate, i); // Ejecuta la segunda función
  }
}


getDate(): string {
  // Obtener la fecha actual
  const currentDate = new Date();
  // Formatear la fecha en el formato deseado
  return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}


  activarCategoria(categoria: Categoria, i: any){
    this._categoriaService.activarCategoria(categoria).subscribe({
      next: (data) => {
        this.activarBitacora(data);
        this._toastr.success('La categoria: '+ categoria.categoria + ' ha sido activada')
        
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.listCate[i].estado = 1;
  }
  
  inactivarCategoria(categoria: Categoria, i: any){
    this._categoriaService.inactivarCategoria(categoria).subscribe({
      next: (data) => {
        this.inactivarBitacora(data);
        this._toastr.success('La categoria: '+ categoria.categoria + ' ha sido inactivada')
        
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.listCate[i].estado = 2;
  }


  /*****************************************************************************************************/

  generateExcel() {
    const headers = ['Categoría', 'Descripción', 'Creado por', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];
  
    // Recorre los datos de tu lista de categorías y agrégalos a la matriz 'data'
    this.listCate.forEach((cate, index) => {
      const row = [
        cate.categoria,
        cate.descripcion,
        cate.creado_por,
        cate.fecha_creacion,
        this.getEstadoText(cate.estado) // Función para obtener el texto del estado
      ];
      data.push(row);
    });
  
    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorías');
  
    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
  
    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Reporte de Categorías.xlsx';
  
    document.body.appendChild(a);
    a.click();
  
    // Limpia el objeto URL creado
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
 
  
  /*****************************************************************************************************/

  generatePDF() {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();
    const data: any[][] = [];
    const headers = ['Categoría', 'Descripción', 'Creado por', 'Fecha de Creación', 'Estado'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Categorías", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos de la lista de categorías y agrégalo a la matriz 'data'
      this.listCate.forEach((cate, index) => {
        const row = [
          cate.categoria,
          cate.descripcion,
          cate.creado_por,
          cate.fecha_creacion,
          this.getEstadoText(cate.estado) // Función para obtener el texto del estado
        ];
        data.push(row);
      });
  
      // Agregar la tabla al PDF
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 70 // Ajusta la posición inicial de la tabla según tu diseño
      });
  
      // Guardar el PDF
      doc.save('My Pyme-Reporte Categorías.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
  }
  
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
  }
  
  getEstadoText(estado: number): string {
    switch (estado) {
      case 1:
        return 'Activo';
      case 2:
        return 'Inactivo';
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
        this.insertBitacora(data);
        this._toastr.success('Categoría agregada exitosamente');
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
      this.updateBitacora(data);
      this._toastr.success('Categoria editada con éxito');
      this.listCate[this.indice].categoria = this.CategoriaEditando.categoria;
      this.listCate[this.indice].categoria = this.CategoriaEditando.descripcion;
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

  insertBitacora(dataCatProd: Categoria) {
    const bitacora = {
      fecha: new Date().toISOString().split('T')[0],
      id_usuario: this.getUser.id_usuario,
      id_objeto: 20,
      accion: 'INSERTAR',
      descripcion: `SE AGREGÓ UNA NUEVA CATEGORÍA:
                    Categoría: ${dataCatProd.categoria},
                    Descripción: ${dataCatProd.descripcion}`
    };
  
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
  



  updateBitacora(dataCatProd: Categoria) {
    // Guardar la categoría actual antes de actualizarla
    const categoriaAnterior = { ...this.getCate };
  
    // Actualizar la categoría
    this.getCate = dataCatProd;
  
    // Comparar los datos anteriores con los nuevos datos
    const cambios = [];
    if (categoriaAnterior.categoria !== dataCatProd.categoria) {
      cambios.push(`Categoría anterior: ${categoriaAnterior.categoria} -> Nueva Categoría: ${dataCatProd.categoria}`);
    }
    if (categoriaAnterior.descripcion !== dataCatProd.descripcion) {
      cambios.push(`Descripción anterior: ${categoriaAnterior.descripcion} -> Nueva Descripción: ${dataCatProd.descripcion}`);
    }
    // Puedes agregar más comparaciones para otros campos según tus necesidades
  
    // Si se realizaron cambios, registrar en la bitácora
    if (cambios.length > 0) {
      // Crear la descripción para la bitácora
      const descripcion = `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`;
  
      // Crear el objeto bitácora
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 20, // Ajusta el ID del objeto según corresponda en tu sistema
        accion: 'ACTUALIZAR',
        descripcion: descripcion
      };
  
      // Insertar la bitácora
      this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
        // Manejar la respuesta si es necesario
      });
    }
  }
  
  

  activarBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date().toISOString().split('T')[0],
      id_usuario: this.getUser.id_usuario,
      id_objeto: 20,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL CONTACTO CON EL ID: '+ dataCatProd.categoria
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }

  inactivarBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date().toISOString().split('T')[0],
      id_usuario: this.getUser.id_usuario,
      id_objeto: 20,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA LA CATEGORÍA CON EL ID: '+ dataCatProd.categoria
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }

  deleteBitacora(dataCatProd: Categoria){
    const bitacora = {
      fecha: new Date().toISOString().split('T')[0],
      id_usuario: this.getUser.id_usuario,
      id_objeto: 20,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL CONTACTO CON EL ID: '+ dataCatProd.categoria
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}


