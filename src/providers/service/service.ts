import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
/*
  Generated class for the ServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
  */
  @Injectable()
  export class ServiceProvider {

    constructor(public http: HttpClient, 
      private storage: Storage,
      public translate: TranslateService,
      private nativePageTransitions: NativePageTransitions) {
      
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
