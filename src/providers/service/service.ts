import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { AdMobPro } from '@ionic-native/admob-pro';
/*
  Generated class for the ServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
  */
  @Injectable()
  export class ServiceProvider {
    public isAdsShown: boolean = false;
    private countAds: any = 0;

    constructor(public http: HttpClient, 
      private storage: Storage,
      public translate: TranslateService,
      private nativePageTransitions: NativePageTransitions,
      private admob: AdMobPro,
      private platform: Platform) {

      this.storage.get('language').then((val) => {

        this.translate.use(val);

      });

      this.storage.get('first_time_load').then((val) => {
        if (!val){
          this.storage.set('first_time_load', '1');
          window.location.reload();
        }
      });
    }

    transition(){
      if (!document.URL.startsWith('https')){
        let options: NativeTransitionOptions = {
          duration: 300,
          slowdownfactor: 3,
          slidePixels: 20,
          iosdelay: 100,
          androiddelay: 150,
          fixedPixelsTop: 0,
          fixedPixelsBottom: 60
        };

        this.nativePageTransitions.fade(options);
      }
      
    }

    getGeocode(address){
      return new Promise<Object>((resolve, reject) => {
        let url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=AIzaSyBUuXZ2zRqiAzdOvSvc6YGN1odBEX3qyrw';
        this.http.get(url).subscribe((results) => {
          if (results['results']){
            resolve(results['results'][0]['geometry']['location']);  
          }
          else{
            reject('No Result');
          }
        });
      });
    }

    
    presentAds(){
      let videoId;
      let bannerId;
      if(this.platform.is('android')) {
          videoId = 'ca-app-pub-3976244179029334/3721721036';
          bannerId = 'ca-app-pub-3976244179029334/9581535883';
        } else if (this.platform.is('ios')) {
          videoId = 'ca-app-pub-3976244179029334/8912847276';
          bannerId = 'ca-app-pub-3976244179029334/8048962361';
        }
        this.admob.prepareInterstitial({adId: videoId})
        .then(() => { 
          this.admob.showInterstitial(); 
        });
    }

    showAds(){
      if (this.countAds == 0){
        setTimeout(() => {
          console.log('PRESENT ADS');
          this.presentAds();
        }, 500);
        this.countAds ++;
      }else if (this.countAds > 0){
        this.countAds ++;
      }
      if (this.countAds == 5){
        this.countAds = 0;
      }
    }
    

    getLanguage(){
      return new Promise<Object>((resolve, reject) => {
        this.storage.get('language').then((val) => {
          resolve(val);
        });
      });
    }

    setLanguage(val){
      this.storage.set('language', val);
    }


    switchLanguage(){

      this.storage.get('language').then((val) => {
        if (val == 'en'){
          this.translate.use('kh');		
          this.storage.set('language', 'kh');

        }
        else if(val == 'kh'){
          this.translate.use('en');
          this.storage.set('language', 'en');
        }
      });
    }

  }
