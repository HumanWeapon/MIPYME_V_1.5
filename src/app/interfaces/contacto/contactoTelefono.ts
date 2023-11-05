export interface ContactoTelefono {
    id_telefono: number, 
    id_contacto: number,
    id_tipo_telefono: number,
    telefono: string, 
    extencion: string,
    descripcion: string,
    creado_por: string, 
    fecha_creacion: Date, 
    modificado_por: string, 
    fecha_modificacion: Date,
    estado: number,
}