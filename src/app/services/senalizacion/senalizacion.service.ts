import { Injectable } from '@angular/core';
import { SocketIndexService } from '../sockets/socket-index.service';
import { Socket } from 'ngx-socket-io';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class SenalizacionService {

  iceConfig: Object;
  peerConnection: RTCPeerConnection;
  constraintsAudio = {
    'audio': true,
    'video': false
  }

  // HTML Elements
  videoRemoto;
  remoteStream = new MediaStream();

  constructor(private socket: Socket) { 
    // Inicializar valores de conexión
    // this.configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    this.iceConfig = {
      iceServers: [{
              urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
          }
      ],
    };
    
    // this.peerConnection = new RTCPeerConnection(this.iceConfig);

  }

  inicializar(){
    this.peerConnection = new RTCPeerConnection(this.iceConfig);
    this.peerConnection.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => {
      console.log(':::::::CANDIDATO:::::: ');
      if(event.candidate){
        const objetoCandidato ={
          isTrusted: event.isTrusted ,
          candidate: event.candidate ,
          type: event.type ,
          target: event.target ,
          currentTarget: event.currentTarget ,
          eventPhase: event.eventPhase,
          bubbles: event.bubbles ,
          cancelable: event.cancelable ,
          defaultPrevented: event.defaultPrevented ,
          composed: event.composed ,
          timeStamp: event.timeStamp ,
          srcElement: event.srcElement ,
          returnValue: event.returnValue ,
          cancelBubble: event.cancelBubble
          // path: event.path
        }
        this.socket.emit('candidatoMedico', objetoCandidato);
        console.log('----> Tengo un nuevo ICE CANDIDATE Local que ya emití');
        
      } else {
        console.log('<---- Ya no tengo candidatos locales');
      }
    });

    this.peerConnection.oniceconnectionstatechange = e => {
      console.info('El estado cambió: ', this.peerConnection.iceConnectionState);
      if(this.peerConnection.iceConnectionState === 'connected'){
        Swal.fire('Bravo', 'Te has conectado', 'success');
      }
      if(this.peerConnection.iceConnectionState === 'disconnected'){
        Swal.fire('Ups', 'Te has desconectado', 'error');
      }
    }

    this.peerConnection.ontrack = ev => {
      console.log(':333333333 TRACK');
      if(ev.streams && ev.streams[0]){
        this.videoRemoto.srcObject = ev.streams[0];
      } else{
        if(!this.remoteStream){
          this.remoteStream = new MediaStream();
          this.videoRemoto = this.remoteStream;
        }
        this.remoteStream.addTrack(ev.track);
      }
    }
    this.peerConnection.addEventListener('track', async (event) => {
      console.log('QQQQQQQQQQ RECIBIENDO TRACK QQQQQQQQQQQQ');
      this.remoteStream.addTrack(event.track);
    })
  }

  // Cuando se le dá click 
  async generarRespuesta(oferta: any, link: string) {
    console.log('La offer recibida es:', oferta);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(oferta.offer));
    const answer = await this.peerConnection.createAnswer();
    console.log('Se definió local description');
    await this.peerConnection.setLocalDescription(answer);
    // console.log('Generé mi ANSWER: ', answer);
    this.socket.emit('respuestaMedico', {answer: this.peerConnection.localDescription, link });
   
  }

  obtenerVideoLocal(videoLocal: any, videoRemoto: any){
    console.log('Iniciando getUserMedia.. (Esperar)');
    this.videoRemoto = videoRemoto;
    this.remoteStream = null;
    this.videoRemoto.srcObject = this.remoteStream;
    // this.deshabilitarBotones();
            
    navigator.mediaDevices.getUserMedia(this.constraintsAudio).then( (stream: MediaStream) => {
      console.log('(Bien) Ya conseguí stream');
      // console.log(stream);
      // this.streaming = stream;
      videoLocal.srcObject = stream;
      stream.getTracks().forEach( track => {
        this.peerConnection.addTrack(track, stream);
      });
    })
    .catch( (error) => {
      console.log('(Mal) ==> CATCH <==');
      console.log(error.name);
      if (error.name === 'PermissionDeniedError') {
       alert('No se han otorgado permisos para usar su cámara y/o '+
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


  agregarCandidato(candidato){
    this.agregarCandidatoRemoto(candidato).then( (data ) => {
      console.log(':)))) Según se agregó candidato remoto');
    }).catch( (err) => {
      console.log(':(((( Hubo un error al agregar candidato remoto');
      console.error(err);
    });
  }

  async agregarCandidatoRemoto(candidato){
    // console.log('Candidato recibido');
    // console.log(candidato);

    // console.log(this.peerConnection);
    // console.log(this.peerConnection.remoteDescription.type);
    console.log('---> Candidato REMOTO a agregar <---');
    // console.log(candidato);
    // if(!this.peerConnection){ //|| !this.peerConnection.remoteDescription.type
      // console.log(':)))) XXXXXXXXXXXXXXXXXXXX');
      const cand = new RTCIceCandidate(candidato.candidate);
      console.log('cand remoto', cand);
      var hasRemote:Boolean = false;
      if(this.peerConnection.remoteDescription){
        hasRemote = true;
      }
      console.error('remote description: ', hasRemote);
      await this.peerConnection.addIceCandidate(cand);
    // } else {
    //   console.log(':(((( Cayó aquí');
    // }

  }
}
