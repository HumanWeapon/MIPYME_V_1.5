import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class EmpresasProdcutosService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.endpoint + 'api/empresas_productos';
  }

  agregarOperacionEmpresaProducto(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/agregarOperacionEmpresaProducto`, data, { headers });
  }

  consultarOperacionesEmpresasProductos(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarOperacionesEmpresasProductos`, { headers });
  }

  consultarOperacionEmpresaProductoPorId(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarOperacionEmpresaProductoPorId/${id}`, { headers });
  }

  consultarProductosNoRegistradosPorId(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarProductosNoRegistradosPorId/${id}`, { headers });
  }


  eliminarOperacionEmpresaProducto(id: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/eliminarOperacionEmpresaProducto/${id}`, { headers });
  }
  
}
