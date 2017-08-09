import { Injectable } from '@angular/core';
import * as io from "socket.io-client";
import { Constants } from '../providers/constants';

/*
  Generated class for the SocketService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SocketService {

	private socket: any;
	constructor(public constants: Constants) {
	    console.log('Hello SocketService Provider');
	}

	connect() {
		this.socket = io(this.constants.BASE_IP + ':' + this.constants.NODE_PORT);
	}

	close() {
		this.socket.close();
	}

	listen(action: string, callback) {
		this.socket.on(action , function(data){
         	callback && callback(data);
        });
	}

	send(action: string, data: any) {
		this.socket.emit(action, data);
	}
}
