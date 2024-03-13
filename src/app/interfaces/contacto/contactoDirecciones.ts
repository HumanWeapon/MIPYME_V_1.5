export interface ContactoDirecciones {
    id_direccion: number, 
    id_tipo_direccion: number,
    id_ciudad: number,
    direccion: string, 
    descripcion: string,
    creado_por: string, 
    fecha_creacion: Date, 
    modificado_por: string, 
    fecha_modificacion: Date,
    estado: number,
}