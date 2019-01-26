import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service';
import {AuthServiceProvider} from '../../providers/auth/auth';
import { ListingProvider } from '../../providers/listing/listing';
import { EditProspectPage } from '../../pages/edit-prospect/edit-prospect';


/**
 * Generated class for the ProspectDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-prospect-detail',
  templateUrl: 'prospect-detail.html',
})
export class ProspectDetailPage {
private prospect: any;
private listing: any;
  constructor(private listingProvider: ListingProvider, public navCtrl: NavController, private serviceProvider: ServiceProvider, public navParams: NavParams) {
  	this.prospect = this.navParams.get('prospect');
  }

  ionViewWillEnter(){ this.serviceProvider.transition(); }

  ionViewDidLoad() {
  	
    console.log('ionViewDidLoad ProspectDetailPage');
  }

  goEditProspect(prospect){
  	this.listing = this.listingProvider.getListing(prospect.listing_id).then((listing) => {
  		this.navCtrl.push(EditProspectPage, {prospect: prospect, listing: listing}, {animate: false});
  	});
  	
  }

}
