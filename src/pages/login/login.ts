import { Component } from '@angular/core';
import { Events } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import { SharedService } from '../../providers/shared-service';
import { UtilityService } from '../../providers/utility-service';
import { SkuVerificationPage } from '../sku-verification/sku-verification';
import { PalletsRackPage } from '../pallets-rack/pallets-rack';
import { Home } from '../home/home';
import { WarepickListPage } from '../warepick-list/warepick-list';
import { OrderListPage } from '../order-list/order-list';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [Storage, ApiService, UtilityService]
})
export class LoginPage {
  public loginForm = new FormGroup({
	  	user_name: new FormControl("", Validators.required),
	  	password: new FormControl("", Validators.required),
      uuid: new FormControl("")
  });

  private storage: Storage;
  private apiservice: ApiService;
  uuid_number: string;

  constructor(public fb: FormBuilder, public nav: NavController, public events: Events, storage: Storage, apiservice: ApiService, private sharedservice: SharedService, public loadingCtrl: LoadingController, private alertCtrl: AlertController, public utilityservice : UtilityService) {
    //this.nav = nav;
    this.storage = storage;
    this.apiservice = apiservice;
  }

  private init() {
    // clear token
    if (window.localStorage.getItem('token') !== null) {
      this.apiservice.doLogout().subscribe(
          res => {

          },
          err => {

          },
          () => {
              console.log('Movie Search Complete');
          }
      );
      window.localStorage.removeItem('token');
    }
    if (window.localStorage.getItem('whsId') !== null) {
      window.localStorage.removeItem('whsId');
    }``
    this.sharedservice.setter('userId', 0);
    this.sharedservice.setter('user_name', '');
  };

  ionViewDidLoad() {
    console.log('Hello LoginPage Page');
    let _that = this;
    _that.init();
    _that.events.subscribe('uuid', (id) => {
      _that.uuid_number = id[0];
      _that.sharedservice.setter('uuid_number', _that.uuid_number);
    });
  }

  doLogin(event) {
    // show loading
    let _that = this,
        _uuid = _that.sharedservice.getter('uuid_number') || '',
        loading = _that.loadingCtrl.create();
    loading.present();
    _that.loginForm.patchValue({uuid: _uuid});
    let body = _that.utilityservice.jsonToURLEncoded(_that.loginForm.value);
    //alert(body);
    _that.apiservice.doLogin(body).subscribe(
      res => {
        loading.dismiss();
        let _res = res || <any>{};
        let acc = _res.data;
        if(!_res.status) {
          let alert = _that.alertCtrl.create({
        		cssClass: 'error-popup',
            title: '<h4 class="title"> ERROR </h4>',
            message: '<p>' + _res.message + '</p>',
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
        else if (acc && acc.token) {
        //if (acc && acc.token) {
          // trigger clear all state and list
          //this.storage.set('token', acc.token);
          if(acc.user && acc.user.user_id) {
            let lstRole = acc.user.role_id,
                roleId: any;
            if(Array.isArray(lstRole)) {
              roleId = lstRole[0];
            }
            else {
              roleId = lstRole;
            }
            window.localStorage.setItem('token', acc.token);
            window.localStorage.setItem('whsId', acc.whsid);
            _that.sharedservice.setter('whsId', acc.whsid);
            _that.sharedservice.setter('userId', acc.user.user_id);
            _that.sharedservice.setter('user_name', _that.loginForm.value.user_name);
            _that.events.publish('user', acc.user);
            _that.sharedservice.setter('device_name', acc.device_name);
            _that.redirectPage(roleId);
          }
          else {
            let alert = _that.alertCtrl.create({
              cssClass: 'error-popup',
              title: '<h4 class="title"> ERROR </h4>',
              message: '<p>This user has not been assigned a role</p>',
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

        }
      },
      err => {
        loading.dismiss();
        /*console.log(err);
        let _alert = _that.alertCtrl.create({
            cssClass: 'error-popup',
            title: '<h4 class="title"> ERROR </h4>',
            message: '<p>No Connection</p>',
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
        _alert.present();*/
      },
      () => {
        loading.dismiss();
        console.log('Movie Search Complete');
      }
    );
  }

  redirectPage(id) {
    switch (parseInt(id)) {
      case 2:
        this.nav.setRoot(Home);
        break;
      case 3:
        this.nav.setRoot(SkuVerificationPage);
        break;
      case 4:
        this.nav.setRoot(PalletsRackPage);
        break;
      case 5:
        this.nav.setRoot(WarepickListPage);
        break;
      case 6:
        this.nav.setRoot(OrderListPage);
        break;
      default:
        this.nav.setRoot(Home);
    }
  }

}
