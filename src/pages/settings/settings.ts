import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ContactUsPage } from '../contact-us/contact-us';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';
import { TermsOfUsePage } from '../terms-of-use/terms-of-use';
import { AppRate } from '@ionic-native/app-rate';
import { ServiceProvider } from '../../providers/service/service';
/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
   selector: 'page-settings',
   templateUrl: 'settings.html',
 })
 export class SettingsPage {

   constructor(public navCtrl: NavController, 
     public navParams: NavParams,
     private appRate: AppRate,
     private serviceProvider: ServiceProvider) {

   }
   ionViewWillEnter(){ this.serviceProvider.transition(); }


   ionViewDidLoad() {
     console.log('ionViewDidLoad SettingsPage');
   }

   goContact() {
     this.navCtrl.push(ContactUsPage, {}, {animate: false});
   }
   goPrivacyPolicy() {
     this.navCtrl.push(PrivacyPolicyPage, {}, {animate: false});
   }
   goTermsOfUse() {
     this.navCtrl.push(TermsOfUsePage, {}, {animate: false});
   }

   rate(){
     this.appRate.preferences.storeAppURL = {
       ios: '1445389232',
       android: 'market://details?id=com.konleng.app',
     };


     this.appRate.promptForRating(true);

   }

 }
