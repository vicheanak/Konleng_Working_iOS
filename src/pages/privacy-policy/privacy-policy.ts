import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the PrivacyPolicyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-privacy-policy',
 	templateUrl: 'privacy-policy.html',
 })
 export class PrivacyPolicyPage {

 	constructor(public navCtrl: NavController, public navParams: NavParams,
 		private serviceProvider: ServiceProvider) {
 	}

 	
 	ionViewWillEnter(){ this.serviceProvider.transition(); }
 	// ionViewDidLoad() {
 		//   console.log('ionViewDidLoad PrivacyPolicyPage');
 		// }

 	}
