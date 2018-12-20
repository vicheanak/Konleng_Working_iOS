import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthServiceProvider } from '../../providers/auth/auth';
import { ProfilePage } from '../profile/profile';
import { Storage } from '@ionic/storage';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-register',
 	templateUrl: 'register.html',
 })
 export class RegisterPage {

 	registerError: string;
 	registerForm: FormGroup;
 	myLoading: any;
 	alertMsg: any;

 	constructor(private storage: Storage, private auth: AuthServiceProvider, 
 		fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams,
 		private serviceProvider: ServiceProvider,
 		private loadingCtrl: LoadingController,
 		private alertCtrl: AlertController) {
 		this.registerForm = fb.group({
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
 	dismissMessage(){
 		// this.alertCtrl.dismiss();
 	}
 	signup() {
 		this.presentLoading();
 		let data = this.registerForm.value;
 		let credentials = {
 			email: data.email,
 			password: data.password
 		};
 		this.auth.signUp(credentials).then((user) => {
 			console.log('user', user);
 			this.dismissLoading();
 			this.navCtrl.pop();
 		}).catch((error) => {
 			this.dismissLoading();
 			this.presentAlert('Failed Signup', error.message);
 			console.error('ERROR SIGNUP', JSON.stringify(error));
 		});
 	}

 }
