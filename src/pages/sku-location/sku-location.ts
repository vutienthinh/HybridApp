import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { SocketService } from '../../providers/socket-service';
import * as io from "socket.io-client";
import { Constants } from '../../providers/constants';
import { ApiService } from '../../providers/api-service';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';
import { CartonPickingPage } from '../carton-picking/carton-picking';
import { UtilityService } from '../../providers/utility-service';
/*
  Generated class for the SkuLocation page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sku-location',
  templateUrl: 'sku-location.html',
  providers: [Storage, ApiService, UtilityService],
  queries: {
    content: new ViewChild('messagesContent')
  }
})
export class SkuLocationPage {
  @ViewChild('messagesContent') content: Content;
	  listLocation: any[];

    activeLocation: any = {};

    currentSku: any = {};
    data: any = {};
    totalRow: number = 0;
  	private whsId: string = '';
  	private wvId: string = '';
  	private wrDtlId: string = '';
    private rackRFIDtemp: string = '';
    isExist: boolean = false;
    isDisabled: boolean = false;


    constructor(public navCtrl: NavController, public alertCtrl: AlertController, public apiservice : ApiService, public constants: Constants,  private sharedservice : SharedService, public socketservice: SocketService, public utilityservice : UtilityService, public navParams: NavParams, public loadingCtrl: LoadingController) {}

    ionViewDidLoad() {
        console.log('Hello SkuLocationPage Page');
        let _that = this;
        _that.whsId = _that.navParams.get('whsid');
        _that.wrDtlId = _that.navParams.get('wrdtlid');
        _that.wvId = _that.navParams.get('wvid');
        this.data['loc_ids'] = [];
        _that.listLocation = [];
        _that.getListLocationWarePick(function(res) {
            let _warepick = res.data;
            _that.currentSku = _warepick.wv_dtl;
            _that.listLocation = _warepick.location;
            _that.totalRow = Math.floor( _that.listLocation.length / 2) + 1;

        });
        _that.connect();
        _that.checkNextSKU(false);
    }

  private scrollTo(value) {
    let _that = this,
        yOffset = document.getElementById(value).offsetTop,
        xOffset = document.getElementById(value).offsetLeft;
        _that.content.scrollTo(xOffset, yOffset, 4000);
  }

    private connect() {
        let _that = this;
        _that.socketservice.connect();
        _that.socketservice.listen('updatedata', function(data) {
            if (data.dataRes.action == "ScanRackOutbound") {
                if(!_that.utilityservice.isEmptyObject(data.dataRes.result)) {
                    _that.rackRFIDtemp = '';
                    _that.rackRFIDtemp = data.dataRes.result.rack ? data.dataRes.result.rack : '';
                    _that.activeLocation = {};
                     _that.getScaningLocation(_that.listLocation, _that.rackRFIDtemp);
                }
            }
        });
    }

    private getScaningLocation(array, value) {
      let _that = this;
      console.log(array);
      console.log(value);
        for(let lo of array ) {
          if(value == lo['loc_rfid']) {
            lo.isBlink = true;
            _that.activeLocation = lo;
            _that.activeLocation.isSame = true;
            _that.scrollTo(value);
         }
         else {
                lo.isBlink = false;
         }
        }
        if(_that.utilityservice.isEmptyObject(_that.activeLocation)) {
          let data = {
            loc_rfid: value
          };
          _that.getActiveLocation(data);
        }
    }

    private getActiveLocation(data) {
      let _that = this,
          whsId = this.whsId ? this.whsId : '',
          wrDtlId = this.wrDtlId ? this.wrDtlId : '';

      _that.apiservice.getActiveLocationData(whsId, wrDtlId, data).subscribe(
        res => {
          if(res.data.length > 0) {
            _that.activeLocation = res.data[0];
            _that.activeLocation.isSame = false;
          } else {
            let alert = _that.alertCtrl.create({
              cssClass: 'error-popup',
              title: '<h4 class="title"> ERROR </h4>',
              message: '<p>RACk RFID is not found</p>',
              buttons: [
                {
                  text: 'OK',
                  role: 'ok',
                  cssClass: 'error-btn',
                  handler: () => {
                  }
                }
              ]
            });
              alert.present();
          }

        },
        error => {},
        () => {}
      );
    }


  	private getListLocationWarePick(callback) {
        let whsId = this.whsId ? this.whsId : '',
        wrDtlId = this.wrDtlId ? this.wrDtlId : '',
        loading = this.loadingCtrl.create();
        // loading.present();
        this.apiservice.getListLocationOfWarePick(whsId, wrDtlId).subscribe(
          res => {
              loading.dismiss();
              if(res.data) {
                callback && callback(res);
                /*this.responseData = res.data;
                this.currentSku = this.responseData.wv_dtl;
                this.listHistory = this.responseData.histories;
                this.listLocation = this.responseData.location;*/
              }
          },
          err => {
            loading.dismiss();
            console.log(err);
          },
          () => {
            loading.dismiss();
            console.log('Complete');
          }
      );
    }

  moreLocation() {
    let _that = this,
        whsId = this.whsId ? this.whsId : '',
        wrDtlId = this.wrDtlId ? this.wrDtlId : '';
          for (let lo of _that.listLocation) {
                  _that.data['loc_ids'].push(lo.loc_id);
          }

      this.apiservice.moreSuggestLocation(whsId, wrDtlId, _that.data).subscribe(
          res => {
              if(res.status && res.data && !_that.utilityservice.isEmptyObject(res.data)) {
              _that.listLocation = _that.listLocation.concat(res.data);
              _that.totalRow = Math.floor( _that.listLocation .length / 2) + 1;
              if( _that.rackRFIDtemp != '') {
                _that.getScaningLocation(_that.listLocation, _that.rackRFIDtemp);
              }
            } else {
              _that.isDisabled = true;
            }
          }
      );
  }

  checkNextSKU(isClick) {
    let _that = this,
        whsId = this.whsId ? this.whsId : '',
        wvId = this.wvId ? this.wvId : '',
        wrDtlId = this.wrDtlId ? this.wrDtlId : '';
    this.apiservice.getNextSKU(whsId, wvId, wrDtlId).subscribe(
        res => {
          if(res.status) {
            if(_that.utilityservice.isEmptyObject(res.data.wvdtl)) {
              _that.isExist = true;
            } else {
              _that.isExist = false;
              if(isClick) {
                _that.gotoSkuLocationPage(whsId, res.data.wvdtl.wv_dtl_id, res.data.wvdtl.wv_id);
              }
            }
          }
        }
    );
  }

  gotoSkuLocationPage(whsId, wr_dtl_id, wv_id) {

          this.navCtrl.push(SkuLocationPage, {
              'whsid': whsId,
              'wrdtlid': wr_dtl_id,
              'wvid': wv_id
          });
  }


}
