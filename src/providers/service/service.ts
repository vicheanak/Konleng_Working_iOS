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
      let adId;
      if(this.platform.is('android')) {
          adId = 'ca-app-pub-3976244179029334/3721721036';
        } else if (this.platform.is('ios')) {
          adId = 'ca-app-pub-3976244179029334/8912847276';
        }
        
        this.admob.prepareInterstitial({adId: adId}).then(() => { 
          this.admob.showInterstitial(); 
        });
    }

    showAds(){
      if (this.countAds == 0){
        setTimeout(() => {
          this.presentAds();
        }, 5000);
        this.countAds ++;
      }else if (this.countAds > 0){
        this.countAds ++;
      }
      if (this.countAds == 10){
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
