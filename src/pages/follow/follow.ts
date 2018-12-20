import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ListingProvider } from '../../providers/listing/listing';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { UserPropertiesPage } from '../user-properties/user-properties';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the SavedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-follow',
 	templateUrl: 'follow.html',
 })
 export class FollowPage {

 	private users: any;
 	constructor(public navCtrl: NavController, 
 		public navParams: NavParams,
 		private listingProvider: ListingProvider,
 		private sanitizer: DomSanitizer,
 		private serviceProvider: ServiceProvider) {
 	}
 	ionViewWillEnter(){ this.serviceProvider.transition(); }
 	ionViewDidLoad() {
 		this.listingProvider.getFollows().then((users) => {

 			this.users = users;
 		});
 	}

 	getBackground(image) {
 		return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
 	}

 	goUserProperties(user){
 		this.navCtrl.push(UserPropertiesPage, {
 			user: user
 		}, {animate: false});
 	}

 }
