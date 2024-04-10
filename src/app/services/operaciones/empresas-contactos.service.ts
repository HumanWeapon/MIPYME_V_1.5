import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class EmpresasContactosService {
  private apiUrl: string;
  
  constructor(private http: HttpClient) {
    this.apiUrl = environment.endpoint + 'api/empresas_contactos';
  }

  //consulta los contactos registrados de una empresa por el id
  consultarContactosPorId(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarContactosporId/${id}`, { headers });
  }
  //consulta los contactos Activos registrados de una empresa por el id
  consultarContactosActivosPorId(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarContactosActivosPorId/${id}`, { headers });
  }
  //consulta los contactos registrados de una empresa por el id
  ReporteContactos(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/ReporteContactos`, { headers });
  }
  //consulta los contactos registrados y no registrados de una empresa por el id
  consultarContactosNoRegistradosPorId(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarContactosNoRegistradosPorId/${id}`, { headers });
  }

  agregarOperacionEmpresaContacto(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/agregarOperacionEmpresaContacto`, data, { headers });
  }

  eliminarOperacionEmpresaContacto(id: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/eliminarOperacionEmpresaContacto/${id}`, { headers });
  }
}
