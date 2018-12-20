import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { SearchPage } from '../pages/search/search';
import { TranslateService } from '@ngx-translate/core';

import { Storage } from '@ionic/storage';

import { AuthServiceProvider } from '../providers/auth/auth';
import { ServiceProvider } from '../providers/service/service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Environment } from '@ionic-native/google-maps';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;
  private currentLang: any = 'kh';
  

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    translate: TranslateService,
    private storage: Storage,
    private auth: AuthServiceProvider,
    private serviceProvider: ServiceProvider,
    private screenOrientation: ScreenOrientation) {

    this.auth.getRedirectResult();


    platform.ready().then(() => {



      if (document.URL.startsWith('https')){
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        Environment.setEnv({
          API_KEY_FOR_BROWSER_RELEASE: "AIzaSyBUuXZ2zRqiAzdOvSvc6YGN1odBEX3qyrw",
          API_KEY_FOR_BROWSER_DEBUG: "AIzaSyBUuXZ2zRqiAzdOvSvc6YGN1odBEX3qyrw"
        });
      }
      else{
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

  


}
