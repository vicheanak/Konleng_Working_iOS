import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform, AlertController } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';


import { Device } from '@ionic-native/device';
/*
  Generated class for the FcmProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FcmProvider {

  constructor(
    public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform,
    private device: Device,
    private alertCtrl: AlertController
  ) {}

   // Get permission from the user
  async getToken() {

  	let token;

  	this.firebaseNative.subscribe('news');

	if (this.platform.is('android')) {
		token = await this.firebaseNative.getToken()
	} 

	if (this.platform.is('ios')) {
		token = await this.firebaseNative.getToken();
		await this.firebaseNative.grantPermission();
	} 

	return this.saveTokenToFirestore(token)

  }

  async presentAlert(header, msg) {
	const alert = await this.alertCtrl.create({
			message: header,
			subTitle: msg,
			buttons: ['OK']
		});

		await alert.present();
	}

  // Save the token to firestore
  private saveTokenToFirestore(token) {

  	if (!token) return;

  	
	const devicesRef = this.afs.collection('devices')

	const docData = { 
		token,
		uuid: this.device.uuid,
		version: this.device.version,
		platform: this.device.platform,
		model: this.device.model,
		manufacturer: this.device.manufacturer,
		date: this.getFormattedDate()
	}

	return devicesRef.doc(token).set(docData)

  }

  getFormattedDate() {
  	let date = new Date();
  	let str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  	return str;
  }

  // Listen to incoming FCM messages
  listenToNotifications() {
  	return this.firebaseNative.onNotificationOpen();
  }

}