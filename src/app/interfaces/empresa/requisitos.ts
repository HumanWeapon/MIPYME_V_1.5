export interface Requisito {
    id_tipo_requisito: number,
    tipo_requisito: string,    
    descripcion: string,
    creado_por: string,
    fecha_creacion: Date,
    modificado_por: string,
    fecha_modificacion: Date,
    estado: number,
}