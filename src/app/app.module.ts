import { NgModule } from '@angular/core';
import { IonicApp, IonicModule, DeepLinkConfig } from 'ionic-angular';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { Home } from '../pages/home/home';
import { SkuAssignmentPage } from '../pages/sku-assignment/sku-assignment';
import { PalletsPutawayPage } from '../pages/pallets-putaway/pallets-putaway';
import { PalletsRackPage } from '../pages/pallets-rack/pallets-rack';
import { PalletsReceivingPage } from '../pages/pallets-receiving/pallets-receiving';
import { SkuVerificationPage } from '../pages/sku-verification/sku-verification';
import { CartonPickingPage } from '../pages/carton-picking/carton-picking';
import { SkuLocationPage } from '../pages/sku-location/sku-location';
import { WarepickListPage } from '../pages/warepick-list/warepick-list';
import { OrderListPage } from '../pages/order-list/order-list';
import { AssignCartonsOrderPage } from '../pages/assign-cartons-order/assign-cartons-order';
import { AssignCartonsPalletPage } from '../pages/assign-cartons-pallet/assign-cartons-pallet';
import { AssignLocationPage } from '../pages/assign-location/assign-location';
import { SharedService } from '../providers/shared-service';
import { Constants } from '../providers/constants';
import { KeysPipe } from '../pipes/keys-pipe';
import { Reverse } from '../pipes/reverse';



@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    Home,
    SkuAssignmentPage,
    PalletsPutawayPage,
    PalletsRackPage,
    PalletsReceivingPage,
    SkuVerificationPage,
    CartonPickingPage,
    SkuLocationPage,
    WarepickListPage,
    OrderListPage,
    AssignCartonsOrderPage,
    AssignCartonsPalletPage,
    AssignLocationPage,
    KeysPipe,
    Reverse

  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      mode: 'md',
      iconMode: 'md',
      pageTransition: 'md'
    }, {
      links: [
        { component: LoginPage, name: 'Login', segment: 'login' },
        { component: Home, name: 'Home', segment: 'home' },
        { component: SkuAssignmentPage, name: 'Sku Assignment', segment: 'sku-assignment/:whsid/:cusid/:asnid/:ctnrid' },
        { component: PalletsPutawayPage, name: 'Pallets At Putaway', segment: 'pallets-putaway' },
        { component: PalletsRackPage, name: 'Pallets On Rack', segment: 'pallets-rack' },
        { component: PalletsReceivingPage, name: 'Pallets At Receiving', segment: 'pallets-receiving' },
        { component: SkuVerificationPage, name: 'Sku Verification', segment: 'sku-verification' },
        { component: CartonPickingPage, name: 'Carton Picking', segment: 'carton-picking/:whsid/:wrdtlid/:locid' },
        { component: SkuLocationPage, name: 'Sku Location', segment: 'sku-location/:whsid/:wrdtlid' },
        { component: WarepickListPage, name: 'Ware Pick List', segment: 'warepick-list' },
        { component: OrderListPage, name: 'Order List', segment: 'order-list' },
        { component: AssignCartonsOrderPage, name: 'Assign Cartons to order', segment: 'assign-cartons-to-order/:whsid/:odr_id' },
        { component: AssignCartonsPalletPage, name: 'Assign Cartons to pallet', segment: 'assign-cartons-to-pallet'},
        { component: AssignLocationPage, name: 'Assign Location', segment: 'assign-location'}
      ]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    Home,
    SkuAssignmentPage,
    PalletsPutawayPage,
    PalletsRackPage,
    PalletsReceivingPage,
    SkuVerificationPage,
    CartonPickingPage,
    SkuLocationPage,
    WarepickListPage,
    OrderListPage,
    AssignCartonsOrderPage,
    AssignCartonsPalletPage,
    AssignLocationPage
  ],
  providers: [SharedService, Constants]
})
export class AppModule { }
