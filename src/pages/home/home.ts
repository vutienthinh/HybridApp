import { Component } from '@angular/core';
import { Events } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as io from "socket.io-client";
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { SocketService } from '../../providers/socket-service';
import { ApiService } from '../../providers/api-service';
import { UtilityService } from '../../providers/utility-service';
import { Constants } from '../../providers/constants';
import { LoginPage } from '../login/login';
import { SkuVerificationPage } from '../sku-verification/sku-verification';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Storage, ApiService, UtilityService, SocketService]
})
export class Home {
	showCusSuggestion: boolean;

	showConSuggestion: boolean;

	private storage: Storage;

	listAsns: any[];

    customerName: string = '';

    containerNum: string = '';

    assignTo: string = '';

    rfidReader1: string = '';

	rfidReader2: string = '';

    ctnrNums: any[];

    ctnrNumsBackUp: any[];

  	cusNames: any[];

  	cusNamesBackUp: any[];

  	listChecker: string[];

  	listRFIDReader1: any[];

  	listRFIDReader2: any[];

  	listRFIDReaderBackUp: any[];

  	pagingData: any = {};

  	socket: any = {};

  	private whsId: string = '';

  	private userId: string = '';

  	private alertPresented: boolean = false;

  	private startStopLoading: any = {};

	constructor(public navCtrl: NavController, storage: Storage, public loadingCtrl: LoadingController, public apiservice : ApiService,  private sharedservice : SharedService, public socketservice: SocketService, public utilityservice : UtilityService, public events: Events, public alertCtrl: AlertController, public constants: Constants) {
	    let _that = this;
	    this.storage = storage;
	    /*this.storage.get('token').then((val) => {
	      	this.authenData = val;
	      	if(!val) {
	      		navCtrl.setRoot(LoginPage);
	      	}
	      	console.log(val);
	    });*/
	    /*this.storage.remove('token').then(() => {
	      console.log('name has been removed');
	    });*/
	    /*let currentToken = window.localStorage.getItem('token');
	    if(!currentToken) {
      		navCtrl.setRoot(LoginPage);
      	}
      	// check Whs ID exist or not
      	this.whsId = this.sharedservice.getter('whsId');
      	console.log(this.whsId);
      	if(!this.whsId) {
      		let curWhsId = window.localStorage.getItem('whsId');
      		if(curWhsId) {
      			this.sharedservice.setter('whsId', curWhsId);
      			this.whsId = curWhsId;
      		}
      		else {
      			navCtrl.setRoot(LoginPage);
      		}
      	}*/
      	_that.whsId = _that.sharedservice.getter('whsId');
      	_that.userId = _that.sharedservice.getter('userId');
      	_that.resetStates();
		events.subscribe('menu:opened', (data) => {
		  	_that.resetStates();
		});
		events.subscribe('menu:closed', (data) => {
		  	_that.resetStates();
		});
		// data for paging
		_that.pagingData = {
            currentPage: 2,
            totalPage: 0,
            limit: 8,
	    };
	    _that.startStopLoading = this.loadingCtrl.create({
		    spinner: 'hide',
		    content: 'Receiving Stopped ...'
		});
	}

	ionViewDidLoad() {
		let _that = this;
    	_that.connect();
		_that.getListCustomer();
        _that.getListContainer();
        _that.getListChecker();
        _that.getListRFIDReader(res => {
        	this.listRFIDReader1 = res.data.slice();
	        this.listRFIDReader2 = res.data.slice();
        });
	}

	ionViewWillLeave() {
   		this.socketservice.close();
  	}

  	private connect() {
	    let _that = this;
	    	_that.socketservice.connect();
		    _that.socketservice.listen('updatedata', function(data) {
		        _that.handleUpdateAsnList(data);
		        console.log(data);
		    });
  	}

	private resetStates() {
		this.showCusSuggestion = false;
		this.showConSuggestion = false;
	}

