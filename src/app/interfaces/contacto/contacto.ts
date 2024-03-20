export interface Contacto {
    id_contacto: number,
    id_empresa: number,
    id_tipo_contacto: number,
    nombre_completo: string,
    descripcion: string,
    creado_por: string,
    fecha_creacion: Date,
    modificado_por: string,
    fecha_modificacion: Date,
    estado: number,
}