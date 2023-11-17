export interface ContactoDirecciones {
    id_direccion: number, 
    id_contacto: number,
    id_tipo_direccion: number,
    direccion: string, 
    descripcion: string,
    creado_por: string, 
    fecha_creacion: Date, 
    modificado_por: string, 
    fecha_modificacion: Date,
    estado: number,
}