	getCusNames(ev: any) {

	    // set val to the value of the searchbar
	    let val = ev.target.value;

	    // if the value is an empty string don't filter the items
	    if (val && val.trim() != '' && this.cusNamesBackUp && this.cusNamesBackUp.length) {
	    	let results = false;
		    this.cusNames = this.cusNamesBackUp.filter((item) => {
		        return (item['cus_name'].toLowerCase().indexOf(val.toLowerCase()) > -1);
		    })
		    if(this.cusNames.length) {
		      	this.showCusSuggestion = true;
		    }
		    else {
		    	this.showCusSuggestion = false;
		    }
	    }
	    else {
	    	this.showCusSuggestion = false;
	    }
	    this.showConSuggestion = false;
	}

	onCancelCusName(ev) {
	    // Show the results
	    this.showCusSuggestion = false;

	    // Reset the field
	    ev.target.value = '';
	}

	chooseCusName(cus) {
		console.log(cus);
		this.customerName = cus.cus_name;
		this.showCusSuggestion = false;
	}
	// for container number
	getCntrNums(ev: any) {

	    // set val to the value of the searchbar
	    let val = ev.target.value;

	    // if the value is an empty string don't filter the items
	    if (val && val.trim() != '' && this.ctnrNumsBackUp && this.ctnrNumsBackUp.length) {
	      this.ctnrNums = this.ctnrNumsBackUp.filter((item) => {
	        return (item['ctnr_num'].toLowerCase().indexOf(val.toLowerCase()) > -1);
	      });
	      if(this.ctnrNums.length) {
	      	this.showConSuggestion = true;
	      }
	      else {
	      	this.showConSuggestion = false;
	      }
	    }
	    else {
	    	this.showConSuggestion = false;
	    }
	    this.showCusSuggestion = false;
	}

	onCancelCntrNum(ev) {
	    // Show the results
	    this.showConSuggestion = false;

	    // Reset the field
	    ev.target.value = '';
	}

	chooseCntrNum(ctnr) {
		console.log(ctnr);
		this.containerNum = ctnr.ctnr_num;
		this.showConSuggestion = false;
	}

