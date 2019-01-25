import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the AddProspectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-add-prospect',
  templateUrl: 'add-prospect.html',
})
export class AddProspectPage {

  constructor(public navCtrl: NavController, private serviceProvider: ServiceProvider,
  	public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddProspectPage');
  }

}
