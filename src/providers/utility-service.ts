import { Injectable } from '@angular/core';
import { Constants } from './constants';

/*
  Generated class for the UtilityService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UtilityService {
    private STATUS: any = {};
    private STATUS_SYMBOL: any = {};
    constructor(public constants: Constants) {
        console.log('Hello UtilityService Provider');
        this.STATUS = this.constants.STATUS;
        this.STATUS_SYMBOL = this.constants.STATUS_SYMBOL;
    }

    jsonToURLEncoded(jsonString){
        return Object.keys(jsonString).map(function(key){
            return encodeURIComponent(key) + '=' + encodeURIComponent(jsonString[key]);
        }).join('&');
    }

    isExistInArray(array, searchElm, compareField) {
        let result = false;
        if(array && Array.isArray(array)) {
            for(let item of array) {
              if(item[compareField] == searchElm[compareField]) {
                result = true;
                break;
              }
            }
        }
        return result;
    }

    getOneItemInArray(array, searchElm, compareField) {
        let result: any = {};
        if(array && Array.isArray(array)) {
            for(let item of array) {
              if(item[compareField] == searchElm[compareField]) {
                result = item;
                break;
              }
            }
        }
        return result;
    }

    removeItemFromArray(array, compareField, compareValue) {
        for(let i = 0; i < array.length; i++) {
            if(array[i][compareField] == compareValue) {
                array.splice(i, 1);
            }
        }
    }

    updateAllItemOfArray(array, updateField, updateValue) {
        for(let i = 0; i < array.length; i++) {
            array[i][updateField] = updateValue;
        }
    }

    isEmptyObject(obj) {
        return (Object.keys(obj).length === 0);
    }

    convertStatus(status) {
      	let result = '';
        switch (status.toUpperCase()) {
            case this.STATUS.NEW:
                result = this.STATUS_SYMBOL.NEW;
            break;
            case this.STATUS.RECEIVING:
                result = this.STATUS_SYMBOL.RECEIVING;
            break;
            case this.STATUS.RECEIVED:
                result = this.STATUS_SYMBOL.RECEIVED;
            break;
            case this.STATUS.PICKING:
                result = this.STATUS_SYMBOL.PICKING;
            break;
            case this.STATUS.PICKED:
                result = this.STATUS_SYMBOL.PICKED;
            break;
            case this.STATUS.EMPTY:
                result = this.STATUS_SYMBOL.EMPTY;
            break;
            case this.STATUS.RESERVED:
                result = this.STATUS_SYMBOL.RESERVED;
            break;
            case this.STATUS.FULL:
                result = this.STATUS_SYMBOL.FULL;
            break;
            case this.STATUS.ACTIVE:
                result = this.STATUS_SYMBOL.ACTIVE;
            break;
            case this.STATUS.INACTIVE:
                result = this.STATUS_SYMBOL.INACTIVE;
            break;
            case this.STATUS.ONHOLD:
                result = this.STATUS_SYMBOL.ONHOLD;
            break;
        }
        return result;
    }

    displayStatus(status) {
        let result = '';
        switch (status.toUpperCase()) {
            case this.STATUS_SYMBOL.NEW:
                result = this.STATUS.NEW;
            break;
            case this.STATUS_SYMBOL.RECEIVING:
                result = this.STATUS.RECEIVING;
            break;
            case this.STATUS_SYMBOL.RECEIVED:
                result = this.STATUS.RECEIVED;
            break;
            case this.STATUS_SYMBOL.PICKING:
                result = this.STATUS.PICKING;
            break;
            case this.STATUS_SYMBOL.PICKED:
                result = this.STATUS.PICKED;
            break;
            case this.STATUS_SYMBOL.EMPTY:
                result = this.STATUS.EMPTY;
            break;
            case this.STATUS_SYMBOL.RESERVED:
                result = this.STATUS.RESERVED;
            break;
            case this.STATUS_SYMBOL.FULL:
                result = this.STATUS.FULL;
            break;
            case this.STATUS_SYMBOL.ACTIVE:
                result = this.STATUS.ACTIVE;
            break;
            case this.STATUS_SYMBOL.INACTIVE:
                result = this.STATUS.INACTIVE;
            break;
            case this.STATUS_SYMBOL.ONHOLD:
                result = this.STATUS.ONHOLD;
            break;
        }
        return result;
    }

    displayMessageNetwork(type) {
        let result = '';
        switch (type.toUpperCase()) {
            case 'UNKNOWN':
                result = 'Unknown connection';
            break;
            case 'ETHERNET':
                result = 'Ethernet connection';
            break;
            case 'WIFI':
                result = 'WiFi connection';
            break;
            case 'CELL_2G':
                result = 'Cell 2G connection';
            break;
            case 'CELL_3G':
                result = 'Cell 3G connection';
            break;
            case 'CELL_4G':
                result = 'Cell 4G connection';
            break;
            case 'CELL':
                result = 'Cell generic connection';
            break;
            case 'NONE':
                result = 'No network connection';
            break;
        }
        return result;
    }

}
