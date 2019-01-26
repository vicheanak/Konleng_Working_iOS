import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { ListingProvider } from '../../providers/listing/listing';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DetailPage } from '../detail/detail';
import { AddProspectPage } from '../../pages/add-prospect/add-prospect';
import { ProspectDetailPage } from '../../pages/prospect-detail/prospect-detail';
import { ServiceProvider } from '../../providers/service/service';
import {AuthServiceProvider} from '../../providers/auth/auth';
import { LoginPage } from '../login/login';

/**
 * Generated class for the ProspectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-prospect',
 	templateUrl: 'prospect.html',
 })
 export class ProspectPage {

 	private prospects: any;
 	private user: any;
 	private listings: any;
 	constructor(public navCtrl: NavController, 
 		public navParams: NavParams, 
 		private listingProvider: ListingProvider,
 		private serviceProvider: ServiceProvider,
 		private platform: Platform,
 		private auth: AuthServiceProvider) {

 	}
 	ionViewWillEnter(){ 
 		this.serviceProvider.transition(); 
 	
 	}

 	ionViewDidEnter(){
 		this.auth.getUser().then((user) => {
 			console.log('THIS USER');
 			console.log(this.user);
 			this.user = user;
 			if (!this.user){
 				this.navCtrl.push(LoginPage, {page: 'prospect'}, {animate: false});
 			}
 			else{
 				this.listingProvider.getProspects().then((data) => {
		 			this.prospects = data;
		 		});
 			}
 		});
 	}


 	

 	goNewProspect() {
		this.navCtrl.push(AddProspectPage, {}, {animate: false});
 	}

 	goProspectDetail(prospect) {
		this.navCtrl.push(ProspectDetailPage, {prospect: prospect}, {animate: false});
 	}

 }
