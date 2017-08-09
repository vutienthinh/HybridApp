import { Component, Input, ViewChild, HostListener, ChangeDetectorRef  } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { ApiService } from '../../providers/api-service';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';
import { UtilityService } from '../../providers/utility-service';

declare let RFGun:any;
declare let cordova:any;

/*
  Generated class for the AssignCartonsPallet page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-assign-cartons-pallet',
  templateUrl: 'assign-cartons-pallet.html',
  providers: [Storage, ApiService,UtilityService]
})
export class AssignCartonsPalletPage {

  // @ViewChild('input') myInput ;

  private whsId: string = '';

  private odr_id: string = '';

  data: any = {  };

  _data: any = {};

  listCartonRFID: any[];

  tempListRFID: any = {};

  templistCartonRFID: any = [];

  rfIdRef: string = '';

  pieceNumber: string = '';

  totalPiece: number = 0;

  temprfIdRef: string = '';

  palletrfid: string = '';

  isFlagStatus: boolean = false;

  isReadonly: boolean = false;

  loopTimeout:any;

  isKeyDown:boolean;

  checkNum: number = 0;

  _checkNum: number = 0;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController,public utilityservice : UtilityService, public apiservice: ApiService, private sharedservice: SharedService, public navParams: NavParams, public loadingCtrl: LoadingController, platform:Platform, private ref: ChangeDetectorRef) {
    this.isKeyDown = false;
    platform.ready().then(function(){
    })
  }

  ionViewDidLoad() {
    console.log('Hello CartonPickingPage Page');
    this.whsId = this.sharedservice.getter('whsId');

    // setTimeout(() => {
    //   this.myInput.setFocus();
    // },1000);
    this.data['packs'] = [];
  }

  public scanBarcode() {
    let that = this;
    cordova.plugins.RFGun.scanBarcode((barcode) => {
      that._onChangeSetRFID(barcode);
    }, function(error){
      alert('Error')
    })
  }


  @HostListener('document:keydown', ['$event'])
  handleKeyDownEvent(event: KeyboardEvent) {
    if(event.keyCode == 120 && !this.isKeyDown){
      this.isKeyDown = true;
        this.scanBarcode();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUpEvent(event: KeyboardEvent) {
    if(event.keyCode == 120){
      this.isKeyDown = false;
        this.stopScanBarcode();
    }
  }

  public stopScanBarcode() {
    cordova.plugins.RFGun.stopScanBarcode(function(){
    }, function(error){
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

  private putToObject(ctn_rfid, type, sts) {
    let _that = this;
    _that.tempListRFID = {
      sts: sts,
      ctn_rfid: ctn_rfid,
      type: type
    };
    //  _that.rfIdRef = '';
     console.log(_that.tempListRFID);
  }

  _onChangeSetRFID(barcode) {
    console.log('change');
    let _that = this,
       _whsId = _that.whsId ? _that.whsId : '';
     _that.rfIdRef =  barcode ? barcode : '';
    let trimStringPallet = _that.rfIdRef.slice(0,3);
    if(trimStringPallet == 'LPN') {
           _that.palletrfid = _that.rfIdRef;
           _that.getCartonOfPallets(_that.rfIdRef);
      } else {
            if(_that.utilityservice.isEmptyObject(_that.tempListRFID)) {
              let alert = _that.alertCtrl.create({
                cssClass: 'error-popup',
                title: '<h4 class="title"> ERROR </h4>',
                message: '<p>Please scan pallet first!</p>',
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
              _that.data.pallet = _that.palletrfid;
              _that.data['packs'].push(_that.rfIdRef);

              if(_that.templistCartonRFID.length > 0) {
                for(let temp of _that.templistCartonRFID) {
                  if(temp.pack_hdr_num == _that.rfIdRef) {
                      _that.checkNum++;
                      break;
                  } else {
                    _that.checkNum = 0;
                  }
                }
              }

              if(_that.listCartonRFID.length > 0) {
                for(let tp of _that.listCartonRFID) {
                  if(tp.pack_hdr_num == _that.rfIdRef) {
                      _that._checkNum++;
                      break;
                  } else {
                    _that._checkNum = 0;
                  }
                }
              }

              if(_that.checkNum ||  _that._checkNum) {
                let alert = _that.alertCtrl.create({
                  cssClass: 'error-popup',
                  title: '<h4 class="title"> ERROR </h4>',
                  message: '<p>Duplicate carton: '+ _that.rfIdRef +'</p>',
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
                this.apiservice.assginedPackedCartonPallet(_whsId, _that.data).subscribe(
                    res => {
                      if(res.status) {
                        _that.templistCartonRFID.push({
                            pack_hdr_num: _that.rfIdRef,
                            sts: 'AD'
                        });
                      } else {
                        _that.templistCartonRFID.push({
                            pack_hdr_num: _that.rfIdRef,
                            sts: 'WR'
                        });
                      }
                      if(res.staging) {
                        let alert = _that.alertCtrl.create({
                          cssClass: 'success-popup',
                          title: '<h4 class="title"> SUCCESS </h4>',
                          message: '<p>Assigned completely</p>',
                          buttons: [
                          {
                              text: 'OK',
                              role: 'ok',
                              cssClass: 'success-btn',
                              handler: () => {
                                _that.data['packs'] = [];
                              }
                            }
                          ]
                        });
                        alert.present();
                      }
                      _that.rfIdRef = '';
                      _that.data['packs'] = [];
                    },
                    err => {},
                    () =>  {}
                );
              }

            }
      }

  }

  private getCartonOfPallets(palletNum) {
    let whsId = this.whsId ? this.whsId : '',
      loading = this.loadingCtrl.create();
    let _that = this;
    console.log(whsId);
    this.apiservice.getCartonOfPallet(whsId, palletNum).subscribe(
      res => {

            if(res.status) {
              _that.rfIdRef = '';
              _that.listCartonRFID = [];
              _that.listCartonRFID = res.data;
              _that.putToObject(palletNum, 'P', '');
              _that.templistCartonRFID = [];
            } else {
              _that.rfIdRef = '';
              _that.listCartonRFID = [];
              _that.putToObject(palletNum, 'P', '');
              _that.templistCartonRFID = [];
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
