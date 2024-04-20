import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';
import { Preguntas_Usuario } from '../../interfaces/seguridad/preguntasUsuario';

@Injectable({
  providedIn: 'root'
})
export class PreguntasUsuarioService {

  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) { 
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/preguntasusuario'
  }

  getPreguntasUsuario(id_usuario: Preguntas_Usuario): Observable<Preguntas_Usuario[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas_Usuario[]>(`${this.myAppUrl}${this.myApiUrl}/getPreguntasusuario`, id_usuario, { headers: headers })
  }

  getPreguntasUsuario1(): Observable<Preguntas_Usuario[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas_Usuario[]>(`${this.myAppUrl}${this.myApiUrl}/getPreguntasusuario`,{ headers: headers })
  }
  validarRespuesta(respuesta: Preguntas_Usuario): Observable<Preguntas_Usuario[]>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas_Usuario[]>(`${this.myAppUrl}${this.myApiUrl}/validarRespuestas`, respuesta, { headers: headers })
  }
  preguntasRespuestas(id_usuario: number): Observable<Preguntas_Usuario[]>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    const requestData = { id_usuario: id_usuario };
    return this.http.post<Preguntas_Usuario[]>(`${this.myAppUrl}${this.myApiUrl}/preguntasRespuestas`, requestData, { headers: headers })
  }
  postPreguntasUsuario(preguntas: Preguntas_Usuario): Observable<Preguntas_Usuario>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas_Usuario>(`${this.myAppUrl}${this.myApiUrl}/postPreguntaUsuario`, preguntas, { headers: headers })
  }

  updatePreguntaUsuario(pregunta: Preguntas_Usuario): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.put<any>(`${this.myAppUrl}${this.myApiUrl}/updatePreguntaUsuario`, pregunta, { headers: headers })
  }

  deletePreguntasUsuario(id_usuario: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.myAppUrl}${this.myApiUrl}/deletePreguntaUsuario/${id_usuario}`, { headers: headers });
  }
  
}