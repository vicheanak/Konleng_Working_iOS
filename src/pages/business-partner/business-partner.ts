import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the BusinessPartnerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-business-partner',
  templateUrl: 'business-partner.html',
})
export class BusinessPartnerPage {

  constructor(public navCtrl: NavController, 
  	public navParams: NavParams,
  	public translate: TranslateService,
  	private serviceProvider: ServiceProvider) {
  }

  ionViewWillEnter(){ this.serviceProvider.transition(); }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BusinessPartnerPage');
  }

  switchLanguage(){
  	this.serviceProvider.switchLanguage();
  }

}
