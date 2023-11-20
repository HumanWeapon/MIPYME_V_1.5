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
    this.myApiUrl = 'api/direcontactos'
    // Asignar un valor a una clave en localStorage

   }
   getDireccion(id_contacto: any): Observable<ContactoDirecciones[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoDirecciones[]>(`${this.myAppUrl}${this.myApiUrl}/getDirecContactos`, { id_contacto: id_contacto }, { headers: headers })
   }
}
