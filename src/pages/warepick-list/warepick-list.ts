import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { ApiService } from '../../providers/api-service';
import { Storage } from '@ionic/storage';
import { SkuLocationPage } from '../sku-location/sku-location';
import { UtilityService } from '../../providers/utility-service';
/*
  Generated class for the WarepickList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-warepick-list',
  templateUrl: 'warepick-list.html',
  providers: [Storage, ApiService, UtilityService]
})
export class WarepickListPage {
	listWarePick: any[];

  data: any = {};

  private whsId: string = '';

  constructor(public navCtrl: NavController, public apiservice : ApiService,  private sharedservice : SharedService, public utilityservice : UtilityService) {}

  ionViewDidLoad() {
    console.log('Hello WarepickListPage Page');
    this.whsId = this.sharedservice.getter('whsId');
    this.getListWarePick();
  }
    private getListWarePick() {
        let whsId = this.whsId ? this.whsId : '';
        this.apiservice.getListWarePick(whsId).subscribe(
          res => {
              if(res.data) {
                this.listWarePick = res.data;
                for(let warepick of this.listWarePick) {
                  warepick.created_at_format = new Date(parseInt(warepick.created_at.date));
                }
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

  	toggleDisplay(warepick) {
    	let array = this.listWarePick;
    	for(let i = 0; i < array.length; i++) {
    		if(array[i].wv_id == warepick.wv_id) {
            	array[i].inJectTableShow = !array[i].inJectTableShow;
    		}
    		else {
    			array[i].inJectTableShow = false;
    		}
        }
    }

    gotoSkuLocationPage(wr_dtl_id, wv_id, item_id) {
        let _that = this,
            whsId = this.whsId ? this.whsId : '',
            wrDtlId = wr_dtl_id ? wr_dtl_id : '',
            wvId = wv_id ? wv_id : '';
            _that.data = {
              wave_id: wvId,
              status: 'PK',
              wave_detail_id: wrDtlId,
              item_id: item_id
            };
        _that.apiservice.updateStatusOfWarePick(whsId, _that.data ).subscribe(     );
            this.navCtrl.push(SkuLocationPage, {
                'whsid': whsId,
                'wrdtlid': wrDtlId,
                'wvid': wvId
            });
    }

}
