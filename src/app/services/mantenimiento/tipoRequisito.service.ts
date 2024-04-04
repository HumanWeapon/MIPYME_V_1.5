import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Observable, catchError } from 'rxjs';
import { TipoRequisito } from 'src/app/interfaces/mantenimiento/tipoRequisito.service';

@Injectable({
  providedIn: 'root'
})
export class TipoRequisitoService {

  public tipoDireccion: TipoRequisito | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/tipo_requisito'
    // Asignar un valor a una clave en localStorage

   }



   addTipoRequisito(tipoR: TipoRequisito): Observable<any> {
    const nuevoTipoRequisito = {
      tipo_requisito: tipoR.tipo_requisito, 
      descripcion: tipoR.descripcion,
      creado_por: tipoR.creado_por, 
      fecha_creacion: tipoR.fecha_creacion, 
      modificado_por: tipoR.modificado_por, 
      fecha_modificacion: tipoR.fecha_modificacion,
      estado: tipoR.estado,
      };
      return this.http.post<TipoRequisito>(`${this.myAppUrl}${this.myApiUrl}//postTipo_Requisito`, nuevoTipoRequisito)
  }

  
   getTipoRequisito(tipoRequisito: TipoRequisito): Observable<TipoRequisito> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoRequisito>(`${this.myAppUrl}${this.myApiUrl}//getTipo_Requisito`, tipoRequisito, { headers: headers })
   }

   getAllTipoRequisito(): Observable<TipoRequisito[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<TipoRequisito[]>(`${this.myAppUrl}${this.myApiUrl}/getAllTipo_Requisito`, { headers: headers })
   }
   inactivarTipoRequisito(tipoRequisito: TipoRequisito): Observable<TipoRequisito>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoRequisito>(`${this.myAppUrl}${this.myApiUrl}/inactivateRequisito`, tipoRequisito, { headers: headers })
   }
   activarTipoRequisito(tipoRequisito: TipoRequisito): Observable<TipoRequisito>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoRequisito>(`${this.myAppUrl}${this.myApiUrl}//activateRequisito`, tipoRequisito, { headers: headers })
   }

   editarTipoRequisito(tipoRequisito: TipoRequisito): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoRequisito>(`${this.myAppUrl}${this.myApiUrl}/updateTipoRequisito`, tipoRequisito, { headers: headers })
  }

  requisitosAllPaisesEmpresas(): Observable<TipoRequisito[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<TipoRequisito[]>(`${this.myAppUrl}${this.myApiUrl}/requisitosAllPaisesEmpresas`, { headers: headers });
  }

  requisitosdeEmpresaPorId(idEmpresa: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { id_empresa: idEmpresa }; // Envía el id_contacto en el cuerpo de la solicitud
    return this.http.post<any[]>(`${this.myAppUrl}${this.myApiUrl}/requisitosdeEmpresaPorId`, body, { headers: headers });
  }

}









/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */