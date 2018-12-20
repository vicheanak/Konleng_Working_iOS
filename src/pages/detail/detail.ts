import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NavController, NavParams, Platform, ModalController, Slides, LoadingController, ViewController } from 'ionic-angular';
import { EditPage } from '../edit/edit';
import { UserPropertiesPage } from '../user-properties/user-properties';
import {ListingProvider} from '../../providers/listing/listing';
import {AuthServiceProvider} from '../../providers/auth/auth';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { CallNumber } from '@ionic-native/call-number';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
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

import { LoginPage } from '../login/login';
import { EmailComposer } from '@ionic-native/email-composer';
import { ServiceProvider } from '../../providers/service/service';
import { File } from '@ionic-native/file';

/**
 * Generated class for the DetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
   selector: 'page-detail',
   templateUrl: 'detail.html',
 })
 export class DetailPage {

   listing: any;
   user: any;
   currentUser: any;
   isOwner: boolean;
   isFavorite: any;
   myLoading: any;
   @ViewChild('map') mapElement: ElementRef;
   private map:GoogleMap;
   private location: LatLng;
   public latLng: any = "my string";
   public imageModal: any;

   constructor(public navCtrl: NavController, 
     private navParams: NavParams,
     private listingProvider: ListingProvider,
     private auth: AuthServiceProvider,
     private sanitizer: DomSanitizer,
     private photoViewer: PhotoViewer,
     private callNumber: CallNumber,
     private platform: Platform,
     private renderer: Renderer2,
     private cf: ChangeDetectorRef,
     private nativeGeocoder: NativeGeocoder,
     private loadingCtrl: LoadingController,
     private emailComposer: EmailComposer,
     private serviceProvider: ServiceProvider,
     private modalCtrl: ModalController) {



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

   

   ionViewWillEnter() {



     this.serviceProvider.transition();
     this.listing = this.navParams.get('listing');
     
     // this.listing.created_date = new Date().getTime() + this.listing.created_date;

     this.auth.isFavorite(this.listing.id).then((res) => {
       this.isFavorite = res;
     });
     this.location = new LatLng(this.listing.lat, this.listing.lng);
     this.auth.getUserById(this.navParams.get('user_id')).then((user) => {
       this.user = user;
     });
     this.auth.getUser().then((user) => {
       this.currentUser = user;
       if (this.currentUser && this.currentUser.uid == this.listing.user_id){
         this.isOwner = true;
       }
       else{
         this.isOwner = false;
       }
     });
   }

   refreshMap(){
     this.renderer.setStyle(this.mapElement.nativeElement, "height", '200px');
     this.renderer.setStyle(this.mapElement.nativeElement, "zIndex", 9999);
     let element = this.mapElement.nativeElement;
     this.map = GoogleMaps.create(element);
     this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
       let options = {
         target: this.location,
         zoom: 12,
       };
       this.map.moveCamera(options);

       this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe((params) => {
         this.cf.detectChanges();
       });
       
       let marker = {
         disableAutoPan: true, 
         position: {lat: parseFloat(this.listing.lat), lng: parseFloat(this.listing.lng)},
       }
       let markerSync = this.map.addMarker(marker).then((marker) => {
         marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {

         }); 
       });

     });
   }

   ionViewDidLoad(){
     this.platform.ready().then((readySource) => {
       this.listing = this.navParams.get('listing');
       this.location = new LatLng(this.listing.lat, this.listing.lng);
       this.refreshMap();
     });
   }


   getBackground(image) {
     return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
   }

   goEdit(){
     this.navCtrl.push(EditPage, {listing: this.listing}, {animate: false});
   }


   presentImageModal(image, images) {

     this.imageModal = this.modalCtrl.create(ImageModal, { image: image, images: images });
     this.imageModal.onDidDismiss(data => {

       if (data){
         if (data.goDetail){
           this.navCtrl.push(ImageModal, {
             listing: data.listing,
             user_id: data.listing.user_id
           },{animate: false});
         }  
       }


     });
     this.imageModal.present();
   }

   saveFavorite(){
     if (this.auth.authenticated){
       this.presentLoading();
       this.auth.saveFavorite(this.listing).then((res) => {
         this.isFavorite = res;
         this.dismissLoading();
       });
     }
     else{
       this.navCtrl.push(LoginPage, {animate: false});
     }
   }

   goUserProperties(user){
     this.navCtrl.push(UserPropertiesPage, {user: user}, {animate: false});
   }

   call(number){
     this.callNumber.callNumber(number, true).then(() => {
       console.log("save");
     });
   }

   sendEmail(userEmail){
     let email = {
       to: userEmail,
       subject: 'Konleng App' + this.listing.title,
       body: '',
       isHtml: true
     };
     this.emailComposer.open(email);

   }
 }

 @Component({
   selector: 'page-detail',
   templateUrl: 'image.html'
 })
 export class ImageModal {
   public priceRange: any;
   private images: any = [];
   private image: any;
   @ViewChild('imageSlides') slides: Slides;
   constructor(private params: NavParams, 
     public navCtrl: NavController, private sanitizer: DomSanitizer, public viewCtrl: ViewController) {


   }
   goToSlide(index) {
     this.slides.slideTo(2, 500);
   }
   ionViewDidEnter(){
     this.images = this.params.get('images');
     this.image = this.params.get('image');

     let imageIndex = 0;
     for (let i = 0; i < this.images.length; i ++){
       if (this.images[i] == this.image){
         imageIndex = i;
       }
     }
     
     let myInterval = setInterval(() => {
       if(!this.slides || this.slides.length() < 1) {
         console.log('not ready');
       }
       else {
         this.slides.slideTo(imageIndex, 0);
         clearInterval(myInterval);
       }
     }, 50);
     
     


   }
   swipeEvent($e) {
     console.log('E', JSON.stringify($e));
     if($e.offsetDirection == 4){
       // Swiped right, for example:
       console.log('swipe right');
     } else if($e.offsetDirection == 2){
       // Swiped left, for example:
       console.log('swipe left');
     }else if($e.offsetDirection == 1){
       // Swiped left, for example:
       console.log('swipe top');
     }else if($e.offsetDirection == 3){
       // Swiped left, for example:
       console.log('swipe bottom');
     }
   }
   dismiss() {
     let data = { goDetail: false, close: true };
     this.viewCtrl.dismiss(data);
   }
   goDetail(listing){
     let data = {goDetail: true, listing: listing};
     this.viewCtrl.dismiss(data);
   }
 }
