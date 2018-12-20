import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
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
   selector: 'page-my-properties',
   templateUrl: 'my-properties.html',
 })
 export class MyPropertiesPage {

   private activeListings: any;
   private inactiveListings: any;
   public display: string = 'active';
   private user: any;
   constructor(public navCtrl: NavController, 
     public navParams: NavParams,
     private listingProvider: ListingProvider,
     private sanitizer: DomSanitizer,
     private cf: ChangeDetectorRef,
     private serviceProvider: ServiceProvider) {

   }
   ionViewWillEnter(){ this.serviceProvider.transition(); }


   ionViewDidLoad() {
     this.user = this.navParams.get('user');
     this.listingProvider.getUserListings(this.user.uid, 1).then((listings) => {
       console.log('listings', listings);
       this.activeListings = listings;
     }).catch((error) => {
       console.error('ERROR listing', error);
     });
     // this.listingProvider.getUserListings(this.user.uid, 0).then((listings) => {
     //   this.inactiveListings = listings;
     // });
   }

   segmentChanged(){
     this.cf.detectChanges();
     
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
