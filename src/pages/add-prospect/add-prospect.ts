import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,LoadingController, ViewController } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import {AuthServiceProvider} from '../../providers/auth/auth';
import { ListingProvider } from '../../providers/listing/listing';
import { ProspectPage } from '../prospect/prospect';


/**
 * Generated class for the AddProspectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-add-prospect',
 	templateUrl: 'add-prospect.html',
 })
 export class AddProspectPage {

 	private user: any;
 	private listings: any;
 	private listing: any;
 	
 	private myLoading: any;
 	
 	private prospect: any = {
 		id: '',
 		name: '',
 		phonenumber: '',
 		note: '',
 		listing_id: '',
 		listing_title: '',
 		listing_price: '',
 		user_uid: '',
 		created_at: new Date()
 	}
 	constructor(public navCtrl: NavController, 
 		private auth: AuthServiceProvider,
 		private sanitizer: DomSanitizer,
 		private serviceProvider: ServiceProvider,
 		private listingProvider: ListingProvider,
 		public navParams: NavParams,
 		private modalCtrl: ModalController,
 		private loadingCtrl: LoadingController) {
 		this.prospect.name = '';
 		this.prospect.phonenumber = '';
 		this.prospect.note = '';
 	}

 	ionViewWillEnter(){ 
 		this.serviceProvider.transition(); 
 		this.auth.getUser().then((user) => {
 			this.prospect.user_uid = user['uid'];
 			if (this.navParams.get('listing')){
 				this.listing = this.navParams.get('listing');
 			}
 			else{
 				this.listingProvider.getUserListings(this.prospect.user_uid, 3, 1).then((listing) => {
 					console.log('hi');
 					console.log(listing[0]);
 					this.listing = listing[0];
 				}).catch((error) => {
 					console.error('ERROR activeListing', error);
 				});
 			}
 		});
 	}

 	ionViewDidLoad() {
 		console.log('ionViewDidLoad AddProspectPage');
 	}

 	presentLoading() {
 		this.myLoading = this.loadingCtrl.create({
 			spinner: 'ios'
 		});

 		this.myLoading.present();
 	}

 	dismissLoading(){

 		const tabs = this.navCtrl.parent;
 			tabs.select(2)
 			.then(() => tabs.getSelected().push(ProspectPage, {listing: this.listing}, { animate: false }))
 		this.myLoading.dismiss();
 	}

 	submit(){
 		this.presentLoading();
 		this.prospect.listing_id = this.listing.id;
 		this.prospect.listing_title = this.listing.title;
 		this.prospect.listing_price = this.listing.price;
 		this.prospect.id = this.serviceProvider.genUuid();
 		this.listingProvider.setProspect(this.prospect).then((transaction) => {
 			this.dismissLoading();
 		});
 	}

 	getBackground(image) {
 		return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
 	}

 	presentListingModal() {
 		let listingModal = this.modalCtrl.create(ListingModal);
 		listingModal.onDidDismiss(data => {
 			if (!data.close){

 				this.listing = data.listing;


 			}

 		});
 		listingModal.present();
 	}

 }

 @Component({
 	selector: 'page-add-prospect',
 	templateUrl: 'listing.html'
 })
 export class ListingModal {
 	public priceRange: any;
 	public provinces: any = [];
 	public districts: any = [];
 	private myLoading: any;
 	private user: any;
 	private listings: any;

 	constructor(params: NavParams, 
 		public viewCtrl: ViewController,
 		private listingProvider: ListingProvider,
 		private loadingCtrl: LoadingController,
 		private auth: AuthServiceProvider,
 		private sanitizer: DomSanitizer) {

 		this.auth.getUser().then((user) => {
 			this.user = user;
 			this.listingProvider.getUserListings(this.user.uid, 3).then((listings) => {
 				this.listings = listings;
 			}).catch((error) => {
 				console.error('ERROR activeListing', error);
 			});
 		});


 	}
 	dismiss() {
 		let data = { 'close': true };
 		this.viewCtrl.dismiss(data);
 	}

 	getBackground(image) {
 		return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
 	}

 	presentLoading() {
 		this.myLoading = this.loadingCtrl.create({
 			content: 'Please wait...'
 		});

 		this.myLoading.present();
 	}

 	dismissLoading(){
 		try{
 			this.myLoading.dismiss();

 		}catch(e){

 		}
 	}

 	selectListing(listing){
 		let data = {listing: listing};
 		// this.dismissLoading();
 		this.viewCtrl.dismiss(data);
 	}


 }
