import { Injectable } from '@angular/core';
import { SocketIndexService } from '../sockets/socket-index.service';
import { Socket } from 'ngx-socket-io';
@Injectable({
  providedIn: 'root'
})
export class SenalizacionService {

  configuration: Object;
  peerConnection: RTCPeerConnection;

  constructor(private socket: Socket) { 
    // Inicializar valores de conexión
    this.configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    this.peerConnection = new RTCPeerConnection(this.configuration);
  }


  async generarRespuesta(oferta: any, link: string) {
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(oferta.offer));
    const answer: RTCSessionDescriptionInit = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    console.log('Generé mi ANSWER: ', answer);
    this.socket.emit('respuestaMedico', {answer, link });
    // Ahora enviar mi respuesta 
    // signalingChannel.send({'answer': answer});
   
  }
}
