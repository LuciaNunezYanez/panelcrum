import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketIndexService {

  constructor( private socket: Socket) { }

  emitirLogin(data, callback?: Function){
    console.log('Emitiré login');
    this.socket.emit('login', data, callback);
  }
}
