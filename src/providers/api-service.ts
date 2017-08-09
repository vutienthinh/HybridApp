import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { Headers, RequestOptions } from '@angular/http';
import { Constants } from './constants';
import { Network } from 'ionic-native';
import { UtilityService } from '../providers/utility-service';
import { AlertController } from 'ionic-angular';

/*    propertiesURL = SERVER_URL + '/properties',
    favoritesURL = propertiesURL + '/favorites';*/
/*
  Generated class for the ApiService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ApiService {
    private BASE_URL: string;
    constructor(public http: Http, public storage: Storage, public constants: Constants, public utilityservice : UtilityService, private alertCtrl: AlertController) {
        console.log('Hello ApiService Provider');
        this.http = http;
        this.BASE_URL = constants.BASE_URL;
    }

    private getHeader() {
        let _token = window.localStorage.getItem('token');
        let _headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Bearer ' + _token });
        let _options = new RequestOptions({ headers: _headers });
        return _options;
    }

    private getHeaderJson() {
        let _token = window.localStorage.getItem('token');
        let _headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _token });
        let _options = new RequestOptions({ headers: _headers });
        return _options;
    }

    private handleError(error: any) {
        let errMsg: string = '';
        //alert(this.utilityservice.displayMessageNetwork(Network.connection));
        if(Network.connection.toUpperCase() == 'NONE' || Network.connection.toUpperCase() == 'UNKNOWN') {
            errMsg = this.utilityservice.displayMessageNetwork(Network.connection);
        }
        else {
            errMsg = (error.message) ? error.message :
                error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        }
        let _alert = this.alertCtrl.create({
                cssClass: 'error-popup',
                title: '<h4 class="title"> ERROR </h4>',
                message: '<p>' + errMsg +'</p>',
                buttons: [
                    {
                        text: 'OK',
                        role: 'ok',
                        cssClass: 'error-btn',
                        handler: () => {
                          console.log('Cancel clicked');
                        }
                    }
                ]
                });
            _alert.present();
        return Observable.throw(errMsg);
    }

    doLogin(body) {
        let _body = body;
        let _headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let _options = new RequestOptions({ headers: _headers });
        return this.http.post(this.BASE_URL + 'login', _body, _options)
            .map(res => res.json())
            .catch(this.handleError.bind(this));
    }

    doLogout() {
        let _url = this.BASE_URL + 'logout';
        return this.http.post(_url, {}, this.getHeader())
            .map(res => res.json());
    }

    getAllASNDetail(whs_id, cus_id, ctnr_id, limit = 8, cur_page = 1) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/asns-list-detail?cus_id=' + cus_id + '&ctnr_id=' + ctnr_id + '&limit=' + limit + '&page=' + cur_page;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json())
            .catch(this.handleError.bind(this));
    }

    listScanedCarton(whs_id, asn_dtl_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/get-carton-asn?asn_dtl_id=' + asn_dtl_id;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    deleteVirtualCarton(whs_id, cus_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus/' + cus_id + '/carton/delete-virtual-carton';
        return this.http.put(_url, data, this.getHeader())
            .map(res => res.json())
            .catch(this.handleError.bind(this));
    }

    damageVirtualCarton(whs_id, cus_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus/' + cus_id + '/carton/set-damage-carton';
        return this.http.put(_url, data, this.getHeader())
            .map(res => res.json())
            .catch(this.handleError.bind(this));
    }

    completeSkuOfAsn(whs_id, cus_id, asn_dtl_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus/' + cus_id + '/asn-detail/' + asn_dtl_id + '/complete-sku';
        return this.http.put(_url, {}, this.getHeader())
            .map(res => res.json())
            .catch(this.handleError.bind(this));
    }

    getListCustomer(whs_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus-list';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
        //.catch(this.handleError);
    }

    getListContainer(whs_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/containers';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
        //.catch(this.handleError);
    }

    getListLocation(loc_type) {
        let _url = this.BASE_URL + 'location/list?loc_type=' + loc_type;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    getListGate(whs_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/gate-code-list';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    getListChecker(whs_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/user-checker-list';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    checkCheckerIsAssigned(whs_id, chker_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/check-checker-receiving/' + chker_id;
        return this.http.put(_url, data, this.getHeader())
            .map(res => res.json());
    }

    getListRFIDReader(whs_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/reader-list';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    updateStatusOfAsnDetail(whs_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/asns/update-status';
        return this.http.post(_url, data, this.getHeader())
            .map(res => res.json())
            .catch(this.handleError.bind(this));
    }

    doRefeshSkuVerification(whs_id, chker_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/refesh-sku-verification-page/' + chker_id;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    changeStatusAsnDetail(whs_id, chker_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/stop-asn/' + chker_id;
        return this.http.put(_url, data, this.getHeader())
            .map(res => res.json());
    }

    getPositionByLocation(loc_type, loc_id) {
        let _url = this.BASE_URL + 'location/list?loc_type=' + loc_type + '&loc_' + loc_type + '=' + loc_id;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    getLocationOnRack(whs_id, palletRFID) {
        let _url = this.BASE_URL + 'whs/'+ whs_id  +'/pallet/'+ palletRFID +'/location/rack/get-empty-locations';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    getDropPalletOnRack(whs_id, pallet_rfid, loc_rfid) {
      let _url = this.BASE_URL + 'whs/'+ whs_id  +'/pallet/'+ pallet_rfid +'/drop-location?loc_rfid=' + loc_rfid;
      return this.http.get(_url, this.getHeader())
          .map(res => res.json());
    }

    getGateAtReceiving(whs_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/get-asn-processing';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    getLocationAtReceiving(whs_id, loc_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/gate-code-receiving?location_id=' + loc_id;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    getSuggestLocForPallet(whs_id, cus_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus/' + cus_id + '/location/rack/get-empty-location';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    getScaningLocForPallet(whs_id) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/scan-rac';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    updateTypeRoleOnRack(whs_id, role_type) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/update-pallet-type/' + role_type;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    submitLocationPutaway(whs_id, cus_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus/' + cus_id + '/location/goods-receipts/put-away/pick-pallet';
        return this.http.post(_url, data, this.getHeader())
            .map(res => res.json());
    }

    submitLocationRack(whs_id, cus_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus/' + cus_id + '/location/rack/put-pallet';
        return this.http.put(_url, data, this.getHeader())
            .map(res => res.json());
    }

    submitLocationReveiving(whs_id, cus_id, data) {
        let _url = this.BASE_URL + 'whs/' + whs_id + '/cus/' + cus_id + '/position/update-status';
        return this.http.post(_url, data, this.getHeader())
            .map(res => res.json());
    }

    // Outbound API


    getListWarePick(whs_id) {
        let _url = this.BASE_URL  + whs_id + '/waves';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    getListLocationOfWarePick(whs_id, wv_dtl_id) {
        let _url = this.BASE_URL  + 'whs/' + whs_id + '/wave/sku/' + wv_dtl_id;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    submitPickFullPallet(whs_id, wv_dtl_id, data) {
        let _url = this.BASE_URL + whs_id + '/wave/sku/' + wv_dtl_id + '/pallet';
        return this.http.put(_url, data, this.getHeader())
            .map(res => res.json());
    }

    updateStatusOfWarePick(whs_id, data) {
        let _url = this.BASE_URL + whs_id + '/wave/update-status';
        return this.http.post(_url, data, this.getHeaderJson())
            .map(res => res.json());
    }

    /*getRFIDWhenScan(whs_id, rfid) {
        let _url = BASE_URL  + whs_id + '/carton/rfid/' + rfid;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }*/

    getRFIDInfoWhenScanCarton(whs_id) {
        let _url = this.BASE_URL  + whs_id + '/scan-carton-outbound';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    getRFIDInfoWhenScanContainer(whs_id) {
        let _url = this.BASE_URL  + whs_id + '/scan-container-outbound';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    submitPickFullCarton(whs_id, wv_dtl_id, ctnr_num) {
        let _url = this.BASE_URL + whs_id + '/wave/sku/' + wv_dtl_id + '/carton?ctn_num=' + ctnr_num;
        return this.http.put(_url, {}, this.getHeader())
            .map(res => res.json());
    }

    getListorder(whs_id, cur_page) {
        let _url = this.BASE_URL +  whs_id + '/order' + '?page=' + cur_page;
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());
    }

    getDetailAssignOrder(whs_id, odr_id) {
        let _url = this.BASE_URL  + whs_id + '/order/' + odr_id + '/cartons';
        return this.http.get(_url, this.getHeader())
            .map(res => res.json());

    }

    checkRFIDstatusOrderDetail(whs_id, odr_id, data) {
        let _url = this.BASE_URL + whs_id + '/order/' + odr_id + '/cartons';
      // let _url =   'http://wms2.wap.dev.seldatdirect.com/core/wap-site/wap/outbound/' + whs_id + '/order/' + odr_id + '/cartons';
        return this.http.put(_url, data, this.getHeaderJson())
            .map(res => res.json());
    }

    submitAssignedCarton(whs_id, order_dtl_id, data) {
        let _url = this.BASE_URL + whs_id + '/order/sku/' + order_dtl_id + '/cartons';
        return this.http.put(_url, data, this.getHeaderJson())
            .map(res => res.json());
    }

    submitDataRackPallet(whs_id, data) {
        let _url = this.BASE_URL + 'whs/'+ whs_id + '/location/rack/put-pallet';
        return this.http.put(_url, data, this.getHeaderJson())
            .map(res => res.json());
    }

    getActiveLocationData(whs_id, wv_dtl_id, data) {
        let _url = this.BASE_URL + 'whs/'+ whs_id +'/wave/'+ wv_dtl_id +'/active-location';
        return this.http.post(_url, data, this.getHeaderJson())
            .map(res => res.json());
    }

    getCartonOfPallet(whs_id, palletNum) {
      let _url = this.BASE_URL  + 'whs/'+ whs_id +'/pallet/'+ palletNum +'/cartons';
      return this.http.get(_url, this.getHeader())
          .map(res => res.json());
    }

    assginedPackedCartonPallet(whs_id, data) {
        let _url = this.BASE_URL + whs_id +'/pallet/assign-cartons';
        return this.http.put(_url, data, this.getHeaderJson())
            .map(res => res.json());
    }

    moreSuggestLocation(whs_id, wv_dtl_id, data) {
      let _url = this.BASE_URL  + 'whs/'+ whs_id +'/wave/'+ wv_dtl_id +'/more-location';
      return this.http.post(_url, data, this.getHeaderJson())
          .map(res => res.json());
    }

    getNextSKU(whs_id, wv_id, wv_dtl_id) {
      let _url = this.BASE_URL  + 'whs/'+ whs_id +'/wave/'+ wv_id +'/next-sku/' + wv_dtl_id;
      return this.http.get(_url, this.getHeader())
          .map(res => res.json());
    }

}
