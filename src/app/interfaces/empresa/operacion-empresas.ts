export interface operacionEmpresas {
    id_operacion_empresas: number,
    id_empresa: number,
    id_pais: number,
    id_contacto: number,
    rtn: string,
    descripcion: string,
    casa_matriz: boolean,
    creado_por: string,
    fecha_creacion: Date,
    modificado_por: string,
    fecha_modificacion: Date,
    estado: number
}