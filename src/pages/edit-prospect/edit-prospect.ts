import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the EditProspectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-edit-prospect',
  templateUrl: 'edit-prospect.html',
})
export class EditProspectPage {

  constructor(public navCtrl: NavController, private serviceProvider: ServiceProvider,
  	public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProspectPage');
  }

}
