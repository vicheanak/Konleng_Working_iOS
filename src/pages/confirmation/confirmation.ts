import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import { DetailPage } from '../detail/detail';
import { MyPropertiesPage } from '../my-properties/my-properties';
import { AddPage } from '../add/add';

/**
 * Generated class for the ConfirmationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
   selector: 'page-confirmation',
   templateUrl: 'confirmation.html',
 })
 export class ConfirmationPage {

   constructor(public navCtrl: NavController, public navParams: NavParams) {
   }

   ionViewDidEnter() {
     let listingId = this.navParams.get('id');

   }

   ionViewWillLeave(){
     this.navCtrl.setRoot(AddPage);
   }

   goPreview(){
     const tabs = this.navCtrl.parent;
     tabs.select(2)
     .then(() => tabs.getSelected().push(MyPropertiesPage, {}, { animate: false }))
     .then(() => tabs.getSelected().push(DetailPage, {}, { animate: false }))
     .then(() => this.navCtrl.popToRoot());
     
   }

   goMyProperties(){
     const tabs = this.navCtrl.parent;
     tabs.select(2)
     .then(() => tabs.getSelected().push(MyPropertiesPage, {}, { animate: false }))
     .then(() => this.navCtrl.popToRoot());
     

   }

 }
