export interface ContactoTelefono {
    id_telefono: number, 
    id_contacto: number,
    id_pais: number,
    telefono: string, 
    cod_area: string,
    descripcion: string,
    creado_por: string, 
    fecha_creacion: Date, 
    modificado_por: string, 
    fecha_modificacion: Date,
    estado: number,
}