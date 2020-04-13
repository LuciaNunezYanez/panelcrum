import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoginService } from 'src/app/services/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class RegistropacientesService {

  URL = environment.url;

  constructor(private http: HttpClient, private _login: LoginService) { }

  agregarPaciente(data: any){
    return this.http.post(`${this.URL}/registropac/${this._login.obtenerTokenLS()}`, data);
  }
}
