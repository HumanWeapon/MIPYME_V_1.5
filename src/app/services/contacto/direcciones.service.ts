import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactoDirecciones } from 'src/app/interfaces/contacto/contactoDirecciones';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class DireccionesService {

  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/direcciones'
    // Asignar un valor a una clave en localStorage

   }

   addDireccion(direccion: ContactoDirecciones): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones>(`${this.myAppUrl}${this.myApiUrl}/postDirecContactos`, direccion,{ headers: headers })
  }

   getDireccion(id_contacto: any): Observable<ContactoDirecciones[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones[]>(`${this.myAppUrl}${this.myApiUrl}/getDirecContactos`, { id_contacto: id_contacto }, { headers: headers })
   }
  
   getdirecciones(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getdirecciones`, { headers: headers })
   }
   inactivarDireccion(direccion: ContactoDirecciones): Observable<ContactoDirecciones>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones>(`${this.myAppUrl}${this.myApiUrl}/inactivateDirecContactos`, direccion, { headers: headers })
   }
   activarDireccion(direccion: ContactoDirecciones): Observable<ContactoDirecciones>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones>(`${this.myAppUrl}${this.myApiUrl}/activateDirecContactos`, direccion, { headers: headers })
   }

   editarDireccion(direccion: ContactoDirecciones): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones>(`${this.myAppUrl}${this.myApiUrl}/updateDirecContactos`, direccion, { headers: headers })
  }

  getAllDireccionByContacto(id_contacto: ContactoDirecciones): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/getAllDireccionByContacto`,id_contacto, { headers: headers });
  }
}
