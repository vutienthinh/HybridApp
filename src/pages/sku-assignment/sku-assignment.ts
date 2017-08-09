import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavParams } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { AlertController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';

/*
  Generated class for the SkuAssignment page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sku-assignment',
  templateUrl: 'sku-assignment.html',
  providers: [Storage, ApiService]
})
export class SkuAssignmentPage {
	currentAsn: any[];
	asn_num : string;
	cus_name : string;
	ctnr_num : string;
	private whsId : string;
	private cusId : string;
	private asnId : string;
	private ctnrId : string;

  constructor(public navCtrl: NavController,public loadingCtrl: LoadingController, public alertCtrl: AlertController, public apiservice : ApiService, public navParams: NavParams, private sharedservice : SharedService) {
  	this.whsId = navParams.get('whsid');
    this.cusId = navParams.get('cusid');
    this.asnId = navParams.get('asnid');
    this.ctnrId = navParams.get('ctnrid');
    this.sharedservice.setter('cusId', this.cusId);
	console.log(this.whsId);
  }

  ionViewDidLoad() {
    console.log('Hello SkuAssignmentPage Page');
  }

  /*ngOnInit() {
    // subscribe to router event
    this.activatedRoute.params
    	.subscribe(params => {
	        this.whsId = params['whsid'];
	       	this.cusId = params['cusId'];
	       	this.asnId = params['asnid'];
	       	this.ctnrId = params['cntrid'];
      	});
  }*/

    isAllComplete() {
        var array = this.currentAsn,
            result = true;
        if(this.currentAsn){
            for(var i = 0; i < array.length; i++) {
                if(!array[i].asn_dtl_status || array[i].asn_dtl_status != 'RE') {
                    result = false;
                    break;
                }
            }
            return result;
        }
        else {
            return false;
        }
    }

}
