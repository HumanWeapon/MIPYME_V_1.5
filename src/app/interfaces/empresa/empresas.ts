export interface Empresa {
    id_empresa: number,
    id_tipo_empresa: number,
    nombre_empresa: string,
    web:string,
    rtn: string,
    descripcion: string,
    creado_por: string,
    fecha_creacion: Date,
    modificado_por: string,
    fecha_modificacion: Date,
    estado: number
}