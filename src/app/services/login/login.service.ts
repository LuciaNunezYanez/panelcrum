import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  URL = environment.url;
  userToken: string;

  constructor(private http: HttpClient) { }

  login( data: any){
    return this.http.post(`${this.URL}/login`, data);
  }

  guardarTokenLS(token: any){
    this.userToken = token;
    localStorage.setItem('tokenVideoLlam', token);
  }

  estaAutenticado(): Boolean{
    return this.userToken.length > 2;
  }

  obtenerTokenLS() {
    if ( localStorage.getItem('tokenVideoLlam') ){
      this.userToken = localStorage.getItem('tokenVideoLlam');
    } else {
      this.userToken = '';
    }
    return this.userToken;
  }

  cerrarSesion() {
    localStorage.removeItem('tokenVideoLlam');
  }

}
