import { Component, Input, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { ApiService } from '../../providers/api-service';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';
import { Reverse } from '../../pipes/reverse';
import { OrderListPage } from '../order-list/order-list';
import { UtilityService } from '../../providers/utility-service';

declare let RFGun: any;
declare let cordova: any;

/*
  Generated class for the AssignCartonsOrder page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-assign-cartons-order',
  templateUrl: 'assign-cartons-order.html',
  providers: [Storage, ApiService, UtilityService],
  // pipes: [Reverse],
})

export class AssignCartonsOrderPage {
  // @ViewChild('input') myInput ;

  private whsId: string = '';
  private odr_id: string = '';

  listResult: string[];
  loopTimeout: any;
  isKeyDown: boolean;

  data: any = {

  };

  _data: any = {};

  currentSku: any = {};

  listRFID: any[];

  tempListRFID: any[] = [];


  rfIdRef: string = '';

  pieceNumber: string = '';

  assignedCarton: number = 0;

  temprfIdRef: string = '';

  isFlagStatus: boolean = false;

  isReadonly: boolean = false;

  checkNum: number = 0;

  _checkNum: number = 0;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public apiservice: ApiService, private sharedservice: SharedService, public utilityservice: UtilityService, public navParams: NavParams, public loadingCtrl: LoadingController, platform: Platform, private ref: ChangeDetectorRef) {
    this.listResult = [];
    this.isKeyDown = false;
    platform.ready().then(function() {

    })
  }

  ionViewDidLoad() {
    console.log('Hello CartonPickingPage Page');
    this.whsId = this.navParams.get('whsid');
    this.odr_id = this.navParams.get('odr_id');
    this.tempListRFID = [];

    this.getDetailOrderCartons();
    this.data['ctns-rfid'] = [];
  }


  public scanRFID() {
    let that = this,
      loading = this.loadingCtrl.create({
        content: 'Reading rfid...'
      });
    loading.present();
    cordova.plugins.RFGun.scanRFID((rfid) => {
      that.onChangeSetRFID(rfid);
      loading.dismiss();
    }, function(error) {
      loading.dismiss();
    })
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDownEvent(event: KeyboardEvent) {
    if (event.keyCode == 120 && !this.isKeyDown) {
      this.isKeyDown = true;
      this.scanRFID();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUpEvent(event: KeyboardEvent) {
    if (event.keyCode == 120) {
      this.isKeyDown = false;
      this.stopScanRFID();
    }
  }

  public stopScanRFID() {
    clearTimeout(this.loopTimeout);
    cordova.plugins.RFGun.stopScanRFID(function() {
    }, function(error) {
      alert('Stop Not OK')
    });
  }


  removeRFID(array, rItem) {
    let _that = this,
      index = array.indexOf(rItem);
    array.splice(index, 1);
    _that.isFlagStatus = false;
    _that.isReadonly = false;
    _that.rfIdRef = '';
    // _that.onChangeSetRFID();
  }

  private putToArray(sts, ctn_rfid) {
    let _that = this;
    _that.tempListRFID.push({
      sts: sts,
      ctn_rfid: ctn_rfid
    });
    _that.rfIdRef = '';
  }

  onChangeSetRFID(rfIdRef) {
    let _that = this,
      _whsId = _that.whsId ? _that.whsId : '',
      _odrId = _that.odr_id ? _that.odr_id : '';
    _that.rfIdRef = rfIdRef ? rfIdRef : '';

    if (_that.listRFID.length > 0) {
      for (let temp of _that.listRFID) {
        if (temp.ctn_rfid == _that.rfIdRef) {
          _that.checkNum++;
          break;
        } else {
          _that.checkNum = 0;
        }
      }
    }

    if (_that.tempListRFID.length > 0) {
      for (let tp of _that.tempListRFID) {
        if (tp.ctn_rfid == _that.rfIdRef) {
          _that._checkNum++;
          break;
        } else {
          _that._checkNum = 0;
        }
      }
    }

    if (_that.checkNum || _that._checkNum) {
      let alert = _that.alertCtrl.create({
        cssClass: 'error-popup',
        title: '<h4 class="title"> ERROR </h4>',
        message: '<p>Duplicate carton</p>',
        buttons: [
          {
            text: 'OK',
            role: 'ok',
            cssClass: 'error-btn',
            handler: () => {
              _that.rfIdRef = '';
            }
          }
        ]
      });
      alert.present();
    } else {
      _that.data['ctns-rfid'].push(_that.rfIdRef);
      _that.apiservice.checkRFIDstatusOrderDetail(_whsId, _odrId, _that.data).subscribe(
        res => {
          console.log(res);
          if (res.status) {
            _that.putToArray("AD", _that.rfIdRef);
          } else {
            _that.putToArray("WR", _that.rfIdRef);
          }
          _that.checkFullCarton();
          _that.data['ctns-rfid'] = [];
          _that.rfIdRef = '';
        },
        err => {
          console.log(err);
        },
        () => {
          console.log('error');
        }
      );
    }

  }
  private checkFullCarton() {
    let _that = this;
    _that.assignedCarton = this.currentSku.assigned_ctns;
    for (let temp of _that.tempListRFID) {
      if (temp.sts == 'AD') {
        _that.assignedCarton++;
      }
    }

    if (_that.assignedCarton > _that.currentSku.total_ctns) {
      _that.isReadonly = true;
      let alert = _that.alertCtrl.create({
        cssClass: 'success-popup',
        title: '<h4 class="title"> SUCCESS </h4>',
        message: '<p>Full Carton Assignment</p>',
        buttons: [
          {
            text: 'OK',
            role: 'ok',
            cssClass: 'success-btn',
            handler: () => {
              _that.navCtrl.setRoot(OrderListPage);
            }
          }
        ]
      });
      alert.present();
    }
  }

  private getDetailOrderCartons() {
    let whsId = this.whsId ? this.whsId : '',
      odr_id = this.odr_id ? this.odr_id : '',
      loading = this.loadingCtrl.create();
    loading.present();
    let _that = this;

    this.apiservice.getDetailAssignOrder(whsId, odr_id).subscribe(
      res => {
        console.log(res);
        loading.dismiss();
        if (res.status) {
          if(res.data.cartons.length > 0) {
            this.listRFID = res.data.cartons;
          } else {
              this.listRFID = [];
          }
          this.currentSku = res.data;
          _that.assignedCarton = this.currentSku.assigned_ctns;
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

}
