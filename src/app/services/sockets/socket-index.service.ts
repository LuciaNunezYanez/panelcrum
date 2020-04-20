import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SenalizacionService } from '../senalizacion/senalizacion.service';

@Injectable({
  providedIn: 'root'
})
export class SocketIndexService {

  consultas: any [];
  constructor( private socket: Socket, private _skSenalizacion: SenalizacionService) { }

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

  escucharCandidatos(link: string){
    console.log('Escuchar candidatos de ', link);
    this.socket.on(`candidatoPM${link}`, (data: any) =>{
      this._skSenalizacion.agregarCandidato(data);
    })
  }

  emitirBuscarOferta(link: string, callback: Function){
    const oferta = {
      link
    }
    this.socket.emit('buscarOferta', oferta, callback);
  }
}
