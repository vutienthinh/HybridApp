import { Component } from '@angular/core';
import { Events } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as io from "socket.io-client";
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { SharedService } from '../../providers/shared-service';
import { ApiService } from '../../providers/api-service';
import { UtilityService } from '../../providers/utility-service';
import { LoginPage } from '../login/login';
import { SkuVerificationPage } from '../sku-verification/sku-verification';
import { AssignCartonsOrderPage } from '../assign-cartons-order/assign-cartons-order';

/*
  Generated class for the OrderList page.l

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-order-list',

  templateUrl: 'order-list.html',
  providers: [Storage, ApiService, UtilityService]
})
export class OrderListPage {

  private storage: Storage;

  listOrder: any[];
  private whsId: string = '';
  pagingData: any = {};



  constructor(public navCtrl: NavController, storage: Storage, public loadingCtrl: LoadingController, public apiservice : ApiService,  private sharedservice : SharedService, public utilityservice : UtilityService, public events: Events, public alertCtrl: AlertController) {
    let _that = this;
    this.storage = storage;

    let currentToken = window.localStorage.getItem('token');
    if(!currentToken) {
        navCtrl.setRoot(LoginPage);
      }
      // check Whs ID exist or not
      this.whsId = this.sharedservice.getter('whsId');

      if(!this.whsId) {
        let curWhsId = window.localStorage.getItem('whsId');
        if(curWhsId) {
          this.sharedservice.setter('whsId', curWhsId);
          this.whsId = curWhsId;
        }
        else {
          navCtrl.setRoot(LoginPage);
        }
      }

      _that.pagingData = {
              currentPage: 2,
              totalPage: 0
        };

  }

  ionViewDidLoad() {
    console.log('Hello OrderListPage Page');
    this.getListOrder();
  }

  private getListOrder() {

        let _that = this,
            whsId = this.whsId ? this.whsId : '',
            currentPage = 1;
        this.apiservice.getListorder(whsId, currentPage).subscribe(
          res => {
            	let _that = this;
              if(res.data) {
                  _that.listOrder = res.data;
                	_that.pagingData.totalPage = (res.meta && res.meta.pagination) ? res.meta.pagination.total_pages : 0;
                  console.log(_that.listOrder );
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

    toggleDisplay(order) {
      let array = this.listOrder;
      for(let i = 0; i < array.length; i++) {
        if(array[i].odr_id == order.odr_id) {
              array[i].inJectTableShow = !array[i].inJectTableShow;
        }
        else {
          array[i].inJectTableShow = false;
        }
        }
    }

    assignCartonsToOrder(orderId) {
        let _whsId = this.whsId ? this.whsId : '',
            _orderlId = orderId ? orderId : '';
        if(_orderlId) {
          this.navCtrl.push(AssignCartonsOrderPage, {
              'whsid': _whsId,
              'odr_id': _orderlId
          });
        }
    }

    doInfinite(infiniteScroll) {
      let _that = this;
      setTimeout(() => {

          let	whsId = _that.whsId ? _that.whsId : '',
              currentPage = _that.pagingData.currentPage;
              this.apiservice.getListorder(whsId, currentPage).subscribe(
                res => {
                    let _that = this;
                    if(res.data) {
                      _that.pagingData.currentPage++;
                      _that.listOrder = _that.listOrder.concat(res.data);
                      infiniteScroll.complete();
                    }
                },
                err => {
                    console.log(err);
                },
                () => {
                  console.log('Complete');
                }
            );
      }, 1000)
  }

}
