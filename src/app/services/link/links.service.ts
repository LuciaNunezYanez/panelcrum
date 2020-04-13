import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable({
  providedIn: 'root'
})
export class LinksService {

  constructor() { }

  generarLink(): string{
    const MD5 = new Md5();
    const d = new Date();
    var cadena: string = d.getDate().toString() + 
      d.getMonth().toString() + 
      d.getFullYear().toString() + 
      d.getHours().toString() + 
      d.getMinutes().toString() + 
      d.getSeconds().toString();
    return MD5.appendStr(cadena).end().toString();
  }
}
