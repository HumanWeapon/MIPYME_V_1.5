import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoEmpresa } from 'src/app/interfaces/mantenimiento/tipoEmpresa';
import { TipoEmpresaService } from 'src/app/services/mantenimiento/tipoEmpresa.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español


@Component({
  selector: 'app-tipo-empresa',
  templateUrl:'./tipo-empresa.component.html',
  styleUrls: ['./tipo-empresa.component.css']
})
export class TipoEmpresaComponent implements OnInit{

    tipoEmpresaEditando: TipoEmpresa = {
      id_tipo_empresa: 0, 
      tipo_empresa: '', 
      descripcion:'',
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(),
      estado: 0,
    };
    nuevoTipoEmpresa: TipoEmpresa = {
        id_tipo_empresa: 0, 
        tipo_empresa: '', 
        descripcion:'',
        creado_por: 'SYSTEM', 
        fecha_creacion: new Date(), 
        modificado_por: 'SYSTEM', 
        fecha_modificacion: new Date(),
        estado: 0,
    
      };
      indice: any;

  dtOptions: DataTables.Settings = {};
  listTipoE: TipoEmpresa[] = [];
  data: any;
  dtTrigger: Subject<any> = new Subject<any>();
  
  getTipoEmpresa: any;



  constructor(
    private tipoempresaService: TipoEmpresaService,    
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private ngZone: NgZone
    ) {}

    ngOnInit(): void {
      this.getUsuario()
        this.dtOptions = {
          pagingType: 'full_numbers',
          pageLength: 10,
          language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
          responsive: true
        };
        this.tipoempresaService.getAllTipoEmpresa()
          .subscribe((res: any) => {
            this.listTipoE = res;
            this.dtTrigger.next(null);
          });
          this.getUsuario();
      }
      ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
      }

      onInputChange(event: any, field: string) {
        if (field === 'tipo_empresa' ) {
          const inputValue = event.target.value;
          const uppercaseValue = inputValue.toUpperCase();
          event.target.value = uppercaseValue;
        }
      }




      getDate(): string {
        // Obtener la fecha actual
        const currentDate = new Date();
        // Formatear la fecha en el formato deseado
        return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
    }
      
      // Variable de estado para alternar funciones
      

 toggleFunction(Tempre: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (Tempre.estado == 1 ) {
    this.inactivarTipoEmpresa(Tempre, i); // Ejecuta la primera función
  } else {
    this.activarTipoEmpresa(Tempre, i); // Ejecuta la segunda función
  }
 }
    
      inactivarTipoEmpresa(tipoEmpresa: TipoEmpresa, i: any){
        this.tipoempresaService.inactivarTipoEmpresa(tipoEmpresa).subscribe(data => {
        this.toastr.success('El tipo de empresa: '+ tipoEmpresa.tipo_empresa + ' ha sido inactivado');
        this.inactivarBitacora(data);
      });
        this.listTipoE[i].estado = 2; 
      }

      activarTipoEmpresa(tipoEmpresa: TipoEmpresa, i: any){
        this.tipoempresaService.activarTipoEmpresa(tipoEmpresa).subscribe(data => {
        this.toastr.success('El tipo de empresa: '+ tipoEmpresa.tipo_empresa + ' ha sido activado');
        this.activarBitacora(data);
      });
        this.listTipoE[i].estado = 1;
      }



