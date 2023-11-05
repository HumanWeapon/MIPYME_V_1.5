export interface Permisos {
    id_permisos: number,
    id_rol: number,
    id_objeto: number,
    permiso_insercion: false,
    permiso_eliminacion: false,
    permiso_actualizacion: false,
    permiso_consultar: false,
    estado_permiso: number,
    creado_por: string,
    fecha_creacion: Date ,
    modificado_por: string ,
    fecha_modificacion: Date 
}