import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import {ListingPage} from '../listing/listing';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { ListingProvider } from '../../providers/listing/listing';
import { ServiceProvider } from '../../providers/service/service';


@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

	public queryText: string;
  private provinces: any = [];
  private provinceData: any = [];
  private provinceDisplay: any = [];
  private isWeb: boolean = false;

  constructor(public navCtrl: NavController, 
  	public translate: TranslateService,
  	private storage: Storage,
    private listingProvider: ListingProvider,
    private serviceProvider: ServiceProvider,
    private modalCtrl: ModalController) {

  	this.queryText = '';

    if (document.URL.startsWith('https')){
      this.isWeb = true;
    }
    

  }

  ionViewWillEnter() {
    this.listingProvider.getCounter().then((counter) => {
      this.provinces = counter;
    });

   this.serviceProvider.transition();

  }

  doRefresh(refresher) {
    this.listingProvider.getCounter().then((counter) => {
      this.provinces = counter;
      refresher.complete();
    });
  }

  goListing(province, listing_type){
    this.presentPropertyTypeModal(province, listing_type);
    // this.navCtrl.push(ListingPage, {province: province, listing_type: listing_type}, {animate: false});

  }

  searchByKeyword(){
    this.navCtrl.push(ListingPage, {keyword: this.queryText}, {animate: false});
  }

  switchLanguage(){
    this.serviceProvider.switchLanguage();
  }

  search(data, listing_type) {
    console.log('listing_type', listing_type);
    this.navCtrl.push(ListingPage, {property_type: data, listing_type: listing_type}, {animate: false});  
  }

  searchWithListingType(property_type, listing_type){

  }
  

  presentPropertyTypeModal(province, listing_type) {
     let propertyTypeModal = this.modalCtrl.create(PropertyTypeModal, { province: province, listing_type: listing_type });
     propertyTypeModal.onDidDismiss(data => {
       if (!data.close){
         console.log(JSON.stringify(data));
         this.navCtrl.push(ListingPage, data, {animate: false});
       }
     });
     propertyTypeModal.present();
   }
}

@Component({
   selector: 'page-search',
   templateUrl: 'property_type.html'
 })
 export class PropertyTypeModal {
   private province: any;
   private listing_type: any;
   constructor(params: NavParams, 
     public viewCtrl: ViewController) {

     this.province = params.get('province');
     this.listing_type = params.get('listing_type');
     
   }

   dismiss() {
     let data = { 'close': true };
     this.viewCtrl.dismiss(data);
   }

   search(property_type){
       let data = { 'province': this.province, 
       'listing_type': this.listing_type, 
       'property_type': property_type };
       this.viewCtrl.dismiss(data);
   }

 }
