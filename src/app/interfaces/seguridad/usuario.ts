export interface Usuario {
    id_usuario: number,
    creado_por: string,
    fecha_creacion: Date,
    modificado_por: string,
    fecha_modificacion: Date,
    usuario: string,
    nombre_usuario: string,
    correo_electronico: string,
    estado_usuario: number,
    contrasena: string,
    id_rol: number,
    fecha_ultima_conexion: Date,
    fecha_vencimiento: Date,
    intentos_fallidos: number
}