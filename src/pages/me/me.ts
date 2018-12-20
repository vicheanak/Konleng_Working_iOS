import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { ProfilePage } from '../profile/profile';
import { MyPropertiesPage } from '../my-properties/my-properties';
import { SavedPage } from '../saved/saved';
import { FollowPage } from '../follow/follow';
import { SettingsPage } from '../settings/settings';
import { LoginPage } from '../login/login';
import { RegisterPage } from '../register/register';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { SearchPage } from '../search/search';

import { AuthServiceProvider } from '../../providers/auth/auth';
import { ServiceProvider } from '../../providers/service/service';




@Component({
	selector: 'page-me',
	templateUrl: 'me.html'
})
export class MePage {

	myLoading: any;

	constructor(public navCtrl: NavController,
		public translate: TranslateService,
		private storage: Storage,
		private auth: AuthServiceProvider,
		private loadingCtrl: LoadingController,
		private serviceProvider: ServiceProvider) {

		

	}

	logout() {
		this.auth.signOut().then((res) => {
			console.log(res);
		});
		
		// const tabs = this.navCtrl.parent;
		// tabs.select(1)
		// .then(() => tabs.getSelected().push(SearchPage, {}, { animate: false }))
		// .then(() => this.navCtrl.popToRoot());
	}

	ionViewDidLoad(){
		console.log('Me Enter');
	}
	ionViewWillEnter(){ this.serviceProvider.transition(); }
	

	myCallbackFunction = function(_params) {
		return new Promise((resolve, reject) => {
			
			console.log('callbackParam', JSON.stringify(_params));
			resolve();
		});
	}

	goLogin(){
		this.navCtrl.push(LoginPage, {page: 'profile'}, {animate: false});
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

	loginWithFacebook() {
		this.presentLoading();
		this.auth.loginWithFacebook().then(() => {
			this.dismissLoading();
			this.navCtrl.push(ProfilePage, {}, {animate: false});
		})
	}

	

	goProfile(){
		this.auth.getUser().then((user) => {
			if (user){
				this.navCtrl.push(ProfilePage, {}, {animate: false});		
			}
			else{
				this.navCtrl.push(LoginPage, {page: 'profile'}, {animate: false});
			}
		});
	}

	goMyProperties(){
		this.auth.getUser().then((user) => {
			if (user){
				this.navCtrl.push(MyPropertiesPage, {user: user}, {animate: false});		
			}
			else{
				this.navCtrl.push(LoginPage, {page: 'my-properties'}, {animate: false});
			}
		});
	}

	goSaved(){
		this.auth.getUser().then((user) => {
			if (user){
				this.navCtrl.push(SavedPage, {}, {animate: false});		
			}
			else{
				this.navCtrl.push(LoginPage, {page: 'saved'}, {animate: false});
			}
		});
	}

	goFollow(){
		this.auth.getUser().then((user) => {
			if (user){
				this.navCtrl.push(FollowPage, {}, {animate: false});
			}
			else{
				this.navCtrl.push(LoginPage, {page: 'saved'}, {animate: false});
			}
		});
	}

	goSettings(){
		this.navCtrl.push(SettingsPage, {}, {animate: false});
	}



	goRegister(){
		this.navCtrl.push(RegisterPage, {}, {animate: false});
	}



}
