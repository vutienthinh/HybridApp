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
  Generated class for the AssignLocation page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-assign-location',
  templateUrl: 'assign-location.html',
  providers: [Storage, ApiService, UtilityService],
})
export class AssignLocationPage {
  // @ViewChild('input') myInput ;

  private whsId: string = '';

  isKeyDown: boolean;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public apiservice: ApiService, private sharedservice: SharedService, public utilityservice: UtilityService, public navParams: NavParams, public loadingCtrl: LoadingController, platform: Platform, private ref: ChangeDetectorRef) {
    this.isKeyDown = false;
    platform.ready().then(function() {
    })
  }

  ionViewDidLoad() {
    console.log('Hello AssignLocationPage Page');
    this.whsId = this.sharedservice.getter('whsId');
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

  _onChangeSetRFID(barcode) {

  }


}
