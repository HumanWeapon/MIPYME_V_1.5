export interface Productos {
    id_producto: number,
    id_contacto: number,
    id_categoria: number,
    id_pais:number,
    producto: string,
    descripcion: string,
    creado_por: string,
    fecha_creacion: Date,
    modificado_por: string,
    fecha_modificacion: Date,
    estado: number,
}
