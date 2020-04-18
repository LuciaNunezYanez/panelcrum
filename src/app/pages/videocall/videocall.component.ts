import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SocketIndexService } from '../../services/sockets/socket-index.service';
import { SenalizacionService } from 'src/app/services/senalizacion/senalizacion.service';


@Component({
  selector: 'app-videocall',
  templateUrl: './videocall.component.html',
  styleUrls: ['./videocall.component.css']
})
export class VideocallComponent implements OnInit {


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

  offer;
  hasOffer: Boolean;

  constructor(private routerActive:  ActivatedRoute,
              private _sk: SocketIndexService,
              private _senalizacion : SenalizacionService) {

    this.routerActive.params.subscribe( (parametros: any) => {
      try {
        this.link = parametros.link;
        this.hasOffer = false;
        this.emitirBuscarOferta();
      } catch (error) {
        alert('Link incorrecto')
      }
    });

    this.obtenerDispositivosConectados();
    
   }

  ngOnInit(): void {
    this.hasOffer = false;
    this.vidLoc = document.getElementById('videoLocal');
    this.btnIniciar = document.getElementById('btnIniciar');
    this.btnDetener = document.getElementById('btnDetener');
    
  }

  emitirBuscarOferta(){
    this._sk.emitirBuscarOferta(this.link, (error: any, respuesta: any ) => {
      if(error){
        console.log('El error dice: ', error);
      } else {
        console.log('La respuesta dice: ', respuesta);
        // La oferta es
  
        if (respuesta.offer) {
          this.hasOffer = true;
          this.offer = respuesta.offer;
          this._senalizacion.generarRespuesta(respuesta, this.link);
        }
      }
    });
  }

  obtenerDispositivosConectados(){
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
      console.log(error.name);
      if (error.name === 'PermissionDeniedError') {
       alert('No se han otorgado permisos para usar su cámara y '+
       'micrófono, debe permitir que la página acceda a sus dispositivos en' +
       'orden.');
      } else if (error.name === 'NotFoundError'){
        alert('No hay un dispositivo de video conectado');
      } else {
        alert(error.name);
      }
      console.error(error);
    });
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

  deshabilitarBotones(){
    this.btnIniciar.disabled = !this.btnIniciar.disabled;
    this.btnDetener.disabled = !this.btnDetener.disabled;
  }

  
  // detenerGrabacion(videoElement){
    // // Como que pausa la transmisión, pero sigue llegando streaming 
    // this.streaming.removeTrack(this.streaming.getVideoTracks()[0]);
    // this.streaming.removeTrack(this.streaming.getAudioTracks()[0]);
  // }
}
