import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Requisito } from '../../interfaces/empresa/requisitos';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequisitoService {

  public tipoRequisito: Requisito | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/Tipo_Requisito'
    // Asignar un valor a una clave en localStorage

   }
   addRequisito(req: Requisito): Observable<any> {
    const nuevoRequisito = {
      tipo_requisito: req.tipo_requisito, 
      descripcion: req.descripcion,
      creado_por: req.creado_por, 
      fecha_creacion: req.fecha_creacion, 
      modificado_por: req.modificado_por, 
      fecha_modificacion: req.fecha_modificacion,
      estado: req.estado
      };
      return this.http.post<Requisito>(`${this.myAppUrl}${this.myApiUrl}/postTipo_Requisito`, nuevoRequisito)
  }

  
   getRequisito(requisito: Requisito): Observable<Requisito> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Requisito>(`${this.myAppUrl}${this.myApiUrl}/getTipo_Requisito`, requisito, { headers: headers })
   }

   getAllRequisito(): Observable<Requisito[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Requisito[]>(`${this.myAppUrl}${this.myApiUrl}/getAllTipo_Requisito`, { headers: headers })
   }
   inactivarRequisito(requisito: Requisito): Observable<Requisito>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Requisito>(`${this.myAppUrl}${this.myApiUrl}/inactivateTipoRequisito`, requisito, { headers: headers })
   }
   activarRequisito(requisito: Requisito): Observable<Requisito>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Requisito>(`${this.myAppUrl}${this.myApiUrl}/activateTipoRequisito`, requisito, { headers: headers })
   }

   editarRequisito(requisito: Requisito): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Requisito>(`${this.myAppUrl}${this.myApiUrl}/updateTipoRequisito`, requisito, { headers: headers })
  }
}