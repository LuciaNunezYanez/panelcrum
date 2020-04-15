import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketIndexService {

  constructor( private socket: Socket) { }

  emitirLoginConsulta(data, callback?: Function){
    this.socket.emit('loginConsulta', data, callback);
  }

  emitirloginMedicoEspera(data, callback?: Function){
    this.socket.emit('loginMedicoEspera', data, callback);
  }

  escucharConsultas(){
    this.socket.on('listaConsultasActualizada', (consultas) => {
      console.log(consultas);
    })
  }
}
