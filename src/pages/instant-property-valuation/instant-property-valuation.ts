import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { AlertController, NavController, LoadingController, Events, Content, NavParams, Platform, ModalController, ViewController, ActionSheetController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Storage } from '@ionic/storage';
import { ConfirmationPage } from '../confirmation/confirmation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AuthServiceProvider } from '../../providers/auth/auth';
import { ServiceProvider } from '../../providers/service/service';
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
import { ImagesProvider } from '../../providers/images/images';


/**
 * Generated class for the AddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 @Component({
 	selector: 'page-instant-property-valuation',
 	templateUrl: 'instant-property-valuation.html',
 })
 export class InstantPropertyValuationPage {
 	@ViewChild('map') mapElement: ElementRef;
 	@ViewChild('descriptionInput') myInput: ElementRef;
 	@ViewChild('stepper') stepper: IonicStepperComponent;
 	@ViewChild(Content) content: Content;

 	private actionSheetButtons = [];
 	private actionSheetTitle: string;
 	private map:GoogleMap;
 	private location: LatLng;
 	private latLng: any = "my string";
 	private provinces: any = [];
 	private districts: any = [];
 	private communes: any = [];
 	private timer: any;
 	private isWeb: boolean = false;

 	private image : string;

 	private isSelected : boolean 		=	false;

 	private _SUFFIX : string;

 	private mapEnvironment: Environment;
 	private imgPreviews: any;
 	private listing: any = {
 		id: '',
 		listing_type: '',
 		property_type: '',
 		province: '',
 		district: '',
 		title: '',
 		price: '',
 		description: '',
 		bedrooms: '',
 		bathrooms: '',
 		parking_spaces: '',
 		size: '',
 		floor: '',
 		swimming_pool: false,
 		gym_fitness: false,
 		lift: false,
 		garden: false,
 		furnished: false,
 		balcony: false,
 		air_conditioning: false,
 		car_parking: false,
 		non_flooding: false,
 		on_main_road: false,
 		other: false,
 		in_development_area: false,
 		phone1: '',
 		phone2: '',
 		images: [],
 		address: '',
 		lat: '',
 		lng: '',
 		email: '',
 		user_id: '',
 		thumb: '',
 		displayName: '',
 		user_name: '',
 		send_to_agents: true
 	};
 	imgPreview: any;
 	objectKeys = Object.keys;
 	user: any;
 	myLoading: any;
 	currentLanguage: any;
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
 		public events: Events,
 		private serviceProvider: ServiceProvider,
 		private imagesProvider: ImagesProvider,
 		private alertCtrl: AlertController) {
 		this.imgPreview = 'assets/imgs/image_blank.jpg';
 		this.location = new LatLng(11.556492, 104.934909);
 		this.provinces = this.listingProvider.getProvinces();


 		if (document.URL.startsWith('https')){
 			this.isWeb = true;
 		}

 		this.imgPreviews = [
 		{id: 1, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 2, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 3, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 4, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 5, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 6, src: 'assets/imgs/image_blank.png', hasImg: false}
 		] ;		
 	}

 	

 	compareProvince(province, district): boolean {

 		return province && district ? province.id === district.province_id : province.id === district.province_id;
 	}
 	scrollToTop() {
 		this.content.scrollToTop();
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

 	switchLanguage(){
 		this.serviceProvider.switchLanguage();
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
 			this.resetListing();
 			this.resetStep();
 			this.scrollToTop();
 			this.navCtrl.pop();
 			// const tabs = this.navCtrl.parent;
 			// tabs.select(2)
 			// .then(() => tabs.getSelected().push(MyPropertiesPage, {user: this.user}, { animate: false }))
 			// .then(() => tabs.getSelected().push(DetailPage, {listing: listing, user_id: listing.user_id}, { animate: false }))
 			// .then(() => this.navCtrl.popToRoot());
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
 			size: '',
 			images: [],
 			address: '',
 			lat: '',
 			lng: '',
 			thumb: '',
 		};
 		this.listing.user_id = this.user.uid;
		this.listing.email = this.user.email;
		this.listing.phone1 = this.user.phone1 ? this.user.phone1 : '';
		this.listing.phone2 = this.user.phone2 ? this.user.phone2 : '';
		this.listing.displayName = this.user.displayName ? this.user.displayName : '';
		this.listing.userType = this.user.userType ? this.user.userType : '';
		this.listing.agencyName = this.user.agencyName ? this.user.agencyName : '';
 		// 	this.listing.user_id = this.user.uid;
 		// this.listing.email = this.user.email;
 		// this.listing.phone1 = this.user.phone1 ? this.user.phone1 : '';
 		// this.listing.phone2 = this.user.phone2 ? this.user.phone2 : '';
 		// this.listing.user_name = this.user.displayName ? this.user.displayName : '';

 		this.imgPreviews = [
 		{id: 1, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 2, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 3, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 4, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 5, src: 'assets/imgs/image_blank.png', hasImg: false},
 		{id: 6, src: 'assets/imgs/image_blank.png', hasImg: false}
 		];
 	}

 	changeListener($event) : void {
 		this.file = $event.target.files[0];

 	}

 	saveProfile_click() {
 		console.log("saveProfile_click", this.file);
 		// Add your code here

 	}

 	uploadProfileImage(){
 		console.log("uploadProfileImage", this.file);

 	}

 	



 	uploadFile() : void
 	{
 		this.imagesProvider
 		.uploadImageSelection(this.image,
 			this._SUFFIX)
 		.subscribe((res) =>
 		{
 			this.displayAlert(res.message);
 		},
 		(error : any) =>
 		{
 			console.dir(error);
 			this.displayAlert(error.message);
 		});
 	}

 	presentAlert(title, msg) {
 		const prompt = this.alertCtrl.create({
 			title: title,
 			message: msg,
 			buttons: [
 			{
 				text: 'Ok',
 				handler: data => {
 					console.log('Saved clicked', JSON.stringify(data));
 				}
 			}
 			]
 		});
 		prompt.present();
 	}

 	displayAlert(message : string) : void
 	{
 		this.presentAlert('Got it', 'Upload');
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

 		}, (error) => {
 			console.error('ERROR CAMERA', error);
 		});


 	}
 	changelisting_type(listing_type){
 		this.listing.listing_type = listing_type;
 	}
 	addImage(event, key) {
 		if (document.URL.startsWith('https')){
 			this.imagesProvider.handleImageSelection(event).subscribe((res) =>{
 				this._SUFFIX 			= res.split(':')[1].split('/')[1].split(";")[0];
 				if(this.imagesProvider.isCorrectFileType(this._SUFFIX)){
 					this.listing.images[key] = event.target.files[0];
 					this.imgPreviews[key].src = res;
 					this.imgPreviews[key]['hasImg'] = true;
 				}
 			}, (error) =>{
 				console.dir(error);
 				this.displayAlert(error.message);
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
	 			let options = {
	 				target: this.location,
	 				zoom: 14,
	 			};
	 			this.map.moveCamera(options);
	 		})
	 		.catch((error: any) => console.log(error));
 		}


 		

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
 	provinceChange(){
 		this.districts = this.listingProvider.getDistricts(this.listing.province);
 		this.listing.district = '';
 	}
 	districtChange(){
 		this.communes = this.listingProvider.getCommunes(this.listing.district);
 		this.listing.commune = '';
 	}

 	ionViewWillEnter() {
 		this.serviceProvider.transition();
 		this.listing.id = this.serviceProvider.genUuid();
 		
 	}
 	ionViewDidEnter(){
 		
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
 				this.listing.displayName = this.user.displayName ? this.user.displayName : '';
 				this.listing.userType = this.user.userType ? this.user.userType : '';
 				this.listing.agencyName = this.user.agencyName ? this.user.agencyName : '';
 			}
 		});

 	}
 	ionViewDidLoad() {
 		this.platform.ready().then((readySource) => {

 		

 			this.renderer.setStyle(this.mapElement.nativeElement, "height", '300px');
 			let element = this.mapElement.nativeElement;

 			
 			this.map = GoogleMaps.create(element);

 			this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
 				let options = {
 					target: this.location,
 					zoom: 14,
 				};
 				this.map.moveCamera(options);
 				this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe((params) => {
 					this.listing.lat = params[0]['target']['lat'].toFixed(6);
 					this.listing.lng = params[0]['target']['lng'].toFixed(6);
 					// this.latLng = params[0]['target']['lat'].toFixed(6) + ',' + params[0]['target']['lng'].toFixed(6);
 					// this.latLng = this.latLng.toString();
 					// let geoCoderOptions: NativeGeocoderOptions = {
 						// 	useLocale: true,
 						// 	maxResults: 5
 						// };
 						// this.nativeGeocoder.reverseGeocode(params[0]['target']['lat'], params[0]['target']['lng'], geoCoderOptions)
 						// .then((result: NativeGeocoderReverseResult[]) => {
 							// 	let province = result[0]['administrativeArea'];
 							// 	let district = result[0]['subAdministrativeArea'];
 							// 	let commune = result[0]['subLocality'] == '' ? result[0]['locality'] : result[0]['subLocality'];
 							// 	let street = result[0]['thoroughfare'];
 							// 	let houseNo = result[0]['subThoroughfare'];
 							// 	let address = [];
 							// 	address.push(houseNo);
 							// 	address.push(street);
 							// 	address.push(commune);
 							// 	address.push(district);
 							// 	address.push(province);
 							// 	address = address.filter(v=>v!='');
 							// 	this.listing.address = address.join(', ');
 							// 	this.cf.detectChanges();
 							// })
 							// .catch((error: any) => console.log(error));
 							// this.listing.address = 
 							this.cf.detectChanges();
 						});
 			});
 		});
 	}
 	selectChange(e) {

 		if (e == 6){
 			// this.locationChange();
 			if (this.listing.address == ''){
 				let commune = this.listing.commune ? this.listingProvider.getCommune(this.listing.commune).text : '';
 				let district = this.listing.district ? this.listingProvider.getDistrict(this.listing.district).text : '';
 				this.listing.address = commune + ', ' + district + ', ' + this.listingProvider.getProvince(this.listing.province).text;
 				this.getGeocoder(this.listing.address);	
 			}
 		}
 		
 	}


 	addInstantPropertyValuation(){
 		
 		// this.listing.description = this.listing.description.replace(/\n/g, "<br />");
 		this.presentLoading();
 		if (this.auth.authenticated){
 			

 			this.listingProvider.addValuationListing(this.listing).then((listing) => {
				this.dismissLoading(this.listing);
 			});
 		}


 	}




 }