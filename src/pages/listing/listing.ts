import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NavController, LoadingController, NavParams, Platform, ModalController, ViewController, ActionSheetController } from 'ionic-angular';
import { DetailPage } from '../detail/detail';
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
import { ListingProvider } from '../../providers/listing/listing';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ServiceProvider } from '../../providers/service/service';


/**
 * Generated class for the ListingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 @Component({
   selector: 'page-listing',
   templateUrl: 'listing.html',
 })
 export class ListingPage {
   @ViewChild('listing_map') mapElement: ElementRef;
   private map:GoogleMap;
   private location: LatLng;
   private display: string = 'map';
   private locations: any = [];
   private detailModal: any;
   private listings: any = [];
   private provinces: any = [];
   private province: any;
   private startAfter: number = 0;
   private isNearMe: any;
   private filter: any = {
     sort_by: 'newest',
     keyword: '',
     listing_type: '',
     property_type: '',
     province: '',
     district: '',
     min_price: '',
     max_price: '',
     page: 0
   };
   private newLocations: any;
   private land_icon: MarkerIcon;
   private house_icon: MarkerIcon;
   private apartment_icon: MarkerIcon;
   private commercial_icon: MarkerIcon;
   private room_icon: MarkerIcon;
   private isFirebaseQuery: boolean;
   private tmpListings: any;
   private newListings: any = [];
   private myLoading: any;
   private polygons: any;
   private listingObjectIDs: any = [];
   private initialMapLoad: boolean = true;
   constructor(private platform: Platform, 
     public actionSheetCtrl: ActionSheetController, 
     private navCtrl: NavController, 
     private navParams: NavParams, 
     private modalCtrl: ModalController,
     private cf: ChangeDetectorRef,
     private viewCtrl: ViewController,
     private renderer: Renderer2,
     private listingProvider: ListingProvider,
     private sanitizer: DomSanitizer,
     private serviceProvider: ServiceProvider,
     private loadingCtrl: LoadingController
     ) {
     this.serviceProvider.showAds();
    

     this.land_icon = {
       url: 'https://res.cloudinary.com/konleng/image/upload/v1548063321/land_icon.png',
       size: {
         width: 30,
         height: 30
       }
     } as MarkerIcon;
     this.house_icon = {
       url: 'https://res.cloudinary.com/konleng/image/upload/v1548063321/house_icon.png',
       size: {
         width: 30,
         height: 30
       },
     } as MarkerIcon;
     this.apartment_icon = {
       url: 'https://res.cloudinary.com/konleng/image/upload/v1548063322/apartment_icon.png',
       size: {
         width: 30,
         height: 30
       }
     } as MarkerIcon;
     this.commercial_icon = {
       url: 'https://res.cloudinary.com/konleng/image/upload/v1548063322/commercial_icon.png',
       size: {
         width: 30,
         height: 30
       }
     } as MarkerIcon;
     this.room_icon = {
       url: 'https://res.cloudinary.com/konleng/image/upload/v1548063322/room_icon.png',
       size: {
         width: 30,
         height: 30
       }
     } as MarkerIcon;

     this.provinces = this.listingProvider.getProvinces();

     this.isNearMe = this.navParams.get('isNearMe');


   }


   save(event, listing){
     event.stopPropagation();

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

   loadMoreLocations(){
     let newLocations:any = [];
     for (let newListing of this.newListings){
       let icon = this.land_icon;
       if (newListing.property_type == 'land'){
         icon = this.land_icon;
       }
       if (newListing.property_type == 'house'){
         icon = this.house_icon;
       }
       if (newListing.property_type == 'apartment'){
         icon = this.apartment_icon;
       }
       if (newListing.property_type == 'commercial'){
         icon = this.commercial_icon;
       }
       if (newListing.property_type == 'room'){
         icon = this.room_icon;
       }
       let formatter = new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         minimumFractionDigits: 0
       });

       let price = formatter.format(newListing.price);

       let location = {
         title: price,
         disableAutoPan: true, 
         icon: icon, 
         position: {lat: parseFloat(newListing.lat), lng: parseFloat(newListing.lng)},
         listing: newListing
       }
       
       this.map.addMarker(location).then((marker) => {
         marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {
           let listing = location.listing;
           if (listing){
             this.presentDetailModal(listing);  
           }
         }); 
       });
     
     }
   
   }

   loadLocations(){
     for (let listing of this.listings){
       let icon = this.land_icon;
       if (listing.property_type == 'land'){
         icon = this.land_icon;
       }
       if (listing.property_type == 'house'){
         icon = this.house_icon;
       }
       if (listing.property_type == 'apartment'){
         icon = this.apartment_icon;
       }
       if (listing.property_type == 'commercial'){
         icon = this.commercial_icon;
       }
       if (listing.property_type == 'room'){
         icon = this.room_icon;
       }
       let formatter = new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         minimumFractionDigits: 0
       });

       let price = formatter.format(listing.price);
       this.locations.push({
         title: price,
         disableAutoPan: true, 
         icon: icon, 
         position: {lat: parseFloat(listing.lat), lng: parseFloat(listing.lng)},
         listing: listing
       });
     }
   }


   refreshLocations(){
     this.locations = [];
     this.loadLocations();
   }

   ionViewDidLoad() {
     
     // this.presentLoading();
     

   }



   refreshMap(){

     let height = this.platform.height() - 160 + 'px';
     this.renderer.setStyle(this.mapElement.nativeElement, "height", height);
     // this.renderer.setStyle(this.mapElement.nativeElement, "marginTop", '5px');


     let element = this.mapElement.nativeElement;
     this.map = GoogleMaps.create(element);



     this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
       
       this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe((data) => {
        

         this.polygons = [
         data[0].farLeft.lat,
         data[0].farLeft.lng,
         data[0].farRight.lat,
         data[0].farRight.lng,
         data[0].nearRight.lat,
         data[0].nearRight.lng,
         data[0].nearLeft.lat,
         data[0].nearLeft.lng];      

         // this.searchHere();   
       });

       this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe((data) => {
         let positionInterval = setTimeout(() => {
         let position:any = this.map.getCameraPosition();
         
           
           if (position){
               this.polygons = [
               position.farLeft.lat,
               position.farLeft.lng,
               position.farRight.lat,
               position.farRight.lng,
               position.nearRight.lat,
               position.nearRight.lng,
               position.nearLeft.lat,
               position.nearLeft.lng];  
               this.searchHere(); 
               // clearInterval(positionInterval);
           }
         }, 500);
         
       });




       this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(() => {

         try{
           this.detailModal.dismiss();
         }catch(e){

         }
       });
       if (this.isNearMe){
         this.map.getMyLocation().then((resp) => {
           this.location = new LatLng(resp.latLng.lat, resp.latLng.lng);
           let options = {
             target: this.location,
             zoom: 13,
           };
           this.map.moveCamera(options);  
         });
       }
       else{
         let options = {
           target: this.location,
           zoom: 13,
         };
         this.map.moveCamera(options);  
       }
       

       // this.addMarkers();
     }, (error) => {
       console.error('error map 2', JSON.stringify(error));
     }).catch((error) => {
       console.error('Error Map', JSON.stringify(error));
     });

   }

   resetMapContainer(div:string,visible:boolean){
      
      this.map.setDiv('map');
      this.map.setVisible(visible);
      setTimeout(()=>{
        // hack to fix occasionally disappearing map
        this.map.setDiv('map');
      }, 1000);   

      // setTimeout(()=>{
      //   if(this.map){
      //     this.map.setDiv(div);
      //     this.map.setVisible(visible);
      //   }
      // },600) // timeout is a bit of a hack but it helps here
    }

   segmentChanged(e){
     // this.map.setVisible(false);
     //  this.map.setDiv(null);
      // this.resetMapContainer('map',false); // assumes div has id of map
     this.cf.detectChanges();
     

     try{
       this.detailModal.dismiss();
     }
     catch(e){
     }
     

   }

  

   ionViewWillEnter(){
     
     this.serviceProvider.transition();

     if (!this.initialMapLoad) {
       // subsequent loads...
       // this.resetMapContainer('map',true); // assumes div has id of map
     } else {
       // first load...
       this.initialMapLoad = false;
       let province = this.navParams.get('province');
       let listing_type = this.navParams.get('listing_type');
       let property_type = this.navParams.get('property_type');
       let keyword = this.navParams.get('keyword');
       if (province){
         for (let p of this.provinces){
           if (p.id == province){
             this.province = p;
           }
         }  
         this.filter.province = province;

         this.location = new LatLng(this.province.lat, this.province.lng);
       }
       else{
           this.location = new LatLng(11.556186, 104.927834);
       }
       this.filter.listing_type = listing_type;
       this.filter.sort_by = 'newest';
       this.filter.property_type = property_type;
       this.filter.keyword = keyword;
       this.filter.page = 1;
       this.refreshMap(); 


       let myInterval = setInterval(() => {

         if (this.polygons){

           clearInterval(myInterval);
           if (!this.filter.province){
             this.filter.location = this.polygons.join(',');  
           }


           this.listingProvider.getAll(this.filter).then((listings) => {

             // this.listings = listings;
             let oldListings: any = listings;
             oldListings.forEach((oldListing) => {
               // delete oldListing.description;
               delete oldListing._highlightResult;
               delete oldListing._geoloc;

               this.listingObjectIDs.push(oldListing.objectID);
               this.listings.push(oldListing);
             })
             this.refreshLocations();
             this.addMarkers();

             // this.dismissLoading();
           });
         }

       }, 100);



    }

   }

   ionViewWillLeave(){
     
     try{
       let data = { goDetail: false, close: true };
       this.detailModal.dismiss(data);
     }
     catch(e){
     }
   }
   searchHere(){
     
     // this.presentLoading();
     // this.map.clear().then(() => {

     // });
     let center = this.map.getCameraPosition().target;
       this.filter.page = 1;
       this.filter.location = this.polygons.join(',');
       
       this.newListings = [];
       this.listingProvider.getAll(this.filter).then((listings) => {
            let newLists: any = listings;
            var tmpNewListings: any = listings;
            // let tmpListings: any = [];
            let tmpListingObjectIDs: any = [];
            // this.newListings = [];
            
            let count = 0;
            newLists.forEach((newList, index, object) => {
              delete newList.description;
              delete newList._highlightResult;
              delete newList._geoloc;
              this.listingObjectIDs.forEach((objectId) => {

                if (newList.objectID == objectId){
                  count ++;
                  delete tmpNewListings[index];
                }
              });
            });
            
            
            tmpNewListings.forEach((tmpList) => {
                this.listingObjectIDs.push(tmpList.objectID);
                this.listings.push(tmpList);
                this.newListings.push(tmpList);
            });
            
            

            // console.log('tmpNewListings', tmpNewListings.length);
            
            // this.newListings = listings;
            // this.listings = tmpListingObjectIDs;
            this.loadMoreLocations();
            // this.addMoreMarkers();
            
           // this.listings = listings;
           // this.refreshLocations();
           // this.addMarkers();
         
         
       });

     
   }

   loadMore(){
     this.filter.page++;
     this.listingProvider.getAll(this.filter).then((listings) => {
       this.newListings = listings;
       for(let l of this.newListings){
         this.listings.push(l);
       }
       this.loadMoreLocations();
       this.addMoreMarkers();
     });  
   }
   doInfinite(infiniteScroll) {
     //ServiceProvider
     
     this.filter.page++;
     this.listingProvider.getAll(this.filter).then((listings) => {
       this.newListings = listings;
       for(let l of this.newListings){
         this.listings.push(l);
       }
       this.loadLocations();
       infiniteScroll.complete();
     });
   }
   // https://firebasestorage.googleapis.com/v0/b/konleng-cloud.appspot.com/o/blue-dot.png?alt=media&token=79ea3640-d17c-445e-82be-7a6e01fbdb66
   addMarkers() {

     for(let i = 0; i < this.locations.length; i ++){
       let markerSync = this.map.addMarker(this.locations[i]).then((marker) => {
         marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {
           let listing = this.locations[i].listing;
           if (listing){
             this.presentDetailModal(listing);  
           }
         }); 
       });
     } 

     
     // let markersWindows = [];
// let markerCluster = this.map.addMarkerCluster({
//   markers: this.locations,
//   icons: [
//   {
//     url: "https://firebasestorage.googleapis.com/v0/b/konleng-cloud.appspot.com/o/cluster.png?alt=media&token=f76f7250-098a-45d5-8a6d-3fcd753bc718", 
//     anchor: {x: 16, y: 16},
//     label: {
//       color: 'white',
//       bold: true,
//       fontSize: 13
//     } as MarkerLabel
//   }
//   ]
// }).then((marker) => {
//   marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {

//     let loc = params[1].get('listing');
//     this.presentDetailModal(loc);
//   }); 
// });

     

   }

   addMoreMarkers(){
     for(let i = 0; i < this.newLocations.length; i ++){
       let markerSync = this.map.addMarker(this.newLocations[i]).then((marker) => {
         marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {
           let loc = this.newLocations[i];
           if (loc){
             this.presentDetailModal(loc);  
           }
         }); 
       });
     } 
   }

   goDetail(listing){
     this.navCtrl.push(DetailPage, {
       listing: listing,
       user_id: listing.user_id
     }, {animate: false});
   }
   presentFilterModal() {
     let filterModal = this.modalCtrl.create(FilterModal, { filter: this.filter });
     filterModal.onDidDismiss(data => {
       if (!data.close){
         this.isFirebaseQuery = false;
         this.listings = data.listing;
         this.refreshLocations();
         if (this.display == 'map'){
           this.map.clear().then(() => {
             this.addMarkers();
           });  
         }
         this.filter = data.filter;

         if (!data.filter.province){
           this.province = '';
         }
         for (let p of this.provinces){
           if (p.id == this.filter.province){
             this.province = p;
           }
         }

       }

     });
     filterModal.present();
   }
   presentDetailModal(listing) {
     // console.log('listing', listing);
     try{
       let data = { goDetail: false, close: true };
       this.detailModal.dismiss(data);
     }catch(e){
     }
     
     this.detailModal = this.modalCtrl.create(DetailModal, { listing: listing }, {cssClass: 'detail-modal' });
     this.detailModal.onDidDismiss(data => {

       if (data){
         if (data.goDetail){

           this.navCtrl.push(DetailPage, {
             listing: data.listing,
             user_id: data.listing.user_id
           },{animate: false});
         }  
       }


     });
     this.detailModal.present();
   }
 }
 @Component({
   selector: 'page-listing',
   templateUrl: 'filter.html'
 })
 export class FilterModal {
   public priceRange: any;
   public provinces: any = [];
   public districts: any = [];
   private myLoading: any;
   private filter: any = {
     sort_by: '',
     keyword: '',
     listing_type: '',
     property_type: '',
     province: '',
     district: '',
     min_price: '',
     max_price: ''
   };
   constructor(params: NavParams, 
     public viewCtrl: ViewController,
     private listingProvider: ListingProvider,
     private loadingCtrl: LoadingController) {

     this.filter = params.get('filter');
     this.provinces = this.listingProvider.getProvinces();
     this.districts = this.listingProvider.getDistricts(this.filter.province);
   }
   dismiss() {
     let data = { 'close': true };
     this.viewCtrl.dismiss(data);
   }

   resetFilter(){
     this.filter = {
       sort_by: '',
       keyword: '',
       listing_type: '',
       property_type: '',
       province: '',
       district: '',
       min_price: '',
       max_price: ''
     };
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

   search(){
     // this.presentLoading();
     this.listingProvider.getAll(this.filter).then((listings) => {
       let data = {listing: listings, filter: this.filter};
       // this.dismissLoading();
       this.viewCtrl.dismiss(data);
     });
   }

   provinceChange(){
     this.districts = this.listingProvider.getDistricts(this.filter.province);
   }
 }
 @Component({
   selector: 'page-listing',
   templateUrl: 'detail.html'
 })
 export class DetailModal {
   public priceRange: any;
   private listing: any;
   constructor(private params: NavParams, public navCtrl: NavController, private sanitizer: DomSanitizer, public viewCtrl: ViewController) {


   }
   ionViewDidEnter(){
     
     this.listing = this.params.get('listing');
     
   }
   getBackground(image) {
     return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
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