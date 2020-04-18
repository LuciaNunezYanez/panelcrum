import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketIndexService {

  consultas: any [];
  constructor( private socket: Socket) { }

  emitirLoginConsulta(data, callback?: Function){
    this.socket.emit('loginConsulta', data, callback);
  }

  emitirloginMedicoEspera(data, callback?: Function){
    this.socket.emit('loginMedicoEspera', data, callback);
  }

  escucharConsultas(){
    this.socket.on('listaConsultasActualizada', (consultas) => {
      this.consultas = consultas;
      console.log(consultas);
    })
  }

  emitirBuscarOferta(link: string, callback: Function){
    const oferta = {
      link
    }
    this.socket.emit('buscarOferta', oferta, callback);
  }
}
