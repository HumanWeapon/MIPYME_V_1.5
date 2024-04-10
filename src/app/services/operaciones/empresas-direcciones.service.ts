import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class EmpresasDireccionesService {
  private apiUrl: string;
  constructor(private http: HttpClient) {
    this.apiUrl = environment.endpoint + 'api/direcciones';
  }

  consultarDireccionesPorId(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/getDireccionesEmpresaporID/${id}`, { headers });
  }
  //consulta las direcciones activas registrados de una empresa por el id
  getDireccionesEmpresaporActivasID(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/getDireccionesEmpresaporActivasID/${id}`, { headers });
  }

}
