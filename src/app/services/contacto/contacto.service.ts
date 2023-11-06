import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Contacto } from '../../interfaces/contacto/contacto';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  public contacto: Contacto | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/contacto'
    // Asignar un valor a una clave en localStorage

   }



   addContacto(contac: Contacto): Observable<any> {
    const nuevoContacto = {
        id_contacto: contac.id_contacto,
        id_tipo_contacto: contac.id_tipo_contacto,
        dni: contac.dni,
        primer_nombre: contac.primer_nombre,
        segundo_nombre: contac.segundo_nombre,
        primer_apellido: contac.primer_apellido,
        segundo_apellido: contac.segundo_apellido,
        correo: contac.correo,
        descripcion: contac.descripcion,
        creado_por: contac.creado_por,
        fecha_creacion: contac.fecha_creacion, 
        modificado_por: contac.modificado_por,
        fecha_modificacion: contac.fecha_modificacion, 
        estado: contac.estado,
      };
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/postContacto`, nuevoContacto, { headers: headers })
  }

  
   getContacto(contacto: Contacto): Observable<Contacto> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/getContacto`, contacto, { headers: headers })
   }

   getAllContactos(): Observable<Contacto[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Contacto[]>(`${this.myAppUrl}${this.myApiUrl}/getAllContactos`, { headers: headers })
   }
   inactivarContacto(contacto: Contacto): Observable<Contacto>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/inactivateContacto`, contacto, { headers: headers })
   }
   activarContacto(contacto: Contacto): Observable<Contacto>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/activateContacto`, contacto, { headers: headers })
   }

   editarContacto(contacto: Contacto): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/updateContacto`, contacto, { headers: headers })
  }
}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */







