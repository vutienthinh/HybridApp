import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import * as io from "socket.io-client";
import { SharedService } from '../../providers/shared-service';
import { SocketService } from '../../providers/socket-service';
import { UtilityService } from '../../providers/utility-service';
import { Constants } from '../../providers/constants';
import { KeysPipe } from '../../pipes/keys-pipe';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

/*
  Generated class for the PalletsRack page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pallets-rack',
  templateUrl: 'pallets-rack.html',
  providers: [Storage, ApiService, UtilityService]
})
export class PalletsRackPage {
  listLocation: any[];
  listPosition: any[];
  currentCustomer: any = {};
  data: any = {};
  activeIndex: number = 0;
  totalRow: number = 0;
  authenData: string;
  deviceName: string;
  sku: string = '';
  private totalCarton: string = '';
  private myInterval: {};
  private STATUS_SYMBOL: any;
  private currentPosition: any;
  private suggestLocation: any;
  private scaningLocation: any;
  private cusId: string = '';
  private whsId: string = '';
  private locRFIDtemp: string = '';
  private isShow: boolean = true;
  isCarton: boolean = true;

  constructor(public navCtrl: NavController, public apiservice: ApiService, public utilityservice: UtilityService, public constants: Constants, private sharedservice: SharedService, public socketservice: SocketService, public loadingCtrl: LoadingController, public alertCtrl: AlertController) { }

  ionViewDidLoad() {
    console.log('PalletsRack');
    let _that = this;
    _that.listLocation = [];
    _that.listPosition = [];
    _that.data = {};
   	_that.activeIndex = 0;
   	_that.totalRow = 0;
    _that.STATUS_SYMBOL = _that.constants.STATUS_SYMBOL;
   	_that.whsId = _that.sharedservice.getter('whsId');
    // 	_that.cusId = _that.sharedservice.getter('cusId');
   	_that.currentPosition = _that.sharedservice.getter('current_position');
   	_that.deviceName = _that.sharedservice.getter('device_name');
    _that.init();
    _that.connect();
    _that.updateTypeRoleOnRack();
    // _that.getAllLocation('', function(res) {  });

  }

  ionViewWillLeave() {
    this.socketservice.close();
  }

  private init() {
    this.suggestLocation = {};
    this.scaningLocation = {};
  }

  connect() {
    let _that = this;
    _that.socketservice.connect();
    _that.socketservice.listen('updatedata', function(data) {
        if (data.dataRes.action == "ScanRack") {
            console.log(data);
            if (data.dataRes.result.length == 0) {
              if (_that.listPosition.length > 0) {
                for (let layer of _that.listPosition) {
                  for (let pos of layer.data) {
                    if (pos['loc_rfid'] == _that.locRFIDtemp && pos.customer.cus_id == _that.cusId) {
                      pos.isChangetoRS = true;

                      _that.apiservice.submitDataRackPallet(_that.whsId, _that.data).subscribe(
                        res => {

                              setTimeout(() => {
                                _that.listPosition = [];
                                _that.currentCustomer = {};
                                _that.sku = '';
                              }, _that.constants.TIMEOUT_RACK);


                        },
                        err => {
                          console.log(err);
                        },
                        () => {
                          // loading.dismiss();
                          console.log('Movie Search Complete');
                        }
                      );

                    }
                    else {
                      pos.isChangetoRS = false;
                    }
                  }
                }
              } else {
                _that.listPosition = [];
                _that.currentCustomer = {};
                _that.sku = '';
              }
            } else {
              _that.data = {
                'pallet-rfid': data.dataRes.result.pallet,
                'loc-rfid': data.dataRes.result.rack
              };
              _that.locRFIDtemp = data.dataRes.result.rack ? data.dataRes.result.rack : '';
              let palletRFIDtemp = data.dataRes.result.pallet ? data.dataRes.result.pallet : '';
                  console.log(_that.locRFIDtemp);
              _that.getAllLocation(_that.locRFIDtemp, palletRFIDtemp, function(res) {
                if(  _that.locRFIDtemp ) {
                  _that.setScaningPosition(_that.listPosition, 'loc_rfid', _that.locRFIDtemp);
                }
              });
            }
        }
    });
  }

  private setScaningPosition(array, field, value) {
    let _that = this;
    for (let layer of array) {
      for (let pos of layer.data) {
        if (pos[field] !== undefined && pos[field] == value) {
          pos.isBlink = true;
          pos.numCarton = _that.totalCarton;
        }
        else {
          pos.isBlink = false;
        }
      }
    }
  }

  private getAllLocation(loc_rfid, pallet_rfid, callback) {
    let _that = this,
      whsId = _that.whsId ? _that.whsId : '';
      if(loc_rfid) {
        this.apiservice.getDropPalletOnRack(whsId, pallet_rfid, loc_rfid).subscribe(
          res => {
            if (res.status) {
              _that.listPosition = res.data.layout;
              _that.cusId = res.data.cus_id;
              _that.sku = res.data.sku;
              _that.totalCarton = res.data.ctns_ttl;
              _that.isCarton = true;
              for (let cus of res.data.customer) {
                if(_that.cusId == cus.cus_id) {
                   _that.currentCustomer = cus;
                }
              }
              callback && callback(res);
            } else if(_that.isShow) {

              let alert = _that.alertCtrl.create({
                cssClass: 'error-popup',
                title: '<h4 class="title"> ERROR </h4>',
                message: '<p>' + res.message + '</p>',
                buttons: [
                  {
                    text: 'OK',
                    role: 'ok',
                    cssClass: 'error-btn',
                    handler: () => {
                        _that.isShow = true;
                    }
                  }
                ]
              });
              _that.isShow = false;
              alert.present();
            }
          },
          err => {
            console.log(err);
          },
          () => {
            console.log('Movie Search Complete');
          }
        );
      } else {
        this.apiservice.getLocationOnRack(whsId, pallet_rfid).subscribe(
          res => {
            if (res.status) {
              _that.listPosition = res.data.layout;
              _that.cusId = res.data.cus_id;
              _that.sku = res.data.sku;
              _that.isCarton = false;
                for (let cus of res.data.customer) {
                  if(_that.cusId == cus.cus_id) {
                     _that.currentCustomer = cus;
                  }
                }
              callback && callback(res);
            } else if(_that.isShow) {

              let alert = _that.alertCtrl.create({
                cssClass: 'error-popup',
                title: '<h4 class="title"> ERROR </h4>',
                message: '<p>' + res.message + '</p>',
                buttons: [
                  {
                    text: 'OK',
                    role: 'ok',
                    cssClass: 'error-btn',
                    handler: () => {
                        _that.isShow = true;
                    }
                  }
                ]
              });
              _that.isShow = false;
              alert.present();
            }
          },
          err => {
            console.log(err);
          },
          () => {
            console.log('Movie Search Complete');
          }
        );
      }


  }

  private updateTypeRoleOnRack() {
      let whsId = this.whsId ? this.whsId : '',
          roleType = 'IB';
      this.apiservice.updateTypeRoleOnRack(whsId, roleType).subscribe(
        res => {
            if(res.data) {
                  
            }
        },
        err => {
            console.log(err);
        },
        () => {
          // console.log('Complete');
        }
    );
  }

}
