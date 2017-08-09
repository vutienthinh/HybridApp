import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { ApiService } from '../../providers/api-service';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';
/*
  Generated class for the CartonPicking page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-carton-picking',
  templateUrl: 'carton-picking.html',
  providers: [Storage, ApiService]
})
export class CartonPickingPage {
	isPickFull: boolean = false;

  private whsId: string = '';

  private wrDtlId: string = '';

  locId: string = '';

  currentSku: any = {};

  listLocation: any[];

  listRFID: any[];

  isScanning: boolean = false;

  private myInterval: number;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public apiservice : ApiService,  private sharedservice : SharedService, public navParams: NavParams, public loadingCtrl: LoadingController) {}

  ionViewDidLoad() {
    console.log('Hello CartonPickingPage Page');
    this.whsId = this.navParams.get('whsid');
    this.wrDtlId = this.navParams.get('wrdtlid');
    this.locId = this.navParams.get('locid');
    //this.getRFIDInfo('12345');
    //this.getListLocationWarePick();
    this.listRFID = [
        {
            rfid: '000000000004',
            pieces: '20/3',
            status: 'Picked'
        },
        {
            rfid: '000000000005',
            pieces: '13/5',
            status: 'Picked'
        },
        {
            rfid: '000000000008',
            pieces: '20/12',
            status: 'Picked'
        }
    ];
    this.initState(this.listRFID);
  }
    ionViewWillLeave() {
        this.stopScanRFID(false);
    }

    doScanRFID() {
        let _that = this;
        _that.isScanning = true;
        _that.myInterval = setInterval(function() {
            _that.getRFIDScanCarton();
        }, 10000);
    }

    stopScanRFID(state) {
        this.isScanning = state;
        if(this.myInterval) {
            clearInterval(this.myInterval);
        }
    }

    removeRFID(array, rItem) {
        let index = array.indexOf(rItem);
        array.splice(index, 1);
    }

    doPickPullCarton(rfid) {
        let _that = this,
            _whsId = _that.whsId ? _that.whsId : '',
            _wrDtlId = _that.wrDtlId ? _that.wrDtlId : '',
            _ctnrNum = rfid.ctn_num ? rfid.ctn_num : '',
            _loading = _that.loadingCtrl.create();
        _loading.present();
        
        _that.apiservice.submitPickFullCarton(_whsId, _wrDtlId, _ctnrNum).subscribe(
            res => {
                _loading.dismiss();
                if(res.status) {
                    let alert = _that.alertCtrl.create({
                        cssClass: 'success-popup',
                        title: '<h4 class="title"> SUCCESS </h4>',
                        message: '<p>Update Successfully</p>',
                        buttons: [
                        {
                            text: 'OK',
                            role: 'ok',
                            cssClass: 'success-btn',
                          }
                        ]
                    });
                    alert.present();
                    //rfid.inprocess = false;
                    //_that.doScanRFID();
                }
            },
            err => {
                _loading.dismiss();
                let alert = _that.alertCtrl.create({
                    cssClass: 'error-popup',
                    title: '<h4 class="title"> ERROR </h4>',
                    message: '<p>' + err.message + '</p>',
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
                alert.present();
                rfid.inprocess = false;
                _that.doScanRFID();
            },
            () => {
                //loading.dismiss();
                console.log('Movie Search Complete');
            }
        );
    }

    getRFIDScanCarton() {
        let _whsId = this.whsId ? this.whsId : '';
        this.apiservice.getRFIDInfoWhenScanCarton(_whsId).subscribe(
            res => {
                this.stopScanRFID(true);
                if(res.status && res.data) {
                    let _rfid = res.data;
                    _rfid.inprocess = true;
                    _rfid.isPickFull = true;
                    this.initState(this.listRFID);
                    this.listRFID.push(_rfid);
                    /*this.listRFID.push({
                        rfid: '000000000004',
                        pieces: '20/3',
                        status: 'New',
                        inprocess: true,
                        isPickFull: true
                    })*/
                }
                else if(res.rfid){
                    this.initState(this.listRFID);
                    this.listRFID.push({
                        rfid: res.rfid,
                        status: 'Wrong SKU',
                        inprocess: true,
                        isPickFull: true,
                        isWrongSku: true
                    })
                }
            },
            err => {
                console.log(err);
            },
            () => {
              console.log('Complete');
            }
        );
    }

    getRFIDScanContainer() {
        let _whsId = this.whsId ? this.whsId : '';
        this.apiservice.getRFIDInfoWhenScanContainer(_whsId).subscribe(
            res => {
                if(res.status) {
                    
                }
            },
            err => {
                console.log(err);
            },
            () => {
              console.log('Complete');
            }
        );
    }

    private initState(array) {
        for(let item of array) {
            item.inprocess = false;
            item.isPickFull = false;
            item.isWrongSku = false;
        }
    }


  private getListLocationWarePick() {
        let whsId = this.whsId ? this.whsId : '',
        wrDtlId = this.wrDtlId ? this.wrDtlId : '',
        loading = this.loadingCtrl.create();
        loading.present();
        this.apiservice.getListLocationOfWarePick(whsId, wrDtlId).subscribe(
          res => {
              loading.dismiss();
              if(res.data) {
                this.currentSku = res.data.wv_dtl;
                this.listLocation = res.data.location;
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
