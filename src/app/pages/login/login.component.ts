import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor( private _login: LoginService, private router: Router) { }

  ngOnInit(): void {
  }

  loguear(data: any){
    const login = data.form.value;
    if(data.form.status === 'VALID'){
      this._login.login(login).subscribe( (respuesta: any ) => {
        if(respuesta.ok){
          if(respuesta.usuario){
            if(respuesta.token){
              this._login.guardarTokenLS(respuesta.token);
              this.router.navigate(['/home']); 
              Swal.fire('Atención', respuesta.message , 'success');
            } else {
              Swal.fire('Atención', 'Ocurrión un error al generar token' , 'error');
            }
          } else {
            Swal.fire('Atención', respuesta.message , 'info');
          }
        } else{
          Swal.fire('Atención', respuesta.message , 'error');
        }
      });      
    } else {
      Swal.fire('Atención', 'Por favor ingrese todos los campos', 'error');
    }

  }


}
