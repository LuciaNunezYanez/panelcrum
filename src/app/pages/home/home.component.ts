import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

import { RegistropacientesService } from '../../services/registropacientes.service';
import { LoginService } from 'src/app/services/login/login.service';
import { LinksService } from 'src/app/services/link/links.service';
import { SocketIndexService } from 'src/app/services/sockets/socket-index.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  link: string;
  sesionActiva: Boolean;

  constructor(private _video: VideoService, 
    private _regPac: RegistropacientesService,
    private _login: LoginService,
    private router: Router,
    private _link: LinksService,
    private _sk: SocketIndexService) { 
  
    this.link = this._link.generarLink();
    this.skLoginEspera();
    this._sk.escucharConsultas();
  }

  ngOnInit(): void {
    this.sesionActiva = false;
  }  

  abrirVideoLlamada(link: string){
    console.log('Abrirá video llamada');
    // Antes de abrir validar que no tenga activa otra sesión
    // this.router.navigate(['/c', link]);

    if(this.sesionActiva){
      alert('No se puede abrir la cámara, tiene una sesión activa')
    } else {
      this.sesionActiva = true;
      this.router.navigate([]).then(result => {  window.open('c/' + link); });
    }    
  }

  terminarRegistro(data: NgForm){
    if(data.form.status === 'VALID'){
      
      var registro = data.form.value;
      registro.link = this.link;
      

      this._regPac.agregarPaciente(registro).subscribe(( respuesta: any ) => {
        if(respuesta.ok){
          console.log(respuesta);
          Swal.fire('Atención', respuesta.respuesta, 'success');
        } else {
          console.log(respuesta);
          var respError = respuesta.message;
          respError = respError.replace('jwt', 'Token');

          if(respuesta.message === 'jwt expired'){
            Swal.fire('Atención', 'Su token de inicio de sesión ha expirado', 'error');
            this._login.cerrarSesion();
            this.router.navigate(['/login']); 
          } else{
            Swal.fire('Atención', respError, 'error');
          }
        }
      })

    } else {
      Swal.fire('Atención', "Por favor ingrese todos los campos", 'error');
    }
    
  }

  skLoginEspera(){
    const data = {
      sala: 'medico',
      link: 'espera', 
      status: 0
    };

    this._sk.emitirloginMedicoEspera(data, function(error, respuesta) {
      if(error){
        Swal.fire('Atención', error.message, 'error');
      } else {
        console.log(respuesta);
      }
    });
  }

  skLoginConsulta(){
    const data = {
      sala: 'medico',
      link: this.link, 
      status: 0
    };

    this._sk.emitirLoginConsulta(data, function(error, respuesta) {
      if(error){
        Swal.fire('Atención', error.message, 'error');
      } else {
        console.log(respuesta);
      }
    });
  }
  
}
