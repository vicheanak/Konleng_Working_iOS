import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';
/**
 * Generated class for the TermsOfUsePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-terms-of-use',
  templateUrl: 'terms-of-use.html',
})
export class TermsOfUsePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private serviceProvider: ServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TermsOfUsePage');
  }

  

   ionViewWillEnter(){ this.serviceProvider.transition(); }

}
