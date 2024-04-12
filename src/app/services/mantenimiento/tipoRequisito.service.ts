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
  private apiUrl: String;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/tipo_requisito'
    this.apiUrl = environment.endpoint + 'api/tipo_requisito';

   }



   addTipoRequisito(tipoR: TipoRequisito): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoRequisito>(`${this.myAppUrl}${this.myApiUrl}//postTipo_Requisito`, tipoR, { headers: headers })
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
    return this.http.post<TipoRequisito>(`${this.myAppUrl}${this.myApiUrl}/activateRequisito`, tipoRequisito, { headers: headers })
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

    //consulta los contactos registrados de una empresa por el id
    consultarRequisitosPorId(id: number): Observable<any[]> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any[]>(`${this.apiUrl}/consultarRequisitosporIdEmpresa/${id}`, { headers });
    }

}








/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */