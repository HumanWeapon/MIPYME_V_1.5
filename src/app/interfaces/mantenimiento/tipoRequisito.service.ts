export interface TipoRequisito {
    id_tipo_requisito: number,
    id_pais: number,
    tipo_requisito: string,
    descripcion: string,
    creado_por: string,
    fecha_creacion: Date,
    modificado_por: string,
    fecha_modificacion: Date,
    estado: number,
    id_producto: number
}