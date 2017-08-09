import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import { SharedService } from '../../providers/shared-service';
import { UtilityService } from '../../providers/utility-service';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
/*
  Generated class for the PalletsPutaway page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pallets-putaway',
  templateUrl: 'pallets-putaway.html',
  providers: [Storage, ApiService, UtilityService]
})
export class PalletsPutawayPage {
	listLocation: any[];
	listPosition: any[];
	activeIndex: number = 0;
	totalRow: number = 0;
	private cusId: string = '';
	private whsId: string = '';

	constructor(public navCtrl: NavController, public apiservice : ApiService, private sharedservice : SharedService, public utilityservice : UtilityService, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {}

	ionViewDidLoad() {
		console.log('Hello pallets-putaway');
		let _that = this;
	    _that.listLocation = [];
	    _that.listPosition = [];
	    _that.activeIndex = 0;
	    _that.whsId = _that.sharedservice.getter('whsId');
	    _that.cusId = _that.sharedservice.getter('cusId');
	    _that.getLocations( function(res) {
	        _that.listLocation = res.data;
	        _that.handleLocation(_that.listLocation, _that.activeIndex);
	    });
	}

  	private initState(array) {
        for(let i = 0; i < array.length; i++) {
            array[i].selected = false;
        }
    }

    private handleLocation(array, aindex) {
    	let _that = this;
        _that.initState(array);
        array[aindex].selected = true;
        _that.getPositionOfLocation(array[aindex].code, function(){
            _that.setupPosition(_that.listPosition, 'last_status', 'ET');
        });
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

    /*private setIntervalUpdate(time) {
        return $interval(function() {
            this.handleLocation($scope.listLocation, $scope.activeIndex);
        }, time);
    }*/

    getLocations(callback) {
        let loc_type = 'paw';

        this.apiservice.getListLocation(loc_type).subscribe(
	        res => {
	            if(res.data) {
	            	callback && callback(res);
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

    getPositionOfLocation(loc_id, callback) {
	    let loc_type = 'paw',
	    	loading = this.loadingCtrl.create();
			loading.present();

		this.apiservice.getPositionByLocation(loc_type, loc_id).subscribe(
	        res => {
	        	loading.dismiss();
	            if(res.data) {
	            	this.listPosition = res.data;
	            	for(let position of this.listPosition) {
	            		position.display_status = this.utilityservice.displayStatus(position.last_status);
	            	}
	                this.totalRow = Math.floor(this.listPosition.length / 4) + 1;
	                callback && callback();
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

	setActive(loc) {
		let _that = this;
        _that.getPositionOfLocation(loc.code, function(){
            _that.initState(_that.listLocation);
            loc.selected = true;
            _that.activeIndex = _that.listLocation.indexOf(loc);
            _that.setupPosition(_that.listPosition, 'last_status', 'ET');
        });
    }

    private getCorrectStatus(pos) {
        let _p = Object.assign({}, pos);
        switch (_p.last_status) {
          case 'RS':
            _p.last_status = 'PK';
            //_p.status_number = 3;
            break;
          case 'PK':
            _p.last_status = 'RS';
            //_p.status_number = 2;
            break;
        }
        return _p;
    }

    private jsonToURLEncoded(jsonString){
	    return Object.keys(jsonString).map(function(key){
	      return encodeURIComponent(key) + '=' + encodeURIComponent(jsonString[key]);
	    }).join('&');
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
                'pallet-rfid': _position.rfid,
                'loc-rfid': '',
                'ref_hex': _position.ref_hex,
                'last_status': _position.last_status
            };
		
        _that.apiservice.submitLocationPutaway(_that.whsId, _that.cusId, _that.jsonToURLEncoded(currentPos)).subscribe(
	        res => {
	        	loading.dismiss();
	            //this.authendata = data.results;
	            if(res.status) {
	            	pos.last_status = _position.last_status;
	            	pos.display_status = _that.utilityservice.displayStatus(_position.last_status);
	            	this.sharedservice.setter('current_position', currentPos);
                    //$rootScope.position_info = currentPos;
                    _that.setupPosition(_that.listPosition, 'last_status', 'ET');
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
