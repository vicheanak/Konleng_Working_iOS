import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ListingProvider } from '../../providers/listing/listing';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DetailPage } from '../detail/detail';
import { EmailComposer } from '@ionic-native/email-composer';
import { CallNumber } from '@ionic-native/call-number';
import {AuthServiceProvider} from '../../providers/auth/auth';
import { LoginPage } from '../login/login';

import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the SavedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-user-properties',
 	templateUrl: 'user-properties.html',
 })
 export class UserPropertiesPage {

 	private activeListings: any;
 	private inactiveListings: any;
 	public display: string = 'active';
 	private photoUrl: any;
 	private user: any;
 	private myLoading: any;
 	private isFollow: any;
 	constructor(public navCtrl: NavController, 
 		public navParams: NavParams,
 		private listingProvider: ListingProvider,
 		private sanitizer: DomSanitizer,
 		private cf: ChangeDetectorRef,
 		private auth: AuthServiceProvider,
 		private emailComposer: EmailComposer,
 		private callNumber: CallNumber,
 		private loadingCtrl: LoadingController,
 		private serviceProvider: ServiceProvider) {

 		
 	}

 	presentLoading() {
 		this.myLoading = this.loadingCtrl.create({
 			spinner: 'ios'
 		});

 		this.myLoading.present();
 	}

 	dismissLoading(){
 		this.myLoading.dismiss();
 	}



 	ionViewWillEnter(){ this.serviceProvider.transition(); }


 	ionViewDidLoad() {

 		this.user = this.navParams.get('user');
 		this.auth.isFollow(this.user.uid).then((res) => {
 			this.isFollow = res;
 		});
 		this.photoUrl = this.user.photoURL ? this.user.photoURL : '../assets/imgs/image_blank.png';
 		console.log('this.user', this.user);
 		this.listingProvider.getUserListings(this.user.uid, 1).then((listings) => {
 			this.activeListings = listings;
 		});
 		this.listingProvider.getUserListings(this.user.uid, 0).then((listings) => {
 			this.inactiveListings = listings;
 		});
 	}


 	segmentChanged(){
 		this.cf.detectChanges();

 	}

 	call(number){
 		this.callNumber.callNumber(number, true).then(() => {
 			console.log("save");
 		});
 	}

 	sendEmail(userEmail){
 		this.emailComposer.hasPermission().then((msg) => {
 			console.log('PERMISSION EMAIL', JSON.stringify(msg));
 		}).catch((error) => {
 			console.log('ERROR PERMISSION', JSON.stringify(error));
 		});

 		let email = {
 			to: userEmail,
 			subject: 'Enquiry Listing from Konleng Real Estate App',
 			body: ''
 		};

 		this.emailComposer.open(email);

 	}

 	follow(){
 		if (this.auth.authenticated){
 			this.presentLoading();
 			this.auth.follow(this.user).then((res) => {
 				this.isFollow = res;
 				this.dismissLoading();
 			});
 		}
 		else{
 			this.navCtrl.push(LoginPage, {}, {animate: false});
 		}
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
