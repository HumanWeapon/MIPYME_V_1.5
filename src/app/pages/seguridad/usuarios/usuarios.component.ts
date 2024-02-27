import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/error.service';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}
  

  listUsuarios: Usuario[] = [];
  listRol: Roles[] = [];
  usuariosAllRoles: any[] = []
  indiceUser: any;
  indiceRol: any;
  objectBitacora: any;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  newUser: Usuario = {
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
  }

  editUser: Usuario = {
    
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
  }
  constructor(
    private _userService: UsuariosService,
    private _ngZone: NgZone,
    private _toastr: ToastrService,
    private _rolService: RolesService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.getAllRoles();
    this.getUsuario();
    this.getAllUsuarios();
  }

  getAllRoles(){
    this._rolService.getAllRoles().subscribe(data => {
      this.listRol = data.filter(rol => rol.estado_rol == 1);
    });

  }
  getAllUsuarios(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    },
    this._userService.usuariosAllRoles().subscribe({
      next: (data) =>{
        this.usuariosAllRoles = data;
        this.listUsuarios = data;
        this.dtTrigger.next(0);
      }
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  eliminarEspaciosBlanco(event: any, field: string) {

    setTimeout(() => {
      const inputValue = event.target.value;
      event.target.value = inputValue.toUpperCase();
      this.editUser.usuario = this.editUser.usuario.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo usuario
      this.editUser.usuario = this.editUser.usuario.toUpperCase(); // Convierte el texto a mayúsculas
      this.editUser.correo_electronico = this.editUser.correo_electronico.replace(/\s/g, ''); // Elimina espacios en blanco para el campo Correo
      this.editUser.contrasena = this.editUser.contrasena.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo contraseña
      this.newUser.usuario = this.newUser.usuario.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo usuario
      this.newUser.correo_electronico = this.newUser.correo_electronico.replace(/\s/g, ''); // Elimina espacios en blanco para el campo Correo
      this.newUser.usuario = this.newUser.usuario.toUpperCase(); // Convierte el texto a mayúsculas
      this.newUser.contrasena = this.newUser.contrasena.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo contraseña
    });
  }

  convertirAMayusculas(event: any, field: string) {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
  }
  
  // Variable de estado para alternar funciones

toggleFunction(user: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (user.estado_usuario === 1 ) {
    this.inactivarUsuario(user, i); // Ejecuta la primera función
  } else {
    this.activarUsuario(user, i); // Ejecuta la segunda función
  }
}


  inactivarUsuario(usuario: any, i: any) {
    this._userService.inactivarUsuario(usuario).subscribe({
      next: (data) => {
        this.inactivarBitacora(data);
        this._toastr.success('El usuario: ' + usuario.nombre_usuario + ' ha sido Inactivado')
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.usuariosAllRoles[i].estado_usuario = 2;
    
  }
  activarUsuario(usuario: any, i: any) {
    this._userService.activarUsuario(usuario).subscribe({
      next: (data) => {
        this.activarBitacora(data);
        this._toastr.success('El usuario: ' + usuario.nombre_usuario + ' ha sido Activado')
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.usuariosAllRoles[i].estado_usuario = 1;
  }


   /*****************************************************************************************************/
   generateExcel() {
    const headers = ['ID Usuario', 'Nombre Usuario', 'Correo Electronico', 'Rol', 'Creador', 'Ultima Conexion', 'Fecha de Vencimiento', 'Estado'];
    const data: any[][] = [];

    
  
    // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
    this.usuariosAllRoles.forEach((user, index) => {
      const row = [
        user.usuario,
        user.nombre_usuario,
        user.correo_electronico,
        user.roles.rol,
        user.creado_por,
        user.fecha_ultima_conexion,
        user.fecha_vencimiento,
        this.getEstadoText(user.estado_usuario) // Función para obtener el texto del estado
      ];
      data.push(row);
    });
  
    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
  
    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
  
    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Usuario.xlsx';
  
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
    const headers = ['ID Usuario', 'Nombre Usuario', 'Correo Electronico', 'Rol', 'Creador', 'Ultima Conexion', 'Fecha de Vencimiento', 'Estado'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Usuarios", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
      this.usuariosAllRoles.forEach((user, index) => {
        const row = [
          user.usuario,
          user.nombre_usuario,
          user.correo_electronico,
          user.roles.rol,
          user.creado_por,
          user.fecha_ultima_conexion,
          user.fecha_vencimiento,
          this.getEstadoText(user.estado_usuario) // Función para obtener el texto del estado
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
      doc.save('My Pyme-Reporte Usuario.pdf');
    };
    logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
  }
  
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
  }
  
  getEstadoText(estado_usuario: number): string {
    switch (estado_usuario) {
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


  agregarNuevoUsuario() {
    const LocalUser = localStorage.getItem('usuario');
    if (LocalUser){

      this.newUser = {
        id_usuario: 0,
        creado_por: LocalUser,
        fecha_creacion: new Date(),
        modificado_por: LocalUser,
        fecha_modificacion: new Date(),
        usuario: this.newUser.usuario,
        nombre_usuario: this.newUser.nombre_usuario,
        correo_electronico: this.newUser.correo_electronico,
        estado_usuario: 1,
        contrasena: this.newUser.usuario,
        id_rol: this.newUser.id_rol,
        fecha_ultima_conexion: new Date(),
        primer_ingreso: new Date(),
        fecha_vencimiento: this.newUser.fecha_vencimiento,
        intentos_fallidos: 0,
      };
  
      this._userService.addUsuario(this.newUser).subscribe({
        next: (data) => {
          this.insertBitacora(data);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }

  obtenerIdUsuario(usuario: Usuario, i: any) {
    const localuser = localStorage.getItem('usuario');
    if(localuser){
      this.editUser = {
        id_usuario: usuario.id_usuario,
        creado_por: usuario.creado_por,
        fecha_creacion: usuario.fecha_creacion,
        modificado_por: localuser,
        fecha_modificacion: usuario.fecha_modificacion,
        usuario: usuario.usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo_electronico: usuario.correo_electronico,
        estado_usuario: usuario.estado_usuario,
        contrasena: usuario.contrasena,
        id_rol: usuario.id_rol,
        fecha_ultima_conexion: usuario.fecha_ultima_conexion,
        primer_ingreso: usuario.primer_ingreso,
        fecha_vencimiento: usuario.fecha_vencimiento,
        intentos_fallidos: usuario.intentos_fallidos,
      };
    }
    this.indiceUser = i;
  }

  
  editarUsuario(Id_Rol_Selected: any) {
    // Verifica si el usuario actual es el mismo que el usuario que se está editando
    const esMismoUsuario = this.usuariosAllRoles[this.indiceUser].usuario === this.editUser.usuario;
  
    // Verifica si el correo electrónico actual es el mismo que el correo electrónico que se está editando
    const esMismoCorreo = this.usuariosAllRoles[this.indiceUser].correo_electronico === this.editUser.correo_electronico;
  
    // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
    if (!esMismoUsuario) {
      const usuarioExistente = this.usuariosAllRoles.some(user => user.usuario === this.editUser.usuario);
      if (usuarioExistente) {
        this._toastr.error('El nombre de usuario ya existe. Por favor, elige otro nombre de usuario.');
        return;
      }
    }
  
    // Si el correo electrónico no es el mismo, verifica si el correo electrónico ya existe
    if (!esMismoCorreo) {
      const correoExistente = this.usuariosAllRoles.some(user => user.correo_electronico === this.editUser.correo_electronico);
      if (correoExistente) {
        this._toastr.error('El correo electrónico ya está en uso. Por favor, ingresa otro correo electrónico.');
        return;
      }
    }
  
    // Continúa con la edición si no hay conflictos de nombres de usuario o correos electrónicos
    const modificador = localStorage.getItem('usuario');
    const rolSeleccionado = this.listRol.find(rol => rol.id_rol == Id_Rol_Selected);
    
    if (!rolSeleccionado) {
      return;
    }
    
    this._userService.editarUsuario(this.editUser).subscribe(data => {
      this.updateBitacora(data);
      this._toastr.success('Usuario editado con éxito');
      if (this.usuariosAllRoles != null) {
        this.usuariosAllRoles[this.indiceUser].usuario = this.editUser.usuario;
        this.usuariosAllRoles[this.indiceUser].nombre_usuario = this.editUser.nombre_usuario;
        this.usuariosAllRoles[this.indiceUser].correo_electronico = this.editUser.correo_electronico;
        this.usuariosAllRoles[this.indiceUser].roles = rolSeleccionado;
        this.usuariosAllRoles[this.indiceUser].fecha_vencimiento = this.editUser.fecha_vencimiento;
        this.usuariosAllRoles[this.indiceUser].modificado_por = modificador;
      }
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

 insertBitacora(dataUser: Usuario) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 1,
    accion: 'INSERTAR',
    descripcion: `SE AGREGÓ UN NUEVO USUARIO:
                  Usuario: ${dataUser.usuario},
                  Nombre de usuario: ${dataUser.nombre_usuario},
                  Correo electrónico: ${dataUser.correo_electronico},
                  Rol: ${dataUser.id_rol},
                  Fecha de vencimiento: ${dataUser.fecha_vencimiento}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



updateBitacora(dataUser: Usuario) {
  // Guardar el usuario actual antes de actualizarlo
  const usuarioAnterior = { ...this.getUser };

  // Actualizar el usuario
  this.getUser = dataUser;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (usuarioAnterior.usuario !== dataUser.usuario) {
    cambios.push(`Usuario anterior: ${usuarioAnterior.usuario} -> Nuevo Usuario: ${dataUser.usuario}`);
  }
  if (usuarioAnterior.nombre_usuario !== dataUser.nombre_usuario) {
    cambios.push(`Nombre de usuario anterior: ${usuarioAnterior.nombre_usuario} -> Nuevo nombre de usuario: ${dataUser.nombre_usuario}`);
  }
  if (usuarioAnterior.correo_electronico !== dataUser.correo_electronico) {
    cambios.push(`Correo electrónico anterior: ${usuarioAnterior.correo_electronico} -> Nuevo correo electrónico: ${dataUser.correo_electronico}`);
  }
  if (usuarioAnterior.fecha_vencimiento !== dataUser.fecha_vencimiento) {
    cambios.push(`Fecha de vencimiento anterior: ${usuarioAnterior.fecha_vencimiento} -> Nueva fecha de vencimiento: ${dataUser.fecha_vencimiento}`);
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
      id_objeto: 1,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}

  
  

  activarBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 1,
      accion: 'ACTIVAR',
      descripcion: 'ACTIVA EL USUARIO: '+ dataUser.usuario
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 1,
      accion: 'INACTIVAR',
      descripcion: 'INACTIVA EL USUARIO: '+ dataUser.usuario
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 1,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL REGISTRO CON EL ID: '+ dataUser.id_usuario
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
    
}
