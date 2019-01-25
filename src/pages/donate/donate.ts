import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the DonatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-donate',
  templateUrl: 'donate.html',
})
export class DonatePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,private serviceProvider: ServiceProvider) {
  }

  ionViewWillEnter(){ this.serviceProvider.transition(); }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DonatePage');
  }

}
