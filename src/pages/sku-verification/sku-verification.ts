import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as io from "socket.io-client";
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import { SharedService } from '../../providers/shared-service';
import { SocketService } from '../../providers/socket-service';
import { UtilityService } from '../../providers/utility-service';
import { LoginPage } from '../login/login';
import { Constants } from '../../providers/constants';
/*
  Generated class for the SkuVerification page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sku-verification',
  templateUrl: 'sku-verification.html',
  providers: [Storage, ApiService, UtilityService, SocketService]
})
export class SkuVerificationPage {
  textPlay = 'Start';
  color = '';
  disabled = true;
  totalCarton: number = 0;
  listRfid: any[];
  lengthRfid: number = 0;
  isStopScanning: boolean = false;
  listHistory: any[];
  currentSku: any = {};
  private alertPresented: boolean = true;
  private exceedAlertPresented: boolean = true;
  private whsId: string = '';
  private cusId: string = '';
  private userId: string = '';

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public apiservice: ApiService, public navParams: NavParams, private sharedservice: SharedService, public socketservice: SocketService, public utilityservice : UtilityService, public constants: Constants) {
    let _that = this;
    _that.whsId = _that.sharedservice.getter('whsId');
    _that.cusId = _that.sharedservice.getter('cusId');
    _that.userId = _that.sharedservice.getter('userId');
    _that.listRfid = [];
  }

  ionViewDidLoad() {
    let _that = this;
    _that.connect();
    _that.stopCarton();
    _that.doRefeshSkuVerification(function(res) {});
  }

  ionViewWillLeave() {
   this.socketservice.close();
  }

  private connect() {
    let _that = this;
        _that.socketservice.connect();
        _that.socketservice.listen('updatedata', function(data) {
            _that.handleScanCartonData(data);
            console.log(data);
        });
  }

  stopCarton() {

    let _that = this;
    if (_that.textPlay == 'stop') {
        if(_that.currentSku && !_that.utilityservice.isEmptyObject(_that.currentSku)) {
            _that.changeStatusAsnDetail(_that.constants.STATUS_SYMBOL.ONHOLD, function(res) {});
        }
        _that.isStopScanning = true;
        _that.disabled = false;
        _that.textPlay = 'Start';
        _that.color = '';
    } else {
        if(_that.currentSku && !_that.utilityservice.isEmptyObject(_that.currentSku)) {
            _that.changeStatusAsnDetail(_that.constants.STATUS_SYMBOL.RECEIVING, function(res) {
                _that.doRefeshSkuVerification(function(res) {});
            });
        }
        _that.isStopScanning = false;
        _that.disabled = true;
        _that.textPlay = 'stop';
        _that.color = 'danger';
    }
  }

  // //delete Virtual Carton
  removeRfid(ctn_rfid) {

    let _that = this,
        _paramRmRfid = {
                        ctn_rfid: ctn_rfid
                      },
        _body = _that.utilityservice.jsonToURLEncoded(_paramRmRfid),
        _alert = _that.alertCtrl.create({
            title: 'Delete RFID: ' + ctn_rfid + ' ?',
            buttons: [
                { text: 'Cancel' }, {
                  text: 'OK',
                  type: 'button-assertive',
                  handler: (e) => {
                    // e.preventDefault(false);
                    let loading = _that.loadingCtrl.create();
                    loading.present();
                    _that.apiservice.deleteVirtualCarton(_that.whsId, _that.cusId, _body).subscribe(
                      _res => {
                        loading.dismiss();
                        let res = _res || <any>{};
                        if(res.status) {
                            _that.utilityservice.removeItemFromArray(_that.listRfid, 'rfid', ctn_rfid);
                            _that.lengthRfid = (_that.listRfid && _that.listRfid.length) ? _that.listRfid.length : 0;
                            let alert = _that.alertCtrl.create({
                              cssClass: 'success-popup',
                              title: '<h4 class="title"> SUCCESS </h4>',
                              message: '<p>Delete RFID: ' + ctn_rfid + ' successfully</p>',
                              buttons: [
                              {
                                  text: 'OK',
                                  role: 'ok',
                                  cssClass: 'success-btn',
                                }
                              ]
                            });
                            alert.present();
                        }
                        else {
                            let _alert = _that.alertCtrl.create({
                                cssClass: 'error-popup',
                                title: '<h4 class="title"> ERROR </h4>',
                                message: '<p>Failed to delete RFID ' + ctn_rfid + '!</p>',
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
                        }
                      },
                      err => {
                        loading.dismiss();
                      },
                      () => {
                        loading.dismiss();
                      }
                    );
                }
            }]

        });
        _alert.present();

  }

  // //set damage carton
  damageRfid(carton) {
    let _that = this,
        _ctn_rfid = carton.rfid,
        _paramRmRfid = {
                        ctn_rfid: _ctn_rfid
                      },
        _body = _that.utilityservice.jsonToURLEncoded(_paramRmRfid),
        _alert = this.alertCtrl.create({
            title: 'Damage RFID: ' + _ctn_rfid + ' ?',
            buttons: [
                { text: 'Cancel' }, {
                  text: 'OK',
                  type: 'button-assertive',
                  handler: (e) => {
                    // e.preventDefault(false);
                    let loading = this.loadingCtrl.create();
                    loading.present();
                    _that.apiservice.damageVirtualCarton(_that.whsId, _that.cusId, _body).subscribe(
                      _res => {
                        loading.dismiss();
                        let res = _res || <any>{};
                        if(res.status) {
                            carton.status = 'ID';
                            let alert = _that.alertCtrl.create({
                              cssClass: 'success-popup',
                              title: '<h4 class="title"> SUCCESS </h4>',
                              message: '<p>Set Damage RFID: ' + _ctn_rfid + ' successfully</p>',
                              buttons: [
                              {
                                  text: 'OK',
                                  role: 'ok',
                                  cssClass: 'success-btn',
                                }
                              ]
                            });
                            alert.present();
                        }
                         else {
                            let _alert = _that.alertCtrl.create({
                                cssClass: 'error-popup',
                                title: '<h4 class="title"> ERROR </h4>',
                                message: '<p>Failed to set damage RFID ' + _ctn_rfid + '!</p>',
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
                        }
                      },
                      err => {
                        loading.dismiss();
                      }
                    )
                  }
                },
            ]
        });
        _alert.present();
  }

  private checkStopScanning() {
    if(this.lengthRfid >= this.totalCarton) {
      this.isStopScanning = true;
    }
    else {
      this.isStopScanning = false;
    }
  }

  private handleScanCartonData(data) {
    let _that = this,
        _data = data.dataRes,
        listR = _data.rfid_list || [],
        skuInfo = _data.skuInfo || {};
    if(_data && _data.action == 'ScanCarton' && _data.checker == _that.userId) {
      if(!_that.isStopScanning && listR && listR.length && _that.currentSku.item_id && _that.currentSku.item_id == _data.item_id) {
        for(let rfid of listR) {
          let _curRFID = _that.utilityservice.getOneItemInArray(_that.listRfid, rfid, 'rfid');
          if(_that.utilityservice.isEmptyObject(_curRFID)) {
            _that.listRfid.unshift(rfid);
            _that.lengthRfid ++;
          }
          else {
            _curRFID.status = rfid.status;
          }
        }
      }
      else if(!_that.utilityservice.isEmptyObject(skuInfo)) {
        _that.cusId = skuInfo.cua_id;
        _that.currentSku = skuInfo.current;
        _that.listHistory = skuInfo.history;
        _that.totalCarton = _that.currentSku.asn_dtl_ctn_ttl;
        if(skuInfo.listScannedCarton && Array.isArray(skuInfo.listScannedCarton)) {
          _that.listRfid = skuInfo.listScannedCarton;
          _that.lengthRfid = (_that.listRfid && _that.listRfid.length) ? _that.listRfid.length : 0;
        }
      }
      if(_that.currentSku && _that.currentSku.item_id == _data.item_id && _data.error_code && _that.alertPresented) {
            _that.alertPresented = false;
            let _message = _data.message || '';
            let _alert = _that.alertCtrl.create({
                cssClass: 'error-popup',
                title: '<h4 class="title"> ERROR </h4>',
                message: '<p>' + _message + '</p>',
                buttons: [
                {
                    text: 'OK',
                    role: 'ok',
                    cssClass: 'error-btn',
                    handler: () => {
                        _that.alertPresented = true;
                        console.log('Cancel clicked');
                    }
                  }
                ]
            });
            _alert.present();
      }
    }
    else if(_data && _data.action == 'ErrorLimitCarton' && _data.checker == _that.userId && _that.exceedAlertPresented) {
      _that.exceedAlertPresented = false;
      let _message = _data.message || '';
      let _alert = _that.alertCtrl.create({
        cssClass: 'error-popup',
        title: '<h4 class="title"> ERROR </h4>',
        message: '<p>' + _message + '</p>',
        buttons: [
        {
            text: 'OK',
            role: 'ok',
            cssClass: 'error-btn',
            handler: () => {
              _that.exceedAlertPresented = true;
              console.log('Cancel clicked');
            }
          }
        ]
      });
      _alert.present();
    }
  }

  isAllComplete(array) {
    let _that = this,
        _result = false;
    if(array && Array.isArray(array)) {
      for(let i = 0; i < array.length; i++) {
          if(array[i].status == _that.constants.STATUS_SYMBOL.RECEIVED) {
            _result = true;
          }
          else {
            _result = false;
            break;
          }
      }
    }
    return _result;
  }

  refeshPage() {
    this.currentSku = {};
    this.listRfid = [];
    this.listHistory = [];
  }

    private doRefeshSkuVerification(callback) {
        let _that = this,
            whsId = _that.whsId ? _that.whsId : '',
            checkerId = _that.userId ? _that.userId : '';
        _that.apiservice.doRefeshSkuVerification(whsId, checkerId).subscribe(
          res => {
              if(res.data) {
                callback && callback(res);
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

    private changeStatusAsnDetail(sts, callback) {
        let _that = this,
            whsId = _that.whsId ? _that.whsId : '',
            checkerId = _that.userId ? _that.userId : '',
            body = {
                status: sts,
                asn_dtl_id: (_that.currentSku && _that.currentSku.asn_dtl_id) ? _that.currentSku.asn_dtl_id : '',
            }
        _that.apiservice.changeStatusAsnDetail(whsId, checkerId, _that.utilityservice.jsonToURLEncoded(body)).subscribe(
          res => {
              if(res.data) {
                callback && callback(res);
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
