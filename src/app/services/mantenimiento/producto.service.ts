import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Observable, catchError } from 'rxjs';
import { Productos } from '../../interfaces/mantenimiento/productos';
import { Contacto } from 'src/app/interfaces/contacto/contacto';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  public productos: Productos | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/productos'
    // Asignar un valor a una clave en localStorage

   }

   addProducto(producto: Productos): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Productos>(`${this.myAppUrl}${this.myApiUrl}/postProducto`, producto,{ headers: headers })
  }

  
   getProducto(productos: Productos): Observable<Productos> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Productos>(`${this.myAppUrl}${this.myApiUrl}/getProducto`, productos, { headers: headers })
   }

   getAllProductos(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getAllProductos`, { headers: headers })
   }

   inactivarProductos(productos: Productos): Observable<Productos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Productos>(`${this.myAppUrl}${this.myApiUrl}/inactivateProducto`, productos, { headers: headers })
   }
   activarProductos(productos: Productos): Observable<Productos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Productos>(`${this.myAppUrl}${this.myApiUrl}/activateProducto`, productos, { headers: headers })
   }

   editarProducto(productos: Productos): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Productos>(`${this.myAppUrl}${this.myApiUrl}/updateProducto`, productos, { headers: headers })
  }

  getAllProductosByCategoria(id_categoria: Contacto): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/getAllProductosByCategoria`,id_categoria, { headers: headers });
  }

  getOpProductos(id_producto: Productos): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/getOpProductos`, id_producto,{ headers: headers })
  }

  getAllOpProductos(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getAllOpProductos`, { headers: headers })
  }

  getAllProductosActivos(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getAllProductosActivos`, { headers: headers })
   }

}