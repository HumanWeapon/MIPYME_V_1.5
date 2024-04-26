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
import { PermisosService } from 'src/app/services/seguridad/permisos.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;

  usuarioSeleccionado: any;
  usuarioAnterior: any;

  listUsuarios: Usuario[] = [];
  listRol: Roles[] = [];
  usuariosAllRoles: any[] = []
  indiceUser: any;
  indiceRol: any;
  objectBitacora: any;
  correo_electronico: string = '';

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
    fecha_vencimiento: new Date(),
    intentos_fallidos: 0
  }
  constructor(
    private _userService: UsuariosService,
    private _ngZone: NgZone,
    private _toastr: ToastrService,
    private _rolService: RolesService,
    private _bitacoraService: BitacoraService,
    private router: Router,
    private _errorService: ErrorService,
    private _permisosService: PermisosService
  ) {}

  ngOnInit(): void {
    this.getPermnisosObjetos();
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

  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'usuario') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, '');  // Solo permite letras y números
      } else if (field === 'correo') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9@.\s]/g, ''); // Permite letras, números, @ y .
      } else if (field === 'nombre_usuario') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9@.\s]/g, ''); // Permite letras, números, @ y .
      }
      event.target.value = inputValue;
    });
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



  getPermnisosObjetos(){
    const idObjeto = localStorage.getItem('id_objeto');
    const idRol = localStorage.getItem('id_rol');
    if(idObjeto && idRol){
      this._permisosService.getPermnisosObjetos(idRol, idObjeto).subscribe({
        next: (data: any) => {
          this.consultar = data.permiso_consultar;
          this.insertar = data.permiso_insercion;
          this.actualizar = data.permiso_actualizacion;
          this.eliminar = data.permiso_eliminacion;
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }

  
  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}
 
  /*****************************************************************************************************/

   /*****************************************************************************************************/
   generateExcel() {
    // Define los encabezados de la hoja de Excel
    const headers = ['ID', 'Usuario', 'Nombre Usuario', 'Correo Electrónico', 'Rol', 'Creador', 'Última Conexión', 'Fecha de Vencimiento', 'Estado'];
  
    // Prepara los datos para la hoja de Excel
    const data = this.usuariosAllRoles.map(user => [
      user.id_usuario,
      user.usuario,
      user.nombre_usuario,
      user.correo_electronico,
      user.roles.rol,
      user.creado_por,
      user.fecha_ultima_conexion,
      user.fecha_vencimiento,
      this.getEstadoText(user.estado_usuario) // Función para obtener el texto del estado
    ]);
  
    // Crea un nuevo libro de Excel y agrega una hoja con los datos
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
  
    // Convierte el libro de Excel en un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un enlace de descarga para el archivo Excel
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Usuario.xlsx';
  
    // Agrega el enlace de descarga al cuerpo del documento y lo activa
    document.body.appendChild(a);
    a.click();
  
    // Limpia los recursos utilizados para el enlace de descarga
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
  
  /*****************************************************************************************************/

  generatePDF() {
    // Importar jsPDF y crear un nuevo documento con orientación horizontal
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF({ orientation: 'landscape' });
  
    // Definir encabezados y datos de la tabla
    const headers = ['ID', 'Usuario', 'Nombre Usuario', 'Correo Electrónico', 'Rol', 'Creador', 'Última Conexión', 'Fecha de Vencimiento', 'Estado'];
    const data = this.usuariosAllRoles.map(user => [
      user.id_usuario,
      user.usuario,
      user.nombre_usuario,
      user.correo_electronico,
      user.roles.rol,
      user.creado_por,
      user.fecha_ultima_conexion,
      user.fecha_vencimiento,
      this.getEstadoText(user.estado_usuario)
    ]);
  
    // Agregar el logo al documento
    const logoImg = new Image();
    logoImg.onload = () => {
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);
  
      // Agregar texto al documento
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(16);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' });
      doc.text("Reporte de Usuarios", centerX, 30, { align: 'center' });
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' });
      doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' });
  
      // Agregar la tabla al documento
      doc.autoTable({
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
        head: [headers],
        body: data,
        startY: 70,
        theme: 'grid',
        margin: { top: 60, bottom: 30, left: 10, right: 10 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          fillColor: [255, 255, 255],
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 45 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 35 },
          7: { cellWidth: 35 },
          8: { cellWidth: 25 },
        },
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
    if (LocalUser) {
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
        fecha_vencimiento: this.editUser.fecha_vencimiento,
        intentos_fallidos: 0
      };

    // Verifica si el correo electrónico ya está registrado en la lista de usuarios
    const correoExistente = this.usuariosAllRoles.some(user => user.correo_electronico === this.newUser.correo_electronico);
    if (correoExistente) {
      this._toastr.error('El correo electrónico ya está en uso. Por favor, ingresa otro correo electrónico.');
      return;
    }

      if (!this.newUser.usuario || !this.newUser.nombre_usuario || !this.newUser.correo_electronico || !this.newUser.contrasena || !this.newUser.id_rol) {
        this._toastr.warning('Debes completar los campos vacíos');
        this.newUser.usuario = '';
        this.newUser.nombre_usuario = '';
        this.newUser.correo_electronico = '';
        this.newUser.contrasena = '';
      } else {
        if (!this.validarCorreoElectronico(this.newUser.correo_electronico)) {
          this._toastr.warning('Por favor, ingresa un correo electrónico válido.');
          return;
        }
        this._userService.addUsuario(this.newUser).subscribe({
          next: (data) => {
            this.insertBitacora(data);
            this._toastr.success('Usuario agregado con éxito')
            this.usuariosAllRoles.push(data)
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
      }
    }
  }

  obtenerUsuario(usuario: Usuario, i: any) {
    const localuser = localStorage.getItem('usuario');
    if(localuser){
      this.usuarioSeleccionado = {
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
        fecha_vencimiento: usuario.fecha_vencimiento,
        intentos_fallidos: usuario.intentos_fallidos,
      };
    }
    this.indiceUser = i;
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
        fecha_vencimiento: usuario.fecha_vencimiento,
        intentos_fallidos: usuario.intentos_fallidos,
      };
    }
    this.indiceUser = i;
    this.usuarioAnterior = usuario;
  
  }

  
  editarUsuario(Id_Rol_Selected: any) {


    if (!this.editUser.usuario || !this.editUser.nombre_usuario || !this.editUser.correo_electronico || !this.editUser.fecha_vencimiento) {
      this._toastr.error('No pueden quedar campos vacíos. Por favor, completa todos los campos.');
      return;
  }

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
  
    // Valida el formato del correo electrónico
    if (!this.validarCorreoElectronico(this.editUser.correo_electronico)) {
      this._toastr.warning('Por favor, ingresa un correo electrónico válido.');
      return;
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
  
  validarCorreoElectronico(correo: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(correo);
  }

  reestablecer(correo_electronico: string) {
    const correoUsuario = this.editUser.correo_electronico;
    localStorage.setItem('correo_electronico', correo_electronico);
    console.log('Correo Obtenido: ' + correoUsuario);
  
    // Llama al servicio para enviar el correo electrónico de restablecimiento
    this._userService.reestablecer(correoUsuario).subscribe(
      response => {
        // Aquí puedes manejar la respuesta del servicio
        this._toastr.success('Nueva Contraseña enviada con Exito.');
        console.log('contraseña nueva: ' + this.editUser.contrasena);
  
        // Compara el correo electrónico restablecido con el correo del usuario actual
        if (correoUsuario === correo_electronico) {
          // Redirige al usuario al login si la contraseña se restableció con éxito
          this.router.navigate(['/login']);
        }
      },
      error => {
        console.error('Error al enviar el correo electrónico:', error);
        this._toastr.error('Error al enviar el correo electrónico.');
  
        // Continúa con el flujo normal del programa en caso de error
      }
    );
  }
  
  
  
  
  
  /******************************************************************************************************************************************/
  /*************************************************************** Métodos de Bitácora ***************************************************************************/
  /******************************************************************************************************************************************/

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


 

 insertBitacora(dataUser: Usuario) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 1,
    campo_original: 'NO EXISTE REGISTRO ANTERIOR',
    nuevo_campo: `SE AGREGÓ UN NUEVO USUARIO:
                  Usuario: ${dataUser.usuario},
                  Nombre de usuario: ${dataUser.nombre_usuario},
                  Correo electrónico: ${dataUser.correo_electronico},
                  Rol: ${dataUser.id_rol}`,
    accion: 'INSERTAR'
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
  
}

 

updateBitacora(dataUser: Usuario) {
  const cambios = [];
  if (this.usuarioAnterior.usuario !== dataUser.usuario) {
    cambios.push(`Usuario: ${dataUser.usuario}`);
  }
  if (this.usuarioAnterior.nombre_usuario !== dataUser.nombre_usuario) {
    cambios.push(`Nombre de usuario: ${dataUser.nombre_usuario}`);
  }
  if (this.usuarioAnterior.correo_electronico !== dataUser.correo_electronico) {
    cambios.push(`Correo electrónico: ${dataUser.correo_electronico}`);
  }
  if (this.usuarioAnterior.id_rol !== dataUser.id_rol) {
    cambios.push(`Rol: ${dataUser.id_rol}`);
  }
 
  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario, // Usar el ID del usuario anterior para registrar el cambio
      id_objeto: 1, // ID del objeto correspondiente a los usuarios
      campo_original: `Usuario: ${this.usuarioAnterior.usuario}, Nombre de usuario: ${this.usuarioAnterior.nombre_usuario}, Correo electrónico: ${this.usuarioAnterior.correo_electronico}, Rol: ${this.usuarioAnterior.id_rol}`, 
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    }

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}


  activarBitacora(dataUser: Usuario){ 
    const bitacora = {
      fecha: new Date() ,
      id_usuario: this.getUser.id_usuario,
      id_objeto: 1,
      campo_original: 'EL USUARIO: '+ dataUser.usuario + ' SE ENCUENTRA "INACTIVO" ', 
      nuevo_campo: 'EL USUARIO: '+ dataUser.usuario + ' CAMBIO A "ACTIVO" ', 
      accion: 'ACTIVAR',
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }


  inactivarBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 1,
      campo_original: 'EL USUARIO: '+ dataUser.usuario + ' SE ENCUENTRA "ACTIVO" ', 
      nuevo_campo: 'EL USUARIO: '+ dataUser.usuario + ' CAMBIO A "INACTIVO" ', 
      accion: 'INACTIVAR'
    };
  
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      // Manejar la respuesta si es necesario
    });
    
  }


  
  deleteBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 1,
      campo_original: dataUser.usuario,
      nuevo_campo: 'SE ELIMINA EL USUARIO: '+ dataUser.usuario,
      accion: 'ELIMINAR',
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
    
}
