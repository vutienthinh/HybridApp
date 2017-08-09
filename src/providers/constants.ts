import { Injectable } from '@angular/core';

/*
  Generated class for the Constants provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Constants {


	BASE_URL = 'http://172.168.1.197/api/v1/';
	//BASE_URL = 'http://192.168.0.199:8001/api/v1/';

	BASE_IP = 'http://172.168.1.197';

	NODE_PORT = '8080';

	TIMEOUT_RACK = 5000;

	STATUS_SYMBOL = {
		NEW: 'NW',
		RECEIVING: 'RV',
		RECEIVED: 'RD',
		PICKING: 'PK',
		PICKED: 'PD',
		EMPTY: 'ET',
		RESERVED: 'RS',
		FULL: 'FL',
		ACTIVE: 'AT',
		INACTIVE: 'IA',
		ONHOLD: 'OH'
	};

	STATUS = {
		NEW: 'NEW',
		RECEIVING: 'RECEIVING',
		RECEIVED: 'RECEIVED',
		PICKING: 'PICKING',
		PICKED: 'PICKED',
		EMPTY: 'EMPTY',
		RESERVED: 'RESERVED',
		FULL: 'FULL',
		ACTIVE: 'ACTIVE',
		INACTIVE: 'INACTIVE',
		ONHOLD: 'ONHOLD'
	};

}
