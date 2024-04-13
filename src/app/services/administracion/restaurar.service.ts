import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class RestaurarService {
    private myAppUrl: string;
    private myApiUrl: string;

  constructor(private http: HttpClient) { 
    
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/restaurar'
  }

  restaurarCopiaSeguridad(): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}`, {});
  }
}
