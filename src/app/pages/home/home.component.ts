import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
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

  // p = navigator.mediaDevices.getUserMedia();
  @ViewChild('videoLocal', {static: false}) videoLocal:ElementRef;

  constraints = {
    'video': true
  }

  videoSource = null;
  mediaDevices: any;
  navigator: any;
  link: string;

  source;

  // MediaStream
  streaming: MediaStream;

  // HTML Elements
  vidLoc;
  btnIniciar;
  btnDetener;
  constructor(private _video: VideoService, 
    private _regPac: RegistropacientesService,
    private _login: LoginService,
    private router: Router,
    private _link: LinksService,
    private _sk: SocketIndexService) { 
  
  
    // Inicializar cámara y conocer dispositivos conectados 
    if (navigator.mediaDevices === undefined) {
        this.mediaDevices = {};
        this.mediaDevices = navigator.mediaDevices;
        this.navigator = navigator;
        this.mediaDevices.getUserMedia = function(constraintObj) {
            let getUserMedia = this.navigator.webkitGetUserMedia || this.navigator.mozGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia no está implementado en este navegador'));
            }
            return new Promise(function(resolve, reject) {
                getUserMedia.call(this.navigator, constraintObj, resolve, reject);
            });
        }
    } else {
        console.log('----> Mis dispositivos conectados son: ');
        this.navigator = navigator;
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                devices.forEach(device => {
                    // console.log(device);
                    console.log(device.kind.toUpperCase(), device.label);
                    //, device.deviceId
                })
                console.log('----------------------------------');
            })
            .catch(err => {
                console.log(err.name, err.message);
            })
    }
    
    this.link = this._link.generarLink();
    this.skLoginEspera();
    this._sk.escucharConsultas();
  }

  ngOnInit(): void {
    this.vidLoc = document.getElementById('videoLocal');
    this.btnIniciar = document.getElementById('btnIniciar');
    this.btnDetener = document.getElementById('btnDetener');
  }
  
  iniciar(){
    console.log('Iniciando getUserMedia.. (Esperar)');

    this.deshabilitarBotones();
    const constraints = { 'video': true, 'audio': true };
        
    navigator.mediaDevices.getUserMedia(constraints).then( (stream: MediaStream) => {
      console.log('Ya conseguí stream');
      console.log(stream);
      this.streaming = stream;
      this.vidLoc.srcObject = stream;
    })
    .catch( (error) => {
      console.log('==> CATCH <==');
      if (error.name === 'PermissionDeniedError') {
       alert('No se han otorgado permisos para usar su cámara y '+
       'micrófono, debe permitir que la página acceda a sus dispositivos en' +
       'orden.');
      }
      console.error(error);
    });
  }
  
  iniciarGrabacion(){
    this.promesaDetenerGrabacion(this.vidLoc)
    .then( resp => {
      console.log('Iniciaré la cámara ya que terminé bien.');
      this.iniciar();
    })
    .catch( error => {
      console.log(error);
    } );
    
  }

  detener(){
    // this.detenerGrabacion(this.vidLoc);
    this.promesaDetenerGrabacion(this.vidLoc)
    .then( resp => {
      console.log( resp );
      this.deshabilitarBotones();
    })
    .catch( error => {
      console.log( error );
    } );
  }
  
  promesaDetenerGrabacion( videoElement ): Promise<String>{
    return new Promise( (resolve, reject)=>{
      try {
        const stream = videoElement.srcObject;
        // Si existe stream 
        if(stream){
          console.log('Voy a detener la grabación');
          const tracks = stream.getTracks();
          tracks.forEach( function(track){
            track.stop();
          });
          videoElement.srcObject = null;
          resolve('Ha terminado correctamente la camara');
        } else {
          resolve('No existe stream que detener');
        }
      } catch (error) {
        reject(error);
      }
    })

  }

  // detenerGrabacion(videoElement){
    // // Como que pausa la transmisión, pero sigue llegando streaming 
    // this.streaming.removeTrack(this.streaming.getVideoTracks()[0]);
    // this.streaming.removeTrack(this.streaming.getAudioTracks()[0]);
  // }

  deshabilitarBotones(){
    this.btnIniciar.disabled = !this.btnIniciar.disabled;
    this.btnDetener.disabled = !this.btnDetener.disabled;
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
