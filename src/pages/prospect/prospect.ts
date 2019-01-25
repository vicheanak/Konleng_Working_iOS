import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { ListingProvider } from '../../providers/listing/listing';
import { AddProspectPage } from '../../pages/add-prospect/add-prospect';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the ProspectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-prospect',
 	templateUrl: 'prospect.html',
 })
 export class ProspectPage {

 	private prospects: any;
 	constructor(public navCtrl: NavController, 
 		public navParams: NavParams, 
 		private listingProvider: ListingProvider,
 		private serviceProvider: ServiceProvider,
 		private platform: Platform) {

 	}


 	ionViewDidLoad() {
 		this.platform.ready().then((readySource) => {
 			this.listingProvider.getProspects().then((data) => {
	 			console.log(data);
	 		});
 		});
 		
 		console.log('ionViewDidLoad ProspectPage');
 	}

 	goNewProspect() {
		this.navCtrl.push(AddProspectPage, {animate: false});
 	}

 }
