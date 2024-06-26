import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class EmpresasProdcutosService {
  private apiUrl: string;
  private token: string = '';

  constructor(private http: HttpClient) {
    this.apiUrl = environment.endpoint + 'api/empresas_productos';
    
  }

  getToken(){
    const Gtoken = localStorage.getItem('token');
    if(!Gtoken){
      console.log('Error al obtener el token: '+Gtoken)
    }else{
      this.token = Gtoken;
    }
  }
  agregarOperacionEmpresaProducto(data: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.post(`${this.apiUrl}/agregarOperacionEmpresaProducto`, data, { headers });
  }

  consultarOperacionesEmpresasProductos(): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarOperacionesEmpresasProductos`, { headers });
  }

  consultarOperacionEmpresaProductoPorId(id: number): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarOperacionEmpresaProductoPorId/${id}`, { headers });
  }

  consultarProductosNoRegistradosPorId(id: number): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<any[]>(`${this.apiUrl}/consultarProductosNoRegistradosPorId/${id}`, { headers });
  }


  eliminarOperacionEmpresaProducto(id: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.delete(`${this.apiUrl}/eliminarOperacionEmpresaProducto/${id}`, { headers });
  }
  
  // Método para obtener productos filtrados por categoría y país
  getProductosSearch(categoria: string, pais: string): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<any[]>(`${this.apiUrl}/getProductosSearch?categoria=${categoria}&pais=${pais}`, { headers });
  }
  //OBTIENE LOS PAÍSES DE LAS EMPRESAS REGISTRADAS
  getPaisesPorProducto(id_producto: number): Observable<any[]> {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      return this.http.get<any[]>(`${this.apiUrl}/getPaisesPorProducto/${id_producto}`, { headers });
  }
  getPaisesEmpresasPorPais(id_pais: number, id_producto: number): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<any[]>(`${this.apiUrl}/getPaisesEmpresasPorPais/${id_pais}/${id_producto}`, { headers });
}
}
