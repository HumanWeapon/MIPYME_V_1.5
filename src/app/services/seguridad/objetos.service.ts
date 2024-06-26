import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Objetos } from '../../interfaces/seguridad/objetos';
import { Observable, catchError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ObjetosService {
    getIdFromName(objeto: any) {
        throw new Error('Method not implemented.');
    }

  public objetos: Objetos | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/objetos'
    // Asignar un valor a una clave en localStorage

   }

   addObjeto(obj: Objetos): Observable<any> {
    const nuevoObjeto = {
      objeto: obj.objeto, 
      descripcion: obj.descripcion, 
      tipo_objeto: obj.tipo_objeto, 
      estado_objeto: obj.estado_objeto,
      creado_por: obj.creado_por, 
      fecha_creacion: obj.fecha_creacion, 
      modificado_por: obj.modificado_por, 
      fecha_modificacion: obj.fecha_modificacion
      };
      return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/postObjeto`, nuevoObjeto)
  }

  
   getObjeto(objetos: Objetos): Observable<Objetos> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/getObjeto`, objetos, { headers: headers })
   }

   getAllObjetos(): Observable<Objetos[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Objetos[]>(`${this.myAppUrl}${this.myApiUrl}/getAllObjetos`, { headers: headers })
   }
   inactivarObjeto(objetos: Objetos): Observable<Objetos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/inactivateObjeto`, objetos, { headers: headers })
   }
   activarObjeto(objetos: Objetos): Observable<Objetos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/activateObjeto`, objetos, { headers: headers })
   }

   editarObjeto(objetos: Objetos): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/updateObjetos`, objetos, { headers: headers })
  }

  getAllObjetosMenu(tipo_objeto: string, estado_objeto: number): Observable<Objetos[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos[]>(`${this.myAppUrl}${this.myApiUrl}/getAllObjetosMenu`, {tipo_objeto:tipo_objeto, estado_objeto: estado_objeto}, { headers: headers })
  }
  
  objetosJSON(id_rol: any, submenu:any): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/objetosJSON/${id_rol}/${submenu}`, { headers: headers })
  }
  
  get_id_Objetos(objeto: any): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any>(`${this.myAppUrl}${this.myApiUrl}/get_id_Objetos/${objeto}`, { headers: headers })
  }
}