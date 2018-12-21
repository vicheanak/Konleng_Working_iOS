import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ListingProvider } from '../../providers/listing/listing';

/**
 * Generated class for the ReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {
	@ViewChild('descriptionInput') myInput: ElementRef;
	private issue: any = {
		number: '',
		title: '',
		description: '',
		created_at: new Date()
	}

	private myLoading: any;

  constructor(private listingProvider: ListingProvider, 
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private loadingCtrl: LoadingController) {
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
  	this.listingProvider.sendReport(this.issue).then((transaction) => {
  		this.navCtrl.pop();
  		this.dismissLoading();
  	});
  }

}
