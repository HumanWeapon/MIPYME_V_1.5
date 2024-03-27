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

   postDireccion(direccion: ContactoDirecciones): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones>(`${this.myAppUrl}${this.myApiUrl}/postDireccion`, direccion,{ headers: headers })
  }

   getDireccion(id_contacto: any): Observable<ContactoDirecciones[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones[]>(`${this.myAppUrl}${this.myApiUrl}/getDirecContactos`, { id_contacto: id_contacto }, { headers: headers })
   }
  

   inactivarDireccion(direccion: any): Observable<any>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/inactivateDirecion`, direccion, { headers: headers })
   }
   activarDireccion(direccion: any): Observable<any>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/activateDireccion`, direccion, { headers: headers })
   }

  putDireccion(direccion: ContactoDirecciones): Observable<any> {
    console.log(direccion)
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<ContactoDirecciones>(`${this.myAppUrl}${this.myApiUrl}/updateDireccion/${direccion.id_direccion}`, direccion, { headers: headers });
  }

  getAllDireccionByContacto(id_contacto: ContactoDirecciones): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/getAllDireccionByContacto`,id_contacto, { headers: headers });
  }

  //Nuevas
  //Obtiene todas las direcciones
  getdirecciones(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getdirecciones`, { headers: headers })
  }
  //Obtiene todos los tipo de dirección activos
  getTipoDirecciones(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getTipoDirecciones`, { headers: headers })
   }
  //Obtiene todas las ciudades activas
  getCiudades(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getCiudades`, { headers: headers })
   }
}