	gotoSkuVerification(asn, detail) {
		let _that = this;
		if(detail.asn_dtl_sts != _that.constants.STATUS_SYMBOL.RECEIVED) {
			if(!_that.rfidReader1 || !_that.rfidReader2 || !_that.assignTo) {
				let name = !_that.assignTo ? 'checker' : 'reader';
				let alert = this.alertCtrl.create({
					cssClass: 'error-popup',
				    title: '<h4 class="title"> ERROR </h4>',
				    message: '<p>Please choose a '+ name +'</p>',
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
			}
			else {
				_that.resetStateAllSku(_that.listAsns);
				detail['isSelected'] = true;
				_that.updateStatusOfAsnDetail(asn, detail, function(res) {
					let cusId = asn.cus_id ? asn.cus_id : '',
						skuNum = detail.sku ? detail.sku : '',
		        		asnDtlId = detail.asn_dtl_id ? detail.asn_dtl_id : '';
		        	
					_that.sharedservice.setter('cusId', cusId);
					_that.sharedservice.setter('skuNum', skuNum);
					_that.sharedservice.setter('asnDtlId', asnDtlId);
					_that.getListRFIDReader(function(res) {
			        	_that.listRFIDReader1 = res.data.slice();
				        _that.listRFIDReader2 = res.data.slice();
			        });
				});
				/*let	whsId = this.whsId ? this.whsId : '',
		        	cusId = asn.cus_id ? asn.cus_id : '',
					asnId = asn.asn_hdr_id ? asn.asn_hdr_id : '',
		        	ctnrId = asn.ctnr_id ? asn.ctnr_id : '',
		        	asnDtlId = detail.asn_dtl_id ? detail.asn_dtl_id : '';

				this.sharedservice.setter('cusId', cusId);
				this.sharedservice.setter('skuNum', detail.sku);
				this.sharedservice.setter('asnDtlId', asnDtlId);
		        this.navCtrl.push(SkuVerificationPage, {
				  	'whsid': whsId,
				  	'cusid': cusId,
				  	'asnid': asnId,
				  	'ctnrid': ctnrId,
				  	'asndtlid': asnDtlId
				});*/
			}
		}
	}

	getAsns() {
		// show loading
    	let _that = this;
		let cusObj = _that.cusNamesBackUp.filter((item) => {
		        return (item['cus_name'].toLowerCase() == _that.customerName.toLowerCase());
		    })
		let ctnrObj = _that.ctnrNumsBackUp.filter((item) => {
	        	return (item['ctnr_num'].toLowerCase() == _that.containerNum.toLowerCase());
	    	});
        let	whsId = _that.whsId ? _that.whsId : '',
        	cusId = cusObj[0] && cusObj[0]['cus_id'] ? cusObj[0]['cus_id'] : '',
        	ctnrId = ctnrObj[0] && ctnrObj[0]['ctnr_id'] ? ctnrObj[0]['ctnr_id'] : '',
			currentPage = 1,
        	limit = _that.pagingData.limit;
		let loading = _that.loadingCtrl.create();
		loading.present();
		_that.apiservice.getAllASNDetail(whsId, cusId, ctnrId, limit, currentPage).subscribe(
	        _res => {
	        	loading.dismiss();
	        	let res = _res || <any>{};
	            if(res.data) {
	            	_that.listAsns = res.data;
	            	_that.pagingData.totalPage = (res.meta && res.meta.pagination) ? res.meta.pagination.total_pages : 0;
	            	_that.getListRFIDReader(function(response) {
	            		let _listR = response.data;
	            		if(response && _listR && Array.isArray(_listR) && _listR.length) {
				        	_that.listRFIDReader1 = _listR.slice();
					        _that.listRFIDReader2 = _listR.slice();
	            		}
	            		else {
	            			let alert = _that.alertCtrl.create({
			    				cssClass: 'error-popup',
							    title: '<h4 class="title"> ERROR </h4>',
							    message: '<p>No available reader</p>',
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
	            		}
			        });
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

	completeSkuOfAsn(asn, detail) {
        let _that = this,
            _whsId = _that.whsId ? _that.whsId : '',
            _cusId = asn.cus_id ? asn.cus_id : '',
            _asnDtlId = detail.asn_dtl_id ? detail.asn_dtl_id : '',
            _loading = _that.loadingCtrl.create();
        _loading.present();
		_that.apiservice.completeSkuOfAsn(_whsId, _cusId, _asnDtlId).subscribe(
	        _res => {
	        	_loading.dismiss();
	        	let res = _res || <any>{};
	            if(res.status) {
	            	let alert = _that.alertCtrl.create({
        				cssClass: 'success-popup',
					    title: '<h4 class="title"> SUCCESS </h4>',
					    message: '<p>Complete Sku Successfully</p>',
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
	            }
	        },
	        err => {
	        	_loading.dismiss();
	        },
	        () => {
	        	_loading.dismiss();
	        }
	    );
    }

    handleChangeSelect(event, reader, list, isreader1) {
    	let _that = this,
    		//_list = isreader1 ? _that.listRFIDReader1 : _that.listRFIDReader2;
    	_list = _that.listRFIDReaderBackUp.slice();
    	for(let item of _list) {
        	if(item.device_id == parseInt(reader)) {
        		_list.splice(_list.indexOf(item), 1);
        	}
        }
        if(isreader1) {
        	_that.listRFIDReader2 = _list.slice();
        }
        else {
        	_that.listRFIDReader1 = _list.slice();
        }
        /*for(let item of list) {
        	if(item.device_id == parseInt(reader)) {
        		item.isExistInOtherlist = true;
        		//list.splice(list.indexOf(item), 1);
        	}
        	else {
        		item.isExistInOtherlist = false;
        	}
        }*/
        /*_that.getListRFIDReader(function(res) {
        	if(reader == _that.rfidReader1) {
	        	_that.listRFIDReader2 = res.data;
        	}
        	else if(reader == _that.rfidReader2) {
        		_that.listRFIDReader1 = res.data;
        	}
        });*/
    }

    checkCheckerAssign(checker_id) {
    	let _that = this,
    		whsId = _that.whsId ? _that.whsId : '',
    		body = {
                rfid_reader_1: _that.rfidReader1 || '',
                rfid_reader_2: _that.rfidReader2 || '',
            }
        _that.apiservice.checkCheckerIsAssigned(whsId, checker_id, _that.utilityservice.jsonToURLEncoded(body)).subscribe(
	        res => {
	            if(res && res.status !== undefined && !res.status) {
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
				                console.log('Cancel clicked');
				            }
				        }
			          ]
			        });
			        alert.present();
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

    private updateStatusOfAsnDetail(asn, detail, callback) {
        let _that = this,
            _whsId = _that.whsId ? _that.whsId : '',
            _params = {
                ctnr_id: asn.ctnr_id ? asn.ctnr_id : '',
                cus_id: asn.cus_id ? asn.cus_id : '',
                asn_id: asn.asn_hdr_id ? asn.asn_hdr_id : '',
                status: asn.asn_sts_name ? this.utilityservice.convertStatus(asn.asn_sts_name) : '',
                asn_hdr_num: asn.asn_hdr_num ? asn.asn_hdr_num : '',
                asn_dtl_id: detail.asn_dtl_id ? detail.asn_dtl_id : '',
                item_id: detail.item_id ? detail.item_id : '',
                checker_id: _that.assignTo ? _that.assignTo : '',
                rfid_reader_1: _that.rfidReader1 ? _that.rfidReader1 : '',
                rfid_reader_2: _that.rfidReader2 ? _that.rfidReader2 : '',
                expected_cartons: detail.asn_dtl_ctn_ttl ? detail.asn_dtl_ctn_ttl : '',
                sku: detail.sku ? detail.sku : '',
            };

        _that.apiservice.updateStatusOfAsnDetail(_whsId, _that.utilityservice.jsonToURLEncoded(_params)).subscribe(
            _res => {
            	let res = _res || <any>{};
                if(res.status) {
                	callback && callback(res);
                   //_that.getListGate();
                }
                else {
			        let alert = _that.alertCtrl.create({
        				cssClass: 'success-popup',
					    title: '<h4 class="title"> NOTIFICATION </h4>',
					    message: '<p>' + res.message + '</p>',
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
                }
            },
            err => {
	            
            },
            () => {
            	
            }
        );
    }

	private getListCustomer() {
        let whsId = this.whsId ? this.whsId : '';
        this.apiservice.getListCustomer(whsId).subscribe(
	        res => {
	            if(res.data) {
	            	this.cusNames = res.data;
	            	this.cusNamesBackUp = res.data;
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

    private getListContainer() {
        let whsId = this.whsId ? this.whsId : '';
        this.apiservice.getListContainer(whsId).subscribe(
	        res => {
	            if(res.data) {
	            	this.ctnrNums = res.data;
	            	this.ctnrNumsBackUp = res.data;
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

    private getListChecker() {
        let whsId = this.whsId ? this.whsId : '';
        this.apiservice.getListChecker(whsId).subscribe(
	        res => {
	            if(res.data) {
	            	this.listChecker = res.data;
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

    private getListRFIDReader(callback) {
        let _that = this,
        	whsId = _that.whsId ? _that.whsId : '';
        _that.apiservice.getListRFIDReader(whsId).subscribe(
	        res => {
	            if(res.data) {
	            	_that.listRFIDReaderBackUp = res.data.slice();
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

    private isAllReceived(array) {
	    let _that = this,
	        _result = false;
	    for(let i = 0; i < array.length; i++) {
	        if(array[i].asn_dtl_sts == _that.constants.STATUS_SYMBOL.RECEIVED) {
	          _result = true;
	        }
	        else {
	          _result = false;
	          break;
	        }
	    }
	    return _result;
	}

    private handleUpdateAsnList(data) {
		let _that = this,
			_data = data.dataRes,
			changedStsList = _data.dataRes || [];
    	
    	if(_data.action && _data.action == 'AsnList'){
    		//if( _data.error_code && !_that.alertPresented) {
    		if( _data.error_code && _data.userClerk && _data.userClerk == _that.userId) {
		            //_that.alertPresented = true;
		            if(_data.error_code == 100) {
						_that.startStopLoading.present();
		            }
		            else {
		            	_that.startStopLoading.dismiss();
		            }
		    }
		    else {
	    		for(let item of changedStsList) {
	    			if(_that.listAsns && Array.isArray(_that.listAsns)) {
		    			for(let asns of _that.listAsns) {
		    				if(asns.asn_hdr_id == item.asn_id) {
		    					asns.asn_sts = item.status;
						        asns.asn_sts_name = _that.utilityservice.displayStatus(item.status);
						        for(let detail of item.asn_detail) {
					    			let _curSku = _that.utilityservice.getOneItemInArray(asns.items, detail, 'asn_dtl_id');
							        if(!_that.utilityservice.isEmptyObject(_curSku)) {
							            _curSku.asn_dtl_sts = detail.status;
							            _curSku.asn_sts_name = _that.utilityservice.displayStatus(detail.status);
							        }
						        }
		    				}
				    		//check all received for updating Asn
				    		/*if(_that.isAllReceived(asns.items)) {
				    			asns.asn_sts = _that.constants.STATUS_SYMBOL.RECEIVED;
				    			asns.asn_sts_name = _that.constants.STATUS.RECEIVED;
				    		}*/
		    			}
	    			}
	    		}
		    }
    	}
    }

    private resetStateAllSku(array) {
    	let _that = this;
    	for(let asn of array) {
    		_that.utilityservice.updateAllItemOfArray(asn.items, 'isSelected', false);
    	}
    }

    toggleDisplay(asn) {
    	let array = this.listAsns;
    	for(let i = 0; i < array.length; i++) {
    		if(array[i].asn_hdr_id == asn.asn_hdr_id && array[i].ctnr_id == asn.ctnr_id) {
            	array[i].inJectTableShow = !array[i].inJectTableShow;
    		}
    		else {
    			array[i].inJectTableShow = false;
    		}
        }
    }

    doInfinite(infiniteScroll) {
    	let _that = this;
	    setTimeout(() => {
	      	let cusObj = _that.cusNamesBackUp.filter((item) => {
		        return (item['cus_name'].toLowerCase() == _that.customerName.toLowerCase());
		    })
			let ctnrObj = _that.ctnrNumsBackUp.filter((item) => {
		        	return (item['ctnr_num'].toLowerCase() == _that.containerNum.toLowerCase());
		    	});
	        let	whsId = _that.whsId ? _that.whsId : '',
	        	cusId = cusObj[0] && cusObj[0]['cus_id'] ? cusObj[0]['cus_id'] : '',
	        	ctnrId = ctnrObj[0] && ctnrObj[0]['ctnr_id'] ? ctnrObj[0]['ctnr_id'] : '',
				currentPage = _that.pagingData.currentPage,
	        	limit = _that.pagingData.limit;
			_that.apiservice.getAllASNDetail(whsId, cusId, ctnrId, limit, currentPage).subscribe(
		        _res => {
		        	let res = _res || <any>{};
		            if(res.data) {
		            	_that.pagingData.currentPage++;
		            	_that.listAsns = _that.listAsns.concat(res.data);
		            }
	      			infiniteScroll.complete();
		        },
		        err => {
		            console.log(err);
		        },
		        () => {
		        	// console.log('Movie Search Complete');
		        }
		    );
	    }, 1000)
	}

}
