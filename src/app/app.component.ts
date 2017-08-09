import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { StatusBar, Splashscreen, Network } from 'ionic-native';

import * as io from "socket.io-client";
import { LoginPage } from '../pages/login/login';
import { Home } from '../pages/home/home';
import { SharedService } from '../providers/shared-service';
import { SocketService } from '../providers/socket-service';
import { PalletsPutawayPage } from '../pages/pallets-putaway/pallets-putaway';
import { PalletsRackPage } from '../pages/pallets-rack/pallets-rack';
import { PalletsReceivingPage } from '../pages/pallets-receiving/pallets-receiving';
import { SkuVerificationPage } from '../pages/sku-verification/sku-verification';
import { CartonPickingPage } from '../pages/carton-picking/carton-picking';
import { SkuLocationPage } from '../pages/sku-location/sku-location';
import { WarepickListPage } from '../pages/warepick-list/warepick-list';
import { OrderListPage } from '../pages/order-list/order-list';
import { AssignCartonsPalletPage } from '../pages/assign-cartons-pallet/assign-cartons-pallet';
import { AssignLocationPage } from '../pages/assign-location/assign-location';
import { Device } from 'ionic-native';
import { Constants } from '../providers/constants';


@Component({
  templateUrl: 'app.html',
  providers: [SharedService, SocketService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  _data: any;

  user: any = {};

  inboundPages: any;

  outboundPages: any;

  toolPages: any;

  otherPages: any[];

  permission: any = {};

  showSubmenuInBound: boolean = false;

  showSubmenuOutBound: boolean = false;

  showSubmenuTool: boolean = false;

  preventAlert: boolean = false;

  pages: Array<{title: string, component: any, icon: string}>;

  private authenAlertPresented: boolean = false;

  constructor(public platform: Platform, public events: Events, public menuCtrl: MenuController, public sharedservice : SharedService, public alertCtrl: AlertController, public constants: Constants, public socketservice: SocketService) {

    this.initializeApp();
    // used for an example of ngFor and navigation
    this.inboundPages =
      { title: 'IN BOUND', component: '', icon: 'ios-log-in-outline', type: 'parrent', name: 'inbound',
        submenu: [
          { title: 'ASN List', component: Home, icon: 'ios-radio-button-off-outline', type: 'child', permission: 'IBP_PERM01'},
          { title: 'SKU Verification', component: SkuVerificationPage, icon: 'ios-radio-button-off-outline', type: 'child' ,permission: 'IBP_PERM03'},
          { title: 'Pallets On Rack', component: PalletsRackPage,icon: 'ios-radio-button-off-outline', type: 'child', permission: 'IBP_PERM05' },
          ]
      };

    this.outboundPages =
        { title: 'OUT BOUND', component: '', icon: 'ios-log-out-outline', type: 'parrent', name: 'outbound',
          submenu: [
            { title: 'Wave Pick', component: WarepickListPage, icon: 'ios-radio-button-off-outline', type: 'child',permission: 'OBP_PERM01' },
            { title: 'Order List', component: OrderListPage, icon: 'ios-radio-button-off-outline', type: 'child',permission: 'OBP_PERM04' },
            { title: 'Pallet Assignment', component: AssignCartonsPalletPage, icon: 'ios-radio-button-off-outline', type: 'child', permission: 'OBP_PERM04'}
          ]
        }
    ;
    this.toolPages =
        { title: 'TOOLS', component: '', icon: 'ios-construct-outline', type: 'parrent', name: 'tool',
          submenu: [
            { title: 'Location Assignment', component: AssignLocationPage, icon: 'ios-radio-button-off-outline',type: 'child', permission: 'IBP_PERM03' }
          ]
        }
    ;
    this.otherPages = [
        { title: 'LOGOUT', component: LoginPage, icon: 'ios-exit-outline',type: 'child' }
    ];


  }

  initializeApp() {
      let _that = this;
      this.platform.ready().then(() => {
        // send UUID to login page
        Device.device && Device.device.uuid && _that.events.publish('uuid', Device.device.uuid);
        //_that.events.publish('uuid', '4ed6088b55644524');
        // get permission from login page
        _that.events.subscribe('user', (data) => {
            _that.permission = data[0].permission;
            _that.user = data[0];
        });
        // watch network for a disconnect
        let disconnectSubscription = Network.onDisconnect().subscribe(() => {
            if(!_that.preventAlert) {
                _that.preventAlert = true;
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
                            _that.preventAlert = false;
                        }
                      }
                    ]
                });
                _alert.present();
            }
        });
        _that.connect();
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //alert('Device UUID is: ' + Device.device.uuid);
      //alert('Device Serial is: ' + Device.device.serial);
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if(page.type == 'child') {
      this.menuCtrl.close();
      this.nav.setRoot(page.component);
    }
    else if(page.type == 'parrent') {
      if(page.name == 'inbound') {
        this.showSubmenuInBound = !this.showSubmenuInBound;
      }
      if(page.name == 'outbound') {
        this.showSubmenuOutBound = !this.showSubmenuOutBound;
      }
      if(page.name == 'tool') {
        this.showSubmenuTool = !this.showSubmenuTool;
      }
    }
  }

  haveAtLeastOnePer(subs) {
    let _that = this,
        _result = false;
    if(subs && Array.isArray(subs)) {
        for(let sub of subs) {
            if(_that.permission.hasOwnProperty(sub.permission)) {
               _result = true;
               break;
            }
        }
    }
    return _result;
  }

  menuClosed() {
      //code to execute when menu has closed
      this.events.publish('menu:closed', {});
  }

  menuOpened() {
     //code to execute when menu ha opened
     this.events.publish('menu:opened', {});
  }

  private connect() {
    let _that = this;
    _that.socketservice.connect();
    _that.socketservice.listen('updatedata', function(data) {
        _that.handleAuthenUser(data);
        console.log(data);
    });
    /* socket = io(_that.constants.BASE_IP + ':' + _that.constants.NODE_PORT);
    _that.sharedservice.setter('socket_io', socket);
    socket.on('connect', function () {
        socket.on('updatedata' , function(data){
            _that.handleAuthenUser(data);
            console.log(data);
        });
    });*/
  }

  private handleAuthenUser(data) {
    let _that = this,
      _data = data.dataRes;
    if(_data.action && _data.action == 'AuthLogin' && !_that.authenAlertPresented){
        let _info = _data.dataRes,
          _curToken = window.localStorage.getItem('token') || '',
          _userName = _that.sharedservice.getter('user_name') || '';
        if(_info.user_name && _userName == _info.user_name && _info.token && _curToken && _info.token != _curToken) {
          _that.authenAlertPresented = true;
          let _alert = _that.alertCtrl.create({
              cssClass: 'error-popup',
              title: '<h4 class="title"> ERROR </h4>',
              message: '<p>Your account is used by another user</p>',
              buttons: [
              {
                  text: 'OK',
                  role: 'ok',
                  cssClass: 'error-btn',
                  handler: () => {
                    _that.authenAlertPresented = false;
                    _that.nav.setRoot(LoginPage);
                  }
                }
              ]
          });
          _alert.present();
        }
      }
  }
}