/*****************************************************************************************************/

      generateExcel() {
        const headers = ['Tipo de Empresa', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
        const data: any[][] = [];
    
        // Recorre los datos de tu lista y agrégalo a la matriz 'data'
        this.listTipoE.forEach((Tempre, index) => {
            const row = [
                Tempre.tipo_empresa,
                Tempre.descripcion,
                Tempre.creado_por,
                Tempre.fecha_creacion,
                this.getEstadoText(Tempre.estado) // Función para obtener el texto del estado
            ];
            data.push(row);
        });
    
        // Crea un nuevo libro de Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
        // Agrega la hoja al libro de Excel
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos de Empresa');
    
        // Guarda el libro de Excel como un archivo binario
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
        // Crea un objeto URL para el blob
        const url = window.URL.createObjectURL(blob);
    
        // Crea un enlace para descargar el archivo Excel
        const a = document.createElement('a');
        a.href = url;
        a.download = 'My Pyme-Reporte Tipo de Empresa.xlsx';
    
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
  const headers = ['Tipo de Empresa', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Tipos de Empresa", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

      // Recorre los datos de tu lista y agrégalo a la matriz 'data'
      this.listTipoE.forEach((Tempre, index) => {
          const row = [
              Tempre.tipo_empresa,
              Tempre.descripcion,
              Tempre.creado_por,
              Tempre.fecha_creacion,
              this.getEstadoText(Tempre.estado) // Función para obtener el texto del estado
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
      doc.save('My Pyme-Reporte Tipo de Empresa.pdf');
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
          return 'ACTIVO';
      case 2:
          return 'INACTIVO';
      case 3:
          return 'BLOQUEADO';
      case 4:
          return 'VENCIDO';
      default:
          return 'Desconocido';
  }
}


/**************************************************************/

      agregarNuevoTipoEmpresa() {
    
        const userLocal = localStorage.getItem('usuario');
    if (userLocal){
        this.nuevoTipoEmpresa = {
          id_tipo_empresa: 0, 
          tipo_empresa: this.nuevoTipoEmpresa.tipo_empresa, 
          descripcion:this.nuevoTipoEmpresa.descripcion,
          creado_por: userLocal, 
          fecha_creacion: new Date(), 
          modificado_por: userLocal, 
          fecha_modificacion: new Date(),
          estado: 1,
    
        };
    
        this.tipoempresaService.addTipoEmpresa(this.nuevoTipoEmpresa).subscribe({
          next: (data) => {
            this.insertBitacora(data);
            this.toastr.success('Tipo de empresa agregado con éxito')
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
      }
    }
    
      obtenerIdTipoEmpresa(tipoE: TipoEmpresa, i: any){
    
        this.tipoEmpresaEditando = {
          
        id_tipo_empresa: tipoE.id_tipo_empresa, 
        tipo_empresa: tipoE.tipo_empresa, 
        descripcion: tipoE.descripcion,
        creado_por: tipoE.creado_por, 
        fecha_creacion: tipoE.fecha_creacion, 
        modificado_por: tipoE.modificado_por, 
        fecha_modificacion: tipoE.fecha_modificacion,
        estado: tipoE.estado,
    
        };
        this.indice = i;
      }
    
    
      editarTipoEmpresa(){
        this.tipoempresaService.editarTipoEmpresa(this.tipoEmpresaEditando).subscribe(data => {
          this.updateBitacora(data);
          this.toastr.success('Tipo de empresa editado con éxito');
          this.listTipoE[this.indice].tipo_empresa = this.tipoEmpresaEditando.tipo_empresa;
          this.listTipoE[this.indice].descripcion = this.tipoEmpresaEditando.descripcion;
    
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

 insertBitacora(dataTipEmpresa: TipoEmpresa) {
  const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 13,
      accion: 'INSERTAR',
      descripcion: `SE INSERTA EL TIPO DE EMPRESA:
                    Tipo de Empresa: ${dataTipEmpresa.tipo_empresa},
                    Descripción: ${dataTipEmpresa.descripcion}`
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
  });
}


updateBitacora(dataTipEmpresa: TipoEmpresa) {
  // Guardar el tipo de empresa actual antes de actualizarlo
  const tipoEmpresaAnterior = { ...this.getTipoEmpresa };

  this.getTipoEmpresa = dataTipEmpresa;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (tipoEmpresaAnterior.tipo_empresa !== dataTipEmpresa.tipo_empresa) {
      cambios.push(`Tipo de empresa anterior: ${tipoEmpresaAnterior.tipo_empresa} -> Nuevo tipo de empresa: ${dataTipEmpresa.tipo_empresa}`);
  }
  if (tipoEmpresaAnterior.descripcion !== dataTipEmpresa.descripcion) {
      cambios.push(`Descripción anterior: ${tipoEmpresaAnterior.descripcion} -> Nueva descripción: ${dataTipEmpresa.descripcion}`);
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
          id_objeto: 13,
          accion: 'ACTUALIZAR',
          descripcion: descripcion
      };

      // Insertar la bitácora
      this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
          // Manejar la respuesta si es necesario
      });
  }
}


  activarBitacora(dataTipEmpresa: TipoEmpresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 13,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL TIPO DE EMPRESA: '+ dataTipEmpresa.tipo_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }

  inactivarBitacora(dataTipEmpresa: TipoEmpresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 13,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL TIPO DE EMPRESA: '+ dataTipEmpresa.tipo_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataTipEmpresa: TipoEmpresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 13,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL TIPO DE EMPRESA: '+ dataTipEmpresa.tipo_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

    }
    
    
    
    