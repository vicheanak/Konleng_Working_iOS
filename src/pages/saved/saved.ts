import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ListingProvider } from '../../providers/listing/listing';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DetailPage } from '../detail/detail';
import { ServiceProvider } from '../../providers/service/service';
/**
 * Generated class for the SavedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-saved',
 	templateUrl: 'saved.html',
 })
 export class SavedPage {

 	private listings: any;
 	constructor(public navCtrl: NavController, 
 		public navParams: NavParams,
 		private listingProvider: ListingProvider,
 		private sanitizer: DomSanitizer,
 		private serviceProvider: ServiceProvider) {
 	}
	ionViewWillEnter(){ this.serviceProvider.transition(); }
 	

 	ionViewDidLoad() {
 		this.listingProvider.getFavorites().then((listings) => {
 			this.listings = listings;
 		});
 	}

 	getBackground(image) {
 		return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
 	}

 	goDetail(listing){

	     this.navCtrl.push(DetailPage, {
	       listing: listing,
	       user_id: listing.user_id
	     }, {animate: false});
	   }

 }
