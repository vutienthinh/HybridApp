import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SharedService } from '../../providers/shared-service';
import { UtilityService } from '../../providers/utility-service';
import { AlertController } from 'ionic-angular';

/*
  Generated class for the PalletsReceiving page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pallets-receiving',
  templateUrl: 'pallets-receiving.html',
  providers: [Storage, ApiService, UtilityService]
})
export class PalletsReceivingPage {
	listGate: any[];
	listPosition: any[];
	currentGate: string = '';
	totalRow: number = 0;
    receivingAt: string = '';
	private cusId: string = '';
	private whsId: string = '';
	private skuNum: string = '';
    private asnDtlId: string = '';

	constructor(public navCtrl: NavController, public apiservice : ApiService, private sharedservice : SharedService, public utilityservice : UtilityService, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {}

	ionViewDidLoad() {
	    let _that = this;
	    _that.listGate = [];
	    _that.listPosition = [];
	    //_that.activeIndex = 0;
	    _that.whsId = _that.sharedservice.getter('whsId');
	    _that.cusId = _that.sharedservice.getter('cusId');
	    _that.skuNum = _that.sharedservice.getter('skuNum');
        _that.asnDtlId = _that.sharedservice.getter('asnDtlId');
        _that.getListGate();
	}

	private getListGate() {
        let whsId = this.whsId ? this.whsId : '';
        this.apiservice.getGateAtReceiving(whsId).subscribe(
            res => {
                if(res.data) {
                    this.listGate = res.data;
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

    private setupPosition(array, field, status) {
        for(let i = 0; i < array.length; i++) {
            if(array[i][field]){
                // check for clickable
                if(array[i][field] == status) {
                    array[i].clickable = false;
                }
                else {
                    array[i].clickable = true;
                }
                // backup old status
                array[i].old_status = array[i][field];                 
            }
        }
    }

    private getAllLocation(loc_id, callback) {
        let whsId = this.whsId ? this.whsId : '',
            loading = this.loadingCtrl.create();
            loading.present();

        this.apiservice.getLocationAtReceiving(whsId, loc_id).subscribe(
            res => {
                loading.dismiss();
                if(res.data) {
                    this.listPosition = res.data;
                    this.currentGate = this.listPosition[0].name;
                    for(let position of this.listPosition) {
                        position.display_status = this.utilityservice.displayStatus(position.last_status);
                    }
                    this.totalRow = Math.floor(this.listPosition.length / 5) + 1;
                    this.setupPosition(this.listPosition, 'last_status', 'Reserved');
                    callback && callback(res);
                }
            },
            err => {
                loading.dismiss();
                console.log(err);
            },
            () => {
                loading.dismiss();
                console.log('Movie Search Complete');
            }
        );
    }

    private getCorrectStatus(pos) {
        let _p = Object.assign({}, pos);
        if(_p.isEdited) {
            switch (_p.last_status) {
              case 'ET':
                _p.last_status = 'RS';
                //_p.status_number = 2;
                break;
              case 'RS':
                _p.last_status = 'FL';
                //_p.status_number = 4;
                break;
              case 'FL':
                _p.last_status = 'ET';
                //_p.status_number = 1;
                break;
            }
        }
        else {
            switch (_p.last_status) {
              case 'ET':
                _p.last_status = 'RS';
                //_p.status_number = 2;
                _p.isEdited = true;
                break;
              case 'RS':
                _p.last_status = 'FL';
                //_p.status_number = 4;
                _p.isEdited = true;
                break;
            }
        }
        return _p;
    }

    private jsonToURLEncoded(jsonString){
	    return Object.keys(jsonString).map(function(key){
	      return encodeURIComponent(key) + '=' + encodeURIComponent(jsonString[key]);
	    }).join('&');
	}

    handleChangeSelect(event, gate) {
        let _that = this,
            locId = gate;
        _that.getAllLocation(locId, function(res) {
            if(res && res.data) {
                _that.setupPosition(_that.listPosition, 'last_status', 'FL');
            }
        });
    }

    updateStatus = function(pos) {
        if(pos.clickable) {
        	let confirm = this.alertCtrl.create({
		      title: 'Confirmation',
		      message: 'Are you sure to choose this?',
		      buttons: [
		        {
		          text: 'OK',
		          cssClass: 'button-cancel',
		          handler: () => {
		            this.handleUpdate(pos);
		          }
		        },
		        {
		          text: 'Cancel',
		          role: 'cancel',
		          handler: () => {
		            
		          }
		        }
		      ]
		    });
		    confirm.present();
        }
    }

    private handleUpdate(pos) {
        let loading = this.loadingCtrl.create();
		loading.present();

    	let _that = this,
        	_position = _that.getCorrectStatus(pos),
        	currentPos = {
                position_id: _position.position_id,
                ref_hex: _position.ref_hex,
                last_status: _position.last_status,
                sku_num: _that.skuNum ? _that.skuNum : '',
                asn_dtl_id: _that.asnDtlId ? _that.asnDtlId : '',
            };
		
        _that.apiservice.submitLocationReveiving(_that.whsId, _that.cusId, _that.jsonToURLEncoded(currentPos)).subscribe(
	        res => {
	        	loading.dismiss();
	            if(res.status) {
	            	pos.last_status = _position.last_status;
	            	pos.display_status = _that.utilityservice.displayStatus(_position.last_status);
                    _that.setupPosition(_that.listPosition, 'last_status', 'FL');
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
	            }
	        },
	        err => {
	        	loading.dismiss();
	            let alert = this.alertCtrl.create({
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
	        },
	        () => {
	        	//loading.dismiss();
	        	console.log('Movie Search Complete');
	        }
   		);
    }

}
