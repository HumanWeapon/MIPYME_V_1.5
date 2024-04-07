import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class HistoriaBusquedaService {

  private myAppUrl: string;
  private myApiUrl: string;
  
  constructor(private http: HttpClient) {     
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/historial_busqueda'
  }
  getAllHistorialB(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getAllHistorialB`,{ headers: headers })
  }
  gethistorial_busqueda_PYME(id_pyme: number): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/gethistorial_busqueda_PYME/${id_pyme}`,{ headers: headers })
  }
  postHistorialB(historial: any): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/postHistorialB`, historial, { headers: headers })
  }
}
