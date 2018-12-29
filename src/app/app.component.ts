import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { SearchPage } from '../pages/search/search';
import { TranslateService } from '@ngx-translate/core';
import { DetailPage } from '../pages/detail/detail';

import { Storage } from '@ionic/storage';
import { AppRate } from '@ionic-native/app-rate';
import { AuthServiceProvider } from '../providers/auth/auth';
import { ServiceProvider } from '../providers/service/service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Environment } from '@ionic-native/google-maps';
import { FcmProvider } from '../providers/fcm/fcm';
import { ListingProvider } from '../providers/listing/listing';
import { Diagnostic } from '@ionic-native/diagnostic';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = TabsPage;
  private currentLang: any = 'kh';

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    translate: TranslateService,
    private storage: Storage,
    private auth: AuthServiceProvider,
    private serviceProvider: ServiceProvider,
    private screenOrientation: ScreenOrientation,
    private fcm: FcmProvider,
    private toastCtrl: ToastController,
    private appRate: AppRate,
    private listingProvider: ListingProvider,
    private diagnostic: Diagnostic) {


    if (document.URL.startsWith('https')){
      this.auth.getRedirectResult();
    }
    else{
      splashScreen.show();    
    }
    let successCallback = (isAvailable) => { console.log('Is available? ' + isAvailable); };
    let errorCallback = (e) => console.error(e);

    platform.ready().then(() => {
      if (document.URL.startsWith('https')){

        Environment.setEnv({
          API_KEY_FOR_BROWSER_RELEASE: "AIzaSyBUuXZ2zRqiAzdOvSvc6YGN1odBEX3qyrw",
          API_KEY_FOR_BROWSER_DEBUG: "AIzaSyBUuXZ2zRqiAzdOvSvc6YGN1odBEX3qyrw"
        });
      }
      else{
      this.diagnostic.requestCameraAuthorization(true).then((cameraRes) => {
        console.log('CameraRes', cameraRes);
        this.diagnostic.requestLocationAuthorization("when_in_use").then((locRes) => {
          console.log('LocRes', locRes);
        });
      });  

      this.fcm.getToken();

      try{
        this.fcm.listenToNotifications().subscribe((response) => {
          if(response.tap){
              let listingId = response['id'];
              this.listingProvider.getListing(listingId).then((listing) => {
                this.nav.push(DetailPage, {
                  listing: listing,
                  user_id: listing['user_id']
                });
              })
          }else{
            let toast = this.toastCtrl.create({
              message: response.title,
              duration: 3000
            });
            toast.present();
          }
        });
      }catch(err){
       
      }

      this.rateAuto();


      
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        statusBar.styleDefault();

        setTimeout(() => {
          splashScreen.hide();  
        }, 100);
      }

      translate.setDefaultLang(this.currentLang);
      this.serviceProvider.getLanguage().then((val) => {
        if (val){
          this.currentLang = val;
          translate.use(this.currentLang); 
        }
        else{
          this.serviceProvider.setLanguage(this.currentLang);
        }
        
      });
      

    });

  }

  async rateAuto(){
    try {
        this.appRate.preferences = {
          displayAppName: 'Konleng - Real Estate App',
          usesUntilPrompt: 3,
          simpleMode: true,
          promptAgainForEachNewVersion: false,
          useCustomRateDialog: true,
          storeAppURL: {
            ios: '1445389232',
            android: 'market://details?id=com.konleng.app'
          },
          customLocale: {
            title: 'ចូលចិត្ត %@ ដែរទេ?',
            message: 'បើអ្នកចូលចិត្ត, ជួយដាក់ពិន្ទុអោយផង។ សូមអរគុណទុកជាមុន!',
            cancelButtonLabel: 'ទេ',
            laterButtonLabel: 'លើកក្រោយ',
            rateButtonLabel: 'ដាក់ពិន្ទុ'
          },
          callbacks: {
            onRateDialogShow: function(callback){
              
            },
            onButtonClicked: function(buttonIndex){
              
            }
          }
        };

        this.appRate.promptForRating(false);
    } catch(err){
        
       console.error(err);
    }
  }


}
