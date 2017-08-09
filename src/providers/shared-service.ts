import { Injectable } from '@angular/core';

/*
  Generated class for the SharedService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SharedService {

	data = {};

  	constructor() {
    	console.log('Hello SharedService Provider');
  	}

  	setter(field: string, value: any) {
	    this.data[field] = value;
	}

	getter(field: string) {
	    return this.data[field];
	}

}
