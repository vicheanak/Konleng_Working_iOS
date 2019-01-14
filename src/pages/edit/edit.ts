import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NavController, AlertController, LoadingController, NavParams, Platform, ModalController, ViewController, ActionSheetController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { ConfirmationPage } from '../confirmation/confirmation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AuthServiceProvider } from '../../providers/auth/auth';
import { ListingProvider } from '../../providers/listing/listing';
import { LoginPage } from '../login/login';
import {
	GoogleMaps,
	GoogleMap,
	LatLng,
	GoogleMapsEvent,
	GoogleMapOptions,
	CameraPosition,
	MarkerOptions,
	Marker,
	MarkerLabel,
	MarkerIcon,
	GoogleMapsAnimation,
	Environment
} from '@ionic-native/google-maps';

import { Base64 } from '@ionic-native/base64';
import { AngularFireStorage, AngularFireStorageReference } from 'angularfire2/storage';
import 'rxjs/add/observable/forkJoin';
import { Observable, from, forkJoin } from 'rxjs';
import { map, tap, take, switchMap, mergeMap, expand, takeWhile } from 'rxjs/operators';
import { File } from '@ionic-native/file';
import {MyPropertiesPage} from '../my-properties/my-properties';
import { DetailPage } from '../detail/detail';
import { IonicStepperComponent } from 'ionic-stepper';
import { ServiceProvider } from '../../providers/service/service';
import { ImagesProvider } from '../../providers/images/images';
/**
 * Generated class for the AddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 @Component({
 	selector: 'page-edit',
 	templateUrl: 'edit.html',
 })
 export class EditPage {
 	@ViewChild('map') mapElement: ElementRef;
 	@ViewChild('descriptionInput') myInput: ElementRef;
 	@ViewChild('stepper') stepper: IonicStepperComponent;
 	private actionSheetButtons = [];
 	private actionSheetTitle: string;
 	private map:GoogleMap;
 	private location: LatLng;
 	public latLng: any = "my string";
 	public provinces: any = [];
 	public districts: any = [];
 	public communes: any = [];
 	public all_districts: any = [];
 	public imgPreviews: any;
 	private timer: any;
 	public listing: any = {
 		listing_type: '',
 		property_type: '',
 		province: '',
 		district: '',
 		title: '',
 		price: '',
 		description: '',
 		bedrooms: '',
 		bathrooms: '',
 		parking: '',
 		size: '',
 		phone1: '',
 		phone2: '',
 		images: [],
 		address: '',
 		lat: '',
 		lng: '',
 		email: '',
 		user_id: '',
 		thumb: '',
 		user_name: '',
 	};
 	imgPreview: any;
 	objectKeys = Object.keys;
 	user: any;
 	myLoading: any;
 	tmpCloudImages: any = [];
 	constructor(
 		public translate: TranslateService,
 		private storage: Storage,
 		public actionSheetCtrl: ActionSheetController, 
 		public navCtrl: NavController, 
 		public navParams: NavParams,
 		private platform: Platform,
 		public renderer: Renderer2,
 		private cf: ChangeDetectorRef,
 		private nativeGeocoder: NativeGeocoder,
 		private base64: Base64,
 		private sanitizer: DomSanitizer,
 		private camera: Camera,
 		private auth: AuthServiceProvider,
 		private listingProvider: ListingProvider,
 		private afStorage: AngularFireStorage,
 		private file: File,
 		private loadingCtrl: LoadingController,
 		private alertCtrl: AlertController,
 		private serviceProvider: ServiceProvider,
 		private imagesProvider: ImagesProvider) {
 		this.imgPreview = '../assets/imgs/image_blank.jpg';
 		
 		this.provinces = this.listingProvider.getProvinces();

 		this.imgPreviews = [
 		{id: 1, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 2, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 3, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 4, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 5, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 6, src: 'assets/imgs/image_blank.png', hasImg: false}
 		] ;		
 	}
 	ionViewWillEnter(){ 
 		this.serviceProvider.transition(); 
 	};
 	compareProvince(province, district): boolean {
 		return province && district ? province.id === district.province_id : province.id === district.province_id;
 	}
 	resize() {
 		var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
 		var scrollHeight = element.scrollHeight;
 		element.style.height = scrollHeight + 'px';
 		this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
 	}
 	getBackground(image) {
 		return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
 	}

 	presentLoading() {
 		this.myLoading = this.loadingCtrl.create({
 			spinner: 'ios'
 		});

 		this.myLoading.present();
 	}

 	next() {
 		this.stepper.nextStep();
 	}

 	previous() {
 		this.stepper.previousStep();
 	}

 	resetStep(){
 		this.stepper.setStep(0);
 	}

 	dismissLoading(listing){
 		try{
 			this.myLoading.dismiss();
 			
 			console.log('listing edit', listing);

 			const tabs = this.navCtrl.parent;
 			tabs.select(2)
 			.then(() => tabs.getSelected().push(MyPropertiesPage, {user: this.user}, { animate: false }))
 			.then(() => tabs.getSelected().push(DetailPage, {listing: listing, user_id: listing.user_id}, { animate: false }))
 			.then(() => this.navCtrl.popToRoot());
 		}catch(e){

 		}

 		// try{
 		// 	this.myLoading.dismiss();
 		// 	this.navCtrl.pop({animate: false});
 		// 	this.navCtrl.pop({animate: false});
 		// 	this.navCtrl.push(DetailPage, {
 		// 		listing: listing,
 		// 		user_id: listing.user_id
 		// 	}, {animate: false});
 		// 	this.cf.detectChanges();
 			
 		// 	// const tabs = this.navCtrl.parent;
 		// 	// tabs.select(2)
 		// 	// .then(() => tabs.getSelected().push(MyPropertiesPage, {}, { animate: false }))
 		// 	// .then(() => tabs.getSelected().push(DetailPage, {listing: listing, user_id: listing.user_id}, { animate: false }))
 		// 	// .then(() => this.navCtrl.popToRoot());
 		// }catch(e){

 		// }
 	}

 	dismissDeleteLoading(){
 		try{
 			this.myLoading.dismiss();
 			this.navCtrl.pop({animate: false});
 			this.navCtrl.pop({animate: false});
 			
 		}catch(e){

 		}
 	}

 	resetListing(){
 		this.listing = {
 			listing_type: '',
 			property_type: '',
 			province: '',
 			district: '',
 			title: '',
 			price: '',
 			description: '',
 			bedrooms: '',
 			bathrooms: '',
 			parking: '',
 			size: '',
 			images: [],
 			address: '',
 			lat: '',
 			lng: '',
 			thumb: '',
 		};

 		this.imgPreviews = [
 		{id: 1, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 2, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 3, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 4, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 5, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 6, src: 'assets/imgs/image_blank.png', hasImg: false}
 		];
 	}


 	getPhoto(sourceType, key) {

 		if (sourceType == 'camera'){
 			sourceType = this.camera.PictureSourceType.CAMERA;
 		}
 		else if (sourceType == 'gallery'){
 			sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;	
 		}
 		const options: CameraOptions = {
 			quality: 80,
 			destinationType: this.camera.DestinationType.FILE_URI,
 			encodingType: this.camera.EncodingType.JPEG,
 			mediaType: this.camera.MediaType.PICTURE,
 			sourceType: sourceType,
 			targetWidth: 1280,
 			targetHeight: 1280,
 			correctOrientation: true,
 		}

 		this.camera.getPicture(options).then((imageUri) => {
 			
 			this.listing.images[key] = imageUri;

 			let filename = imageUri.substring(imageUri.lastIndexOf('/')+1);
 			filename = filename.split('?')[0];
 			let path =  imageUri.substring(0,imageUri.lastIndexOf('/')+1);

 			this.file.readAsDataURL(path, filename).then((dataUrl) => {
 				this.imgPreviews[key].src = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
 			}).catch((msg) => {
 				console.error('error read file', JSON.stringify(msg));
 			});

 			this.imgPreviews[key]['hasImg'] = true;

 		}, (err) => {
 			// Handle error
 		});
 	}
 	changelisting_type(listing_type){
 		this.listing.listing_type = listing_type;
 	}
 	addImage(event, key) {
 		if (document.URL.startsWith('https')){
 			this.imagesProvider.handleImageSelection(event).subscribe((res) =>{
				this.listing.images[key] = event.target.files[0];
				this.imgPreviews[key].src = res;
				this.imgPreviews[key]['hasImg'] = true;
 			}, (error) =>{
 				console.error(error);
 			});
 		}
 		else{
 			this.actionSheetButtons = [
 			{
 				text: 'Camera',
 				handler: () => {
 					this.getPhoto('camera', key);
 				}
 			},{
 				text: 'Gallery',
 				handler: () => {
 					this.getPhoto('gallery', key);
 				}
 			}
 			];
 			this.actionSheetTitle = 'Add Image';
 			if (this.imgPreviews[key]['hasImg']){
 				this.actionSheetTitle = 'Edit Image';
 				this.actionSheetButtons.push({
 					text: 'Delete',
 					role: 'destructive',
 					handler: () => {
 						this.imgPreviews[key]['hasImg'] = false;
 						this.imgPreviews[key]['src'] = 'assets/imgs/image_blank.png';
 						this.listing.images.splice(key, 1);


 					}
 				});
 			}
 			const actionSheet = this.actionSheetCtrl.create({
 				title: this.actionSheetTitle,
 				buttons: this.actionSheetButtons
 			});
 			actionSheet.present();
 		}
 		
 	}
 	getGeocoder(location){

 		if (document.URL.startsWith('https')){
 			let loc = location + ', Cambodia';
 			this.serviceProvider.getGeocode(loc).then((coordinates) => {
 				this.location = new LatLng(parseFloat(coordinates['lat']), parseFloat(coordinates['lng']));
 				let options = {
 					target: this.location,
 					zoom: 14,
 				};
 				this.map.moveCamera(options);
 			}).catch((err) => {
 				console.error('err', err);
 			});	
 		}
 		else{
 			let geoCoderOptions: NativeGeocoderOptions = {
 				useLocale: true,
 				maxResults: 5
 			};
 			this.nativeGeocoder.forwardGeocode(location + ', Cambodia', geoCoderOptions)
 			.then((coordinates: NativeGeocoderForwardResult[]) => {
 				this.location = new LatLng(parseFloat(coordinates[0].latitude), parseFloat(coordinates[0].longitude));
 			})
 		}
 		
 	}
 	provinceChange(){
 		this.districts = this.listingProvider.getDistricts(this.listing.province);
 	}
 	
 	ionViewDidLoad() {
 		
 		this.platform.ready().then((readySource) => {
 			
 			this.listing = this.navParams.get('listing');
 			console.log('getListing', this.listing);
 			this.provinceChange();



 			this.listing.description = this.listing.description.replace(/<br \/>/g, "\n");
 			this.location = new LatLng(parseFloat(this.listing.lat), parseFloat(this.listing.lng));

 			
 			this.imgPreviews = [
 			{id: 1, src: 'assets/imgs/image_blank.png', hasImg: false},
 			{id: 2, src: 'assets/imgs/image_blank.png', hasImg: false},
 			{id: 3, src: 'assets/imgs/image_blank.png', hasImg: false},
 			{id: 4, src: 'assets/imgs/image_blank.png', hasImg: false},
 			{id: 5, src: 'assets/imgs/image_blank.png', hasImg: false},
 			{id: 6, src: 'assets/imgs/image_blank.png', hasImg: false}
 			];

 			if (this.listing.images.length > 6){
 				this.listing.images = this.listing.images.slice(0,6);
 			}

 			for (let i = 0; i < this.listing.images.length; i ++){
 				console.log(i);
 				console.log(this.imgPreviews[i]);
 				this.imgPreviews[i].src = this.listing.images[i];
 				this.imgPreviews[i].hasImg = true;
 			}

 			this.auth.getUser().then((user) => {
 				this.user = user;
 				if (!this.user){
 					this.navCtrl.push(LoginPage, {page: 'add'}, {animate: false});
 				}
 				else{
 					this.listing.user_id = this.user.uid;
 					this.listing.email = this.user.email;
 					this.listing.phone1 = this.user.phone1 ? this.user.phone1 : '';
 					this.listing.phone2 = this.user.phone2 ? this.user.phone2 : '';
 					this.listing.user_name = this.user.displayName ? this.user.displayName : '';
 				}
 			});



 			this.renderer.setStyle(this.mapElement.nativeElement, "height", '300px');
 			let element = this.mapElement.nativeElement;
 			this.map = GoogleMaps.create(element);
 			this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
 				let options = {
 					target: this.location,
 					zoom: 16,
 				};
 				this.map.moveCamera(options);
 				this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe((params) => {
 					this.listing.lat = params[0]['target']['lat'].toFixed(6);
 					this.listing.lng = params[0]['target']['lng'].toFixed(6);
 					
 					// this.listing.address = 
 					this.cf.detectChanges();
 				});
 			});
 		});
 	}

 	runTimeChange(address){
 		if (this.timer) {
 			clearTimeout(this.timer);
 		}
 		this.timer = setTimeout(() => {

 			if (this.listing.address){
 				this.getGeocoder(this.listing.address);		
 			}
 		}, 500);
 	}
 	selectChange(e) {
 		
 		if (e == 4){
 			// this.locationChange();
 		}
 	}

 	



 	editListing(){
 		this.listing.description = this.listing.description.replace(/\n/g, "<br />");
 		this.presentLoading();
 		if (this.auth.authenticated){
 			this.tmpCloudImages = [];

 			for (let i = 0; i < this.listing.images.length; i ++){
 				if (document.URL.startsWith('https')){
 					let type = typeof this.listing.images[i];
 					if (type == 'string'){
 						if (this.listing.images[i].indexOf('firebasestorage.googleapis.com') > 0){
		 					this.tmpCloudImages.push(this.listing.images[i]);
		 					delete this.listing.images[i];
		 				}
 					}
 				}
 				else{
 					if (this.listing.images[i].indexOf('firebasestorage.googleapis.com') > 0){
	 					this.tmpCloudImages.push(this.listing.images[i]);
	 					delete this.listing.images[i];
	 				}
 				}
 				
 			}

 			this.listing.images = this.listing.images.filter(String);



 			if (this.listing.images.length > 0){


 				this.listingProvider.updateImages(this.listing.id, this.listing.images).then((imgs) => {
 					
 					this.listing.images = this.tmpCloudImages.concat(imgs);
 					this.listingProvider.update(this.listing.id, this.listing).then((listing) => {
 						
 						this.dismissLoading(this.listing);

 					});
 				}).catch((err) => {
 					
 				});
 			}
 			else if (this.tmpCloudImages.length > 0) {
 				this.listing.images = this.tmpCloudImages;
 				this.listingProvider.update(this.listing.id, this.listing).then((listing) => {
 					
 					this.dismissLoading(this.listing);

 				});

 			}
 		}
 		
 		
 	}

 	presentSoldConfirm() {
 		let title = '';
 		let message = '';
 		if (this.listing.status == 0){
 			title = 'Confirm Re-activate',
 			message = 'Are you sure to re-activate this listing?'
 		}
 		else{
 			title = 'Confirm Sold';
 			message = 'Are you sure this listing is sold?';
 		}
 		let alert = this.alertCtrl.create({
 			title: title,
 			message: message,
 			buttons: [
 			{
 				text: 'Cancel',
 				role: 'cancel',
 				handler: () => {
 					
 				}
 			},
 			{
 				text: 'SURE!',
 				handler: () => {
 					this.presentLoading();
 					if (this.listing.status == 1){
 						this.listingProvider.markAsSold(this.listing).then((id) => {
 							this.listing.status = 0;
 							this.dismissLoading(this.listing);
 						});		
 					}
 					else{
 						this.listingProvider.markAsActive(this.listing).then((id) => {
 							this.listing.status = 1;
 							this.dismissLoading(this.listing);
 						});
 					}

 				}
 			}
 			]
 		});
 		alert.present();
 	}

 	presentDeleteConfirm() {
 		let alert = this.alertCtrl.create({
 			title: 'Confirm Delete',
 			message: 'Are you sure to delete this listing?',
 			buttons: [
 			{
 				text: 'Cancel',
 				role: 'cancel',
 				handler: () => {
 					
 				}
 			},
 			{
 				text: 'SURE!',
 				handler: () => {
 					this.presentLoading();
 					this.listingProvider.deleteListing(this.listing).then(() => {
 						this.dismissDeleteLoading();
 					});
 				}
 			}
 			]
 		});
 		alert.present();
 	}





 	
 }