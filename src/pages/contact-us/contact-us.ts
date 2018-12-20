import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the ContactUsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-contact-us',
 	templateUrl: 'contact-us.html',
 })
 export class ContactUsPage {

 	constructor(public navCtrl: NavController, public navParams: NavParams,
 		private serviceProvider: ServiceProvider) {
 	}


 	ionViewWillEnter(){ this.serviceProvider.transition(); }
 	ionViewDidLoad() {
 		console.log('ionViewDidLoad ContactUsPage');
 	}

 }
