import { Component } from '@angular/core';
import {  NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfilePage } from '../profile/profile';
import { AuthServiceProvider } from '../../providers/auth/auth';
import { RegisterPage } from '../register/register';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { AddPage } from '../add/add';
import { Storage } from '@ionic/storage';
import { MePage } from '../me/me';
import { MyPropertiesPage } from '../my-properties/my-properties';
import { SavedPage } from '../saved/saved';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-login',
 	templateUrl: 'login.html',
 })
 export class LoginPage {

 	loginForm: FormGroup;
 	loginError: string;
 	myLoading: any;


 	constructor(public alertCtrl: AlertController,
 		public navCtrl: NavController, 
 		public navParams: NavParams,
 		public fb: FormBuilder,
 		private facebook: Facebook,
 		private storage: Storage,
 		private auth: AuthServiceProvider,
 		private loadingCtrl: LoadingController,
 		private serviceProvider: ServiceProvider) {

 		this.loginForm = fb.group({
 			email: ['', Validators.compose([Validators.required, Validators.email])],
 			password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
 		});

 	}
 	ionViewWillEnter(){ this.serviceProvider.transition(); }
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


 	ionViewDidLoad() {
 		console.log("HELLO");
 		console.log('ionViewDidLoad LoginPage');
 		console.log('Login Views', this.navParams.get('page'));
 	}


 	goRegister(){
 		this.navCtrl.push(RegisterPage, {}, {animate: false});
 	}

 	login() {
 		this.presentLoading();
 		let data = this.loginForm.value;

 		if (!data.email) {
 			return;
 		}

 		let credentials = {
 			email: data.email,
 			password: data.password
 		};
 		this.auth.signInWithEmail(credentials)
 		.then(() => {
 			this.dismissLoading();
 			this.navPop();
 		}).catch((error) => {
 			this.dismissLoading();
 			this.presentFailedLogin('Login Failed!', error);
 			// console.log('EROR ==> LOGIN ==> ', JSON.stringify(error));
 			// this.loginError = error;
 		});
 	}

 	

 	promptLostPassword() {
 		const prompt = this.alertCtrl.create({
 			title: 'Lost Password',
 			inputs: [
 			{
 				name: 'phone_number',
 				placeholder: 'Phone Number'
 			}
 			],
 			buttons: [
 			{
 				text: 'Get SMS',
 				handler: data => {
 					this.promptVerification();
 					console.log('Saved clicked', JSON.stringify(data));
 				}
 			}
 			]
 		});
 		prompt.present();
 	}

 	promptVerification() {
 		const prompt = this.alertCtrl.create({
 			title: 'Verify',
 			enableBackdropDismiss: false,
 			inputs: [
 			{
 				name: 'verify_code',
 				placeholder: 'Verify Code',
 				type: 'number'
 			}
 			],
 			buttons: [
 			{
 				text: 'Verify',
 				handler: data => {
 					if (data.verify_code != '1111'){
 						this.promptVerification();
 					}
 					if (data.verify_code == '1111'){
 						this.promptNewPassword();	
 					}
 					
 					
 					console.log('Saved clicked', JSON.stringify(data));
 				}
 			}
 			]
 		});
 		prompt.present();
 	}

 	promptNewPassword() {
 		const prompt = this.alertCtrl.create({
 			title: 'New Password',
 			inputs: [
 			{
 				name: 'new_password',
 				placeholder: 'New Password'
 			},
 			{
 				name: 'confirm_password',
 				placeholder: 'Confirm Password'
 			},
 			],
 			buttons: [
 			{
 				text: 'Save',
 				handler: data => {
 					// this.presentSuccess();
 					console.log('Saved clicked', JSON.stringify(data));
 				}
 			}
 			]
 		});
 		prompt.present();
 	}

 	presentAlert(title, msg) {
 		const prompt = this.alertCtrl.create({
 			title: title,
 			message: msg,
 			buttons: [
 			{
 				text: 'Ok',
 				handler: data => {
 					console.log('Saved clicked', JSON.stringify(data));
 				}
 			}
 			]
 		});
 		prompt.present();
 	}

 	presentFailedLogin(title, msg) {
 		const prompt = this.alertCtrl.create({
 			title: title,
 			message: msg,
 			buttons: [
 			{
 				text: '+ Sign Up!',
 				handler: data => {
 					// prompt.dismiss();
 					this.goRegister();

 				}
 			},
 			{
 				text: 'Try Again',
 				handler: data => {
 					console.log('Saved clicked', JSON.stringify(data));
 				}
 			}
 			]
 		});
 		prompt.present();
 	}

 	addListin(){
 		console.log('add lsiting');
 	}

 	navPop(){
 		const tabs = this.navCtrl.parent;
 		console.log('anv param', this.navParams.get('page'));
 		if (this.navParams.get('page') == 'add'){
 			tabs.select(1)
 			.then(() => this.navCtrl.popToRoot());
 		}
 		else if (this.navParams.get('page') == 'profile'){
 			this.navCtrl.pop({animate: false});
 			this.navCtrl.push(ProfilePage, {}, {animate: false});
 		}
 		else if (this.navParams.get('page') == 'my-properties'){
 			this.navCtrl.pop({animate: false});
 			this.navCtrl.push(MyPropertiesPage, {}, {animate: false});
 		}
 		else if (this.navParams.get('page') == 'saved'){
 			this.navCtrl.pop({animate: false});
 			this.navCtrl.push(SavedPage, {}, {animate: false});
 		}
 		else if (this.navParams.get('page') == 'me'){
 			this.navCtrl.pop({animate: false});
 			this.navCtrl.push(MePage, {}, {animate: false});
 		}
 	}
 	loginWithFacebook(){
 		this.presentLoading();
 		this.auth.loginWithFacebook().then(() => {
 			this.dismissLoading();
 			this.navPop();
 		})
 	}

 }
