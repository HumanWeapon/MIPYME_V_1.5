import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Categoria } from '../../interfaces/mantenimiento/categoria';
import { tap } from 'rxjs/operators'
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  public categoria: Categoria | undefined;
  private _refresh$ = new Subject<void>();
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/categoria'
    // Asignar un valor a una clave en localStorage

   }

   get refresh$(){
    return this._refresh$;
  }

   addCategoriaProducto(categoriaProducto: any): Observable<Categoria> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/postCategoria`, categoriaProducto, { headers: headers }).pipe(
      tap(() =>{
        this._refresh$.next();
      })
    )
  }

   getAllCategorias(): Observable<Categoria[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Categoria[]>(`${this.myAppUrl}${this.myApiUrl}/getAllCategorias`, { headers: headers })
   }
   inactivarCategoria(categoria: Categoria): Observable<Categoria>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Categoria>(`${this.myAppUrl}${this.myApiUrl}/inactivateCategoria`, categoria, { headers: headers })
   }
   activarCategoria(categoria: Categoria): Observable<Categoria>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Categoria>(`${this.myAppUrl}${this.myApiUrl}/activateCategoria`, categoria, { headers: headers })
   }

   editarCategoriaProducto(categoria: Categoria): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Categoria>(`${this.myAppUrl}${this.myApiUrl}/updateCategoria`, categoria, { headers: headers })
  }
}