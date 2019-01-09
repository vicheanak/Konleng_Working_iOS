import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { ListingProvider } from '../../providers/listing/listing';
import { AuthServiceProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';
/**
 * Generated class for the AppBuilderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
 	selector: 'page-app-builder',
 	templateUrl: 'app-builder.html',
 })
 export class AppBuilderPage {
 	@ViewChild('descriptionInput') myInput: ElementRef;


 	private app_builder: any = {
 		agencyName: '',
 		phone: '',
 		logo: '',
 		total_properties: '',
 		status: 'Waiting for Review',
 		created_at: new Date()
 	}

 	private myLoading: any;
 	private user: any;
 	constructor(private listingProvider: ListingProvider, 
 		public navCtrl: NavController, 
 		public navParams: NavParams,
 		private loadingCtrl: LoadingController,
 		private auth: AuthServiceProvider,
 		private alertCtrl: AlertController) {
 	}

 	ionViewDidEnter(){
 		this.auth.getUser().then((user) => {
 			this.user = user;
 			if (!this.user){
 				this.navCtrl.push(LoginPage, {page: 'add'}, {animate: false});
 			}
 			else{
 				this.app_builder.user_id = this.user.uid;
 				this.app_builder.email = this.user.email;
 				this.app_builder.phone1 = this.user.phone1 ? this.user.phone1 : '';
 				this.app_builder.phone2 = this.user.phone2 ? this.user.phone2 : '';
 				this.app_builder.displayName = this.user.displayName ? this.user.displayName : '';
 				this.app_builder.userType = this.user.userType ? this.user.userType : '';
 				this.app_builder.agencyName = this.user.agencyName ? this.user.agencyName : '';
 			}
 		});

 	}

 	ionViewDidLoad() {
 		console.log('ionViewDidLoad ReportPage');
 	}

 	presentLoading() {
 		this.myLoading = this.loadingCtrl.create({
 			spinner: 'ios'
 		});

 		this.myLoading.present();
 	}

 	dismissLoading(){
 		this.myLoading.dismiss();
 	}

 	resize() {
 		var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
 		var scrollHeight = element.scrollHeight;
 		element.style.height = scrollHeight + 'px';
 		this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
 	}

 	submit(){
 		this.presentLoading();
 		this.listingProvider.submitAppBuilder(this.app_builder).then((transaction) => {
 			this.showConfirmationMessage();
 		});
 	}

 	showConfirmationMessage() {
 		const confirm = this.alertCtrl.create({
 			title: 'App Request Submitted!',
 			buttons: [
 			{
 				text: 'Done',
 				handler: () => {
 					this.navCtrl.pop();
 					this.dismissLoading();
 					console.log('Agree clicked');
 				}
 			}
 			]
 		});
 		confirm.present();
 	}

 }
