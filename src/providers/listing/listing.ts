import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore,
	AngularFirestoreDocument,
	AngularFirestoreCollection,
	DocumentChangeAction,
	Action,
	DocumentSnapshotDoesNotExist,
	DocumentSnapshotExists 
} from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { Observable, from, forkJoin } from 'rxjs';
import { AngularFireStorage, AngularFireStorageReference } from 'angularfire2/storage';
import { map, tap, take, switchMap, mergeMap, expand, takeWhile } from 'rxjs/operators';
import { Base64 } from '@ionic-native/base64';
import { File } from '@ionic-native/file';
import {User, AuthServiceProvider} from '../auth/auth';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';
import 'rxjs/add/observable/forkJoin';


export interface Report { 
	id: number;
	title: string;
	description: string;
}
export interface Listing { 
	property_id: number;
	name: string;
	listing_type:string;
	property_type:string;
	province:string;
	district:string;
	districtName: string;
	provinceName: string;
	title:string;
	price:string;
	description:string;
	bedrooms:string;
	bathrooms:string;
	size:string;
	user_id:string;
	phone_1:string;
	phone_2:string;
	images:string;
	address:string;
	created_date:number;
	link: string;
}
export interface Count{
	phnom_penh: number;
	preah_sihanouk: number;
	kampong_cham: number;
	siem_reap: number;
	battambang: number;
	kandal: number;
	banteay_meanchey: number;
	kampong_chhnang: number;
	kampong_speu: number;
	kampong_thom: number;
	kampot: number;
	kep: number;
	koh_kong: number;
	kratie: number;
	mondulkiri: number;
	oddar_meanchey: number;
	pailin: number;
	preah_vihear: number;
	prey_veng: number;
	pursat: number;
	ratanakiri: number;
	stung_treng: number;
	svay_rieng: number;
	takeo: number;
	tboung_khmum: number;
}
export interface AppBuilder { 
	id: number;
	title: string;
	description: string;
	agency_name: string;
	phone: string;
	logo: string;
	total_properties: number;
	status: string;
	created_at: number;
}

export interface Prospect { 
	id: string;
	name:string;
	phonenumber: string;
	note: string;
	listing_id: string;
	listing_title: string;
	listing_price: string;
	user_uid: string;
	created_at: number;
}




@Injectable()
export class ListingProvider {
	private listingsCollection: AngularFirestoreCollection<Listing>;
	public listings: Observable<Listing[]>;
	private user: firebase.User;
	public listingsList = [];
	private listingDoc: AngularFirestoreDocument<Listing>;
	private listingImages: Observable<[Listing]>;
	private usersCollection: AngularFirestoreCollection<User>;
	private countsCollection: AngularFirestoreCollection<Count>;
	private provinces: any = [];
	private districts: any = [];
	private communes: any = [];
	private reportsCollection: any;
	private appBuilderCollection: any;
	private appBuilders: any;
	private prospectCollection: any;
	private prospects: any;
	private reports: any;
	// private queryUrl: string = 'http://localhost:5000/konleng-cloud/us-central1/webApi/'+'api/v1/listings';
	private queryUrl: string = 'https://konleng.com/api/v1/listings';
	listing: Observable<Listing>;
	constructor(private afStore: AngularFirestore,
		private afStorage: AngularFireStorage,
		private base64: Base64,
		private file: File,
		private auth: AuthServiceProvider,
		private http: HttpClient) {
		this.listingsCollection = this.afStore.collection<Listing>('listings');
		this.listings = this.listingsCollection.valueChanges();
		this.reportsCollection = this.afStore.collection<Report>('reports');
		this.reports = this.reportsCollection.valueChanges();
		this.appBuilderCollection = this.afStore.collection<AppBuilder>('app-builder');
		this.appBuilders = this.appBuilderCollection.valueChanges();
		this.prospectCollection = this.afStore.collection<Prospect>('prospects');
		this.prospects = this.prospectCollection.valueChanges();
		this.usersCollection = this.afStore.collection<User>('users');
		this.countsCollection = this.afStore.collection<Count>('counts');

		this.provinces = [
		{id: "phnom-penh", text: "Phnom Penh", rank: 0, lat: 11.556186, lng: 104.927834},
		{id: "preah-sihanouk", text: "Preah Sihanouk", rank: 1, lat: 10.627543, lng: 103.522141},
		{id: "kampong-cham", text: "Kampong Cham", rank: 2, lat: 11.992419, lng: 105.460255},
		{id: "siem-reap", text: "Siem Reap", rank: 3, lat: 13.364047, lng: 103.860313},
		{id: "battambang", text: "Battambang", rank: 4, lat: 13.028697, lng: 102.989616},
		{id: "kandal", text: "Kandal", rank: 5, lat: 11.126581, lng: 105.057095},
		{id: "banteay-meanchey", text: "Banteay Meanchey", rank: 6, lat: 13.669272, lng: 102.57019},
		{id: "kampong-chhnang", text: "Kampong Chhnang", rank: 7, lat: 12.247577, lng: 104.666982},
		{id: "kampong-speu", text: "Kampong Speu", rank: 8, lat: 11.463341, lng: 104.518507},
		{id: "kampong-thom", text: "Kampong Thom", rank: 9, lat: 12.660275, lng: 104.90717},
		{id: "kampot", text: "Kampot", rank: 10, lat: 10.594242, lng: 104.164032},
		{id: "kep", text: "Kep", rank: 11, lat: 10.521155, lng: 104.373097},
		{id: "koh-kong", text: "Koh Kong", rank: 12, lat: 11.61644, lng: 103.007356},
		{id: "kratie", text: "Kratie", rank: 13, lat: 12.49585, lng: 106.030631},
		{id: "mondulkiri", text: "Mondulkiri", rank: 14, lat: 12.455133, lng: 107.198172},
		{id: "oddar-meanchey", text: "Otdar Meanchey", rank: 15, lat: 14.258524, lng: 103.592289},
		{id: "pailin", text: "Pailin", rank: 16, lat: 12.88682, lng: 102.593388},
		{id: "preah-vihear", text: "Preah Vihear", rank: 17, lat: 13.809622, lng: 104.978586},
		{id: "prey-veng", text: "Prey Veng", rank: 18, lat: 11.490578, lng: 105.334287},
		{id: "pursat", text: "Pursat", rank: 19, lat: 12.526587, lng: 103.926697},
		{id: "ratanakiri", text: "Ratanakiri", rank: 20, lat: 13.723967, lng: 106.991685},
		{id: "stung-treng", text: "Stung Treng", rank: 21, lat: 13.525696, lng: 105.963777},
		{id: "svay-rieng", text: "Svay Rieng", rank: 22, lat: 11.091684, lng: 105.789106},
		{id: "takeo", text: "Takeo", rank: 23, lat: 10.981821, lng: 104.780194},
		{id: "tboung-khmum", text: "Tboung Khmum", rank: 24, lat: 11.921256, lng: 105.651963}
		];


		this.districts = [
		{province_id: "phnom-penh", id: "chamkar-mon", text: "Chamkar Mon"},
		{province_id: "phnom-penh", id: "doun-penh", text: "Doun Penh"},
		{province_id: "phnom-penh", id: "prampir-meakkakra", text: "Prampir Meakkakra"},
		{province_id: "phnom-penh", id: "tuol-kouk", text: "Tuol Kouk"},
		{province_id: "phnom-penh", id: "dangkao", text: "Dangkao"},
		{province_id: "phnom-penh", id: "mean-chey", text: "Mean Chey"},
		{province_id: "phnom-penh", id: "russey-keo", text: "Russey Keo"},
		{province_id: "phnom-penh", id: "sen-sok", text: "Sen Sok"},
		{province_id: "phnom-penh", id: "pou-senchey", text: "Pou Senchey"},
		{province_id: "phnom-penh", id: "chrouy-changvar", text: "Chrouy Changvar"},
		{province_id: "phnom-penh", id: "preaek-pnov", text: "Preaek Pnov"},
		{province_id: "phnom-penh", id: "chbar-ampov", text: "Chbar Ampov"},
		{province_id: "banteay-meanchey", id: "mongkol-borei", text: "Mongkol Borei"},
		{province_id: "banteay-meanchey", id: "phnum-srok", text: "Phnum Srok"},
		{province_id: "banteay-meanchey", id: "preah-netr-preah", text: "Preah Netr Preah"},
		{province_id: "banteay-meanchey", id: "ou-chrov", text: "Ou Chrov"},
		{province_id: "banteay-meanchey", id: "krong-serei-saophoan", text: "Krong Serei Saophoan"},
		{province_id: "banteay-meanchey", id: "thma-puok", text: "Thma Puok"},
		{province_id: "banteay-meanchey", id: "svay-chek", text: "Svay Chek"},
		{province_id: "banteay-meanchey", id: "malai", text: "Malai"},
		{province_id: "banteay-meanchey", id: "krong-paoy-paet", text: "Krong Paoy Paet"},
		{province_id: "battambang", id: "banan", text: "Banan"},
		{province_id: "battambang", id: "thma-koul", text: "Thma Koul"},
		{province_id: "battambang", id: "krong-battambang", text: "Krong Battambang"},
		{province_id: "battambang", id: "bavel", text: "Bavel"},
		{province_id: "battambang", id: "ek-phnom", text: "Ek Phnom"},
		{province_id: "battambang", id: "moung-ruessi", text: "Moung Ruessi"},
		{province_id: "battambang", id: "rotanak-mondol", text: "Rotanak Mondol"},
		{province_id: "battambang", id: "sangkae", text: "Sangkae"},
		{province_id: "battambang", id: "samlout", text: "Samlout"},
		{province_id: "battambang", id: "sampov-loun", text: "Sampov Loun"},
		{province_id: "battambang", id: "phnum-proek", text: "Phnum Proek"},
		{province_id: "battambang", id: "kamrieng", text: "Kamrieng"},
		{province_id: "battambang", id: "koas-krala", text: "Koas Krala"},
		{province_id: "battambang", id: "rukhak-kiri", text: "Rukhak Kiri"},
		{province_id: "kampong-cham", id: "batheay", text: "Batheay"},
		{province_id: "kampong-cham", id: "chamkar-leu", text: "Chamkar Leu"},
		{province_id: "kampong-cham", id: "cheung-prey", text: "Cheung Prey"},
		{province_id: "kampong-cham", id: "krong-kampong-cham", text: "Krong Kampong Cham"},
		{province_id: "kampong-cham", id: "kampong-siem", text: "Kampong Siem"},
		{province_id: "kampong-cham", id: "kang-meas", text: "Kang Meas"},
		{province_id: "kampong-cham", id: "koh-sotin", text: "Koh Sotin"},
		{province_id: "kampong-cham", id: "prey-chhor", text: "Prey Chhor"},
		{province_id: "kampong-cham", id: "srey-santhor", text: "Srey Santhor"},
		{province_id: "kampong-cham", id: "stueng-trang", text: "Stueng Trang"},
		{province_id: "kampong-chhnang", id: "baribour", text: "Baribour"},
		{province_id: "kampong-chhnang", id: "chol-kiri", text: "Chol Kiri"},
		{province_id: "kampong-chhnang", id: "krong-kampong-chhnang", text: "Krong Kampong Chhnang"},
		{province_id: "kampong-chhnang", id: "kampong-leaeng", text: "Kampong Leaeng"},
		{province_id: "kampong-chhnang", id: "kampong-tralach", text: "Kampong Tralach"},
		{province_id: "kampong-chhnang", id: "rolea-bier", text: "Rolea Bier"},
		{province_id: "kampong-chhnang", id: "sameakki-mean-chey", text: "Sameakki Mean Chey"},
		{province_id: "kampong-chhnang", id: "tuek-phos", text: "Tuek Phos"},
		{province_id: "kampong-speu", id: "kampong-speu", text: "Kampong Speu"},
		{province_id: "kampong-speu", id: "krong-chbar-mon", text: "Krong Chbar Mon"},
		{province_id: "kampong-speu", id: "kong-pisei", text: "Kong Pisei"},
		{province_id: "kampong-speu", id: "aoral", text: "Aoral"},
		{province_id: "kampong-speu", id: "odongk", text: "Odongk"},
		{province_id: "kampong-speu", id: "phnom-sruoch", text: "Phnom Sruoch"},
		{province_id: "kampong-speu", id: "samraong-tong", text: "Samraong Tong"},
		{province_id: "kampong-speu", id: "thpong", text: "Thpong"},
		{province_id: "kampong-thom", id: "baray", text: "Baray"},
		{province_id: "kampong-thom", id: "kampong-svay", text: "Kampong Svay"},
		{province_id: "kampong-thom", id: "krong-stueng-saen", text: "Krong Stueng Saen"},
		{province_id: "kampong-thom", id: "prasat-balangk", text: "Prasat Balangk"},
		{province_id: "kampong-thom", id: "prasat-sambour", text: "Prasat Sambour"},
		{province_id: "kampong-thom", id: "sandaan", text: "Sandaan"},
		{province_id: "kampong-thom", id: "santuk", text: "Santuk"},
		{province_id: "kampong-thom", id: "stoung", text: "Stoung"},
		{province_id: "kampot", id: "angkor-chey", text: "Angkor Chey"},
		{province_id: "kampot", id: "banteay-meas", text: "Banteay Meas"},
		{province_id: "kampot", id: "chhuk", text: "Chhuk"},
		{province_id: "kampot", id: "chum-kiri", text: "Chum Kiri"},
		{province_id: "kampot", id: "dang-tong", text: "Dang Tong"},
		{province_id: "kampot", id: "kampong-trach", text: "Kampong Trach"},
		{province_id: "kampot", id: "tuek-chhou", text: "Tuek Chhou"},
		{province_id: "kampot", id: "krong-kampot", text: "Krong Kampot"},
		{province_id: "kandal", id: "kandal-stueng", text: "Kandal Stueng"},
		{province_id: "kandal", id: "kien-svay", text: "Kien Svay"},
		{province_id: "kandal", id: "khsach-kandal", text: "Khsach Kandal"},
		{province_id: "kandal", id: "kaoh-thum", text: "Kaoh Thum"},
		{province_id: "kandal", id: "leuk-daek", text: "Leuk Daek"},
		{province_id: "kandal", id: "lvea-aem", text: "Lvea Aem"},
		{province_id: "kandal", id: "mukh-kampul", text: "Mukh Kampul"},
		{province_id: "kandal", id: "angk-snuol", text: "Angk Snuol"},
		{province_id: "kandal", id: "ponhea-lueu", text: "Ponhea Lueu"},
		{province_id: "kandal", id: "sa-ang", text: "Sa-ang"},
		{province_id: "kandal", id: "krong-ta-khmau", text: "Krong Ta Khmau"},
		{province_id: "kep", id: "damnak-chang-aeur", text: "Damnak Chang Aeur"},
		{province_id: "kep", id: "krong-kep", text: "Krong Kep"},
		{province_id: "koh-kong", id: "botum-sakor", text: "Botum Sakor"},
		{province_id: "koh-kong", id: "kiri-sakor", text: "Kiri Sakor"},
		{province_id: "koh-kong", id: "koh-kong", text: "Koh Kong"},
		{province_id: "koh-kong", id: "krong-khemara-phoumin", text: "Krong Khemara Phoumin"},
		{province_id: "koh-kong", id: "smach-mean-chey", text: "Smach Mean Chey"},
		{province_id: "koh-kong", id: "mondol-seima", text: "Mondol Seima"},
		{province_id: "koh-kong", id: "srae-ambel", text: "Srae Ambel"},
		{province_id: "koh-kong", id: "thma-bang", text: "Thma Bang"},
		{province_id: "kratie", id: "chhloung", text: "Chhloung"},
		{province_id: "kratie", id: "krong-kratie", text: "Krong Kratie"},
		{province_id: "kratie", id: "preaek-prasab", text: "Preaek Prasab"},
		{province_id: "kratie", id: "sambour", text: "Sambour"},
		{province_id: "kratie", id: "snuol", text: "Snuol"},
		{province_id: "kratie", id: "chitr-borie", text: "Chitr Borie"},
		{province_id: "mondulkiri", id: "kaev-seima", text: "Kaev Seima"},
		{province_id: "mondulkiri", id: "kaoh-nheaek", text: "Kaoh Nheaek"},
		{province_id: "mondulkiri", id: "ou-reang", text: "Ou Reang"},
		{province_id: "mondulkiri", id: "pechr-chenda", text: "Pechr Chenda"},
		{province_id: "mondulkiri", id: "krong-saen-monourom", text: "Krong Saen Monourom"},
		{province_id: "oddar-meanchey", id: "anlong-veaeng", text: "Anlong Veaeng"},
		{province_id: "oddar-meanchey", id: "banteay-ampil", text: "Banteay Ampil"},
		{province_id: "oddar-meanchey", id: "chong-kal", text: "Chong Kal"},
		{province_id: "oddar-meanchey", id: "krong-samraong", text: "Krong Samraong"},
		{province_id: "oddar-meanchey", id: "trapeang-prasat", text: "Trapeang Prasat"},
		{province_id: "pailin", id: "krong-pailin", text: "Krong Pailin"},
		{province_id: "pailin", id: "sala-krau", text: "Sala Krau"},
		{province_id: "preah-vihear", id: "chey-saen", text: "Chey Saen"},
		{province_id: "preah-vihear", id: "chhaeb", text: "Chhaeb"},
		{province_id: "preah-vihear", id: "choam-khsant", text: "Choam Khsant"},
		{province_id: "preah-vihear", id: "kuleaen", text: "Kuleaen"},
		{province_id: "preah-vihear", id: "rovieng", text: "Rovieng"},
		{province_id: "preah-vihear", id: "krong-preah-vihear", text: "Krong Preah Vihear"},
		{province_id: "preah-vihear", id: "sangkom-thmei", text: "Sangkom Thmei"},
		{province_id: "preah-vihear", id: "tbaeng-mean-chey", text: "Tbaeng Mean Chey"},
		{province_id: "pursat", id: "bakan", text: "Bakan"},
		{province_id: "pursat", id: "kandieng", text: "Kandieng"},
		{province_id: "pursat", id: "krakor", text: "Krakor"},
		{province_id: "pursat", id: "phnum-kravanh", text: "Phnum Kravanh"},
		{province_id: "pursat", id: "krong-pursat", text: "Krong Pursat"},
		{province_id: "pursat", id: "veal-veaeng", text: "Veal Veaeng"},
		{province_id: "prey-veng", id: "ba-phnum", text: "Ba Phnum"},
		{province_id: "prey-veng", id: "kamchay-mear", text: "Kamchay Mear"},
		{province_id: "prey-veng", id: "kampong-trabaek", text: "Kampong Trabaek"},
		{province_id: "prey-veng", id: "kanhchriech", text: "Kanhchriech"},
		{province_id: "prey-veng", id: "me-sang", text: "Me Sang"},
		{province_id: "prey-veng", id: "peam-chor", text: "Peam Chor"},
		{province_id: "prey-veng", id: "peam-ro", text: "Peam Ro"},
		{province_id: "prey-veng", id: "pea-reang", text: "Pea Reang"},
		{province_id: "prey-veng", id: "preah-sdach", text: "Preah Sdach"},
		{province_id: "prey-veng", id: "krong-prey-veaeng", text: "Krong Prey Veaeng"},
		{province_id: "prey-veng", id: "svay-ontor", text: "Svay Ontor"},
		{province_id: "prey-veng", id: "sithor-kandal", text: "Sithor Kandal"},
		{province_id: "prey-veng", id: "por-reang", text: "Por Reang"},
		{province_id: "ratanakiri", id: "andoung-meas", text: "Andoung Meas"},
		{province_id: "ratanakiri", id: "krong-banlung", text: "Krong Banlung"},
		{province_id: "ratanakiri", id: "bar-kaev", text: "Bar Kaev"},
		{province_id: "ratanakiri", id: "koun-mom", text: "Koun Mom"},
		{province_id: "ratanakiri", id: "lumphat", text: "Lumphat"},
		{province_id: "ratanakiri", id: "ou-chum", text: "Ou Chum"},
		{province_id: "ratanakiri", id: "ou-ya-dav", text: "Ou Ya Dav"},
		{province_id: "ratanakiri", id: "ta-veaeng", text: "Ta Veaeng"},
		{province_id: "ratanakiri", id: "veun-sai", text: "Veun Sai"},
		{province_id: "siem-reap", id: "angkor-chum", text: "Angkor Chum"},
		{province_id: "siem-reap", id: "angkor-thom", text: "Angkor Thom"},
		{province_id: "siem-reap", id: "banteay-srei", text: "Banteay Srei"},
		{province_id: "siem-reap", id: "chi-kraeng", text: "Chi Kraeng"},
		{province_id: "siem-reap", id: "kralanh", text: "Kralanh"},
		{province_id: "siem-reap", id: "puok", text: "Puok"},
		{province_id: "siem-reap", id: "prasat-bakong", text: "Prasat Bakong"},
		{province_id: "siem-reap", id: "krong-siem-reap", text: "Krong Siem Reap"},
		{province_id: "siem-reap", id: "sout-nikom", text: "Sout Nikom"},
		{province_id: "siem-reap", id: "srei-snam", text: "Srei Snam"},
		{province_id: "siem-reap", id: "svay-leu", text: "Svay Leu"},
		{province_id: "siem-reap", id: "varin", text: "Varin"},
		{province_id: "preah-sihanouk", id: "krong-preah-sihanouk", text: "Krong Preah Sihanouk"},
		{province_id: "preah-sihanouk", id: "prey-nob", text: "Prey Nob"},
		{province_id: "preah-sihanouk", id: "stueng-hav", text: "Stueng Hav"},
		{province_id: "preah-sihanouk", id: "kampong-seila", text: "Kampong Seila"},
		{province_id: "stung-treng", id: "sesan", text: "Sesan"},
		{province_id: "stung-treng", id: "siem-bouk", text: "Siem Bouk"},
		{province_id: "stung-treng", id: "siem-pang", text: "Siem Pang"},
		{province_id: "stung-treng", id: "krong-stung-treng", text: "Krong Stung Treng"},
		{province_id: "stung-treng", id: "thala-barivat", text: "Thala Barivat"},
		{province_id: "svay-rieng", id: "chantrea", text: "Chantrea"},
		{province_id: "svay-rieng", id: "kampong-rou", text: "Kampong Rou"},
		{province_id: "svay-rieng", id: "rumduol", text: "Rumduol"},
		{province_id: "svay-rieng", id: "romeas-haek", text: "Romeas Haek"},
		{province_id: "svay-rieng", id: "svay-chrum", text: "Svay Chrum"},
		{province_id: "svay-rieng", id: "krong-svay-rieng", text: "Krong Svay Rieng"},
		{province_id: "svay-rieng", id: "svay-teab", text: "Svay Teab"},
		{province_id: "svay-rieng", id: "krong-bavet", text: "Krong Bavet"},
		{province_id: "takeo", id: "angkor-borei", text: "Angkor Borei"},
		{province_id: "takeo", id: "bati", text: "Bati"},
		{province_id: "takeo", id: "bourei-cholsar", text: "Bourei Cholsar"},
		{province_id: "takeo", id: "kiri-vong", text: "Kiri Vong"},
		{province_id: "takeo", id: "kaoh-andaet", text: "Kaoh Andaet"},
		{province_id: "takeo", id: "prey-kabbas", text: "Prey Kabbas"},
		{province_id: "takeo", id: "samraong", text: "Samraong"},
		{province_id: "takeo", id: "krong-doun-kaev", text: "Krong Doun Kaev"},
		{province_id: "takeo", id: "tram-kak", text: "Tram Kak"},
		{province_id: "takeo", id: "treang", text: "Treang"},
		{province_id: "tboung-khmum", id: "dambae", text: "Dambae"},
		{province_id: "tboung-khmum", id: "krouch-chhmar", text: "Krouch Chhmar"},
		{province_id: "tboung-khmum", id: "memot", text: "Memot"},
		{province_id: "tboung-khmum", id: "ou-reang-ov", text: "Ou Reang Ov"},
		{province_id: "tboung-khmum", id: "ponhea-kraek", text: "Ponhea Kraek"},
		{province_id: "tboung-khmum", id: "tboung-khmum", text: "Tboung Khmum"},
		{province_id: "tboung-khmum", id: "krong-suong", text: "Krong Suong"},
		];

		this.communes = [
		{district_id:"mongkol-borei",id:"banteay-neang", text: "Banteay Neang"},
		{district_id:"mongkol-borei",id:"bat-trang", text: "Bat Trang"},
		{district_id:"mongkol-borei",id:"chamnaom", text: "Chamnaom"},
		{district_id:"mongkol-borei",id:"kouk-ballangk", text: "Kouk Ballangk"},
		{district_id:"mongkol-borei",id:"koy-maeng", text: "Koy Maeng"},
		{district_id:"mongkol-borei",id:"ou-prasat", text: "Ou Prasat"},
		{district_id:"mongkol-borei",id:"phnum-touch", text: "Phnum Touch"},
		{district_id:"mongkol-borei",id:"rohat-tuek", text: "Rohat Tuek"},
		{district_id:"mongkol-borei",id:"ruessei-kraok", text: "Ruessei Kraok"},
		{district_id:"mongkol-borei",id:"sambuor", text: "Sambuor"},
		{district_id:"mongkol-borei",id:"soea", text: "Soea"},
		{district_id:"mongkol-borei",id:"srah-reang", text: "Srah Reang"},
		{district_id:"mongkol-borei",id:"ta-lam", text: "Ta Lam"},
		{district_id:"phnum-srok",id:"nam-tau", text: "Nam Tau"},
		{district_id:"phnum-srok",id:"poy-char", text: "Poy Char"},
		{district_id:"phnum-srok",id:"ponley", text: "Ponley"},
		{district_id:"phnum-srok",id:"spean-sraeng", text: "Spean Sraeng"},
		{district_id:"phnum-srok",id:"srah-chik", text: "Srah Chik"},
		{district_id:"phnum-srok",id:"phnum-dei", text: "Phnum Dei"},
		{district_id:"preah-netr-preah",id:"chnuor-mean-chey", text: "Chnuor Mean Chey"},
		{district_id:"preah-netr-preah",id:"chob-vari", text: "Chob Vari"},
		{district_id:"preah-netr-preah",id:"phnum-lieb", text: "Phnum Lieb"},
		{district_id:"preah-netr-preah",id:"prasat", text: "Prasat"},
		{district_id:"preah-netr-preah",id:"preak-netr-preah", text: "Preak Netr Preah"},
		{district_id:"preah-netr-preah",id:"rohal", text: "Rohal"},
		{district_id:"preah-netr-preah",id:"tean-kam", text: "Tean Kam"},
		{district_id:"preah-netr-preah",id:"tuek-chour", text: "Tuek Chour"},
		{district_id:"preah-netr-preah",id:"bos-sbov", text: "Bos Sbov"},
		{district_id:"ou-chrov",id:"changha", text: "Changha"},
		{district_id:"ou-chrov",id:"koub", text: "Koub"},
		{district_id:"ou-chrov",id:"kuttasat", text: "Kuttasat"},
		{district_id:"ou-chrov",id:"samraong", text: "Samraong"},
		{district_id:"ou-chrov",id:"souphi", text: "Souphi"},
		{district_id:"ou-chrov",id:"soengh", text: "Soengh"},
		{district_id:"ou-chrov",id:"ou-bei-choan", text: "Ou Bei Choan"},
		{district_id:"krong-serei-saophoan",id:"kampong-svay", text: "Kampong Svay"},
		{district_id:"krong-serei-saophoan",id:"kaoh-pong-satv", text: "Kaoh Pong Satv"},
		{district_id:"krong-serei-saophoan",id:"mkak", text: "Mkak"},
		{district_id:"krong-serei-saophoan",id:"ou-ambel", text: "Ou Ambel"},
		{district_id:"krong-serei-saophoan",id:"phniet", text: "Phniet"},
		{district_id:"krong-serei-saophoan",id:"preah-ponlea", text: "Preah Ponlea"},
		{district_id:"krong-serei-saophoan",id:"tuek-thla-sangkat", text: "Tuek Thla Sangkat"},
		{district_id:"thma-puok",id:"banteay-chhmar", text: "Banteay Chhmar"},
		{district_id:"thma-puok",id:"kouk-romiet", text: "Kouk Romiet"},
		{district_id:"thma-puok",id:"phum-thmei", text: "Phum Thmei"},
		{district_id:"thma-puok",id:"thma-puok", text: "Thma Puok"},
		{district_id:"thma-puok",id:"kouk-kakthen", text: "Kouk Kakthen"},
		{district_id:"thma-puok",id:"kumru", text: "Kumru"},
		{district_id:"svay-chek",id:"phkoam", text: "Phkoam"},
		{district_id:"svay-chek",id:"sarongk-o", text: "Sarongk O"},
		{district_id:"svay-chek",id:"sla-kram", text: "Sla Kram"},
		{district_id:"svay-chek",id:"svay-chek", text: "Svay Chek"},
		{district_id:"svay-chek",id:"ta-baen", text: "Ta Baen"},
		{district_id:"svay-chek",id:"ta-phou", text: "Ta Phou"},
		{district_id:"svay-chek",id:"treas", text: "Treas"},
		{district_id:"svay-chek",id:"roluos", text: "Roluos"},
		{district_id:"malai",id:"boeng-beng", text: "Boeng Beng"},
		{district_id:"malai",id:"malai", text: "Malai"},
		{district_id:"malai",id:"ou-sampoar", text: "Ou Sampoar"},
		{district_id:"malai",id:"ou-sralau", text: "Ou Sralau"},
		{district_id:"malai",id:"tuol-pongro", text: "Tuol Pongro"},
		{district_id:"malai",id:"ta-kong", text: "Ta Kong"},
		{district_id:"krong-paoy-paet",id:"nimitt", text: "Nimitt"},
		{district_id:"krong-paoy-paet",id:"paoy-paet", text: "Paoy Paet"},
		{district_id:"krong-paoy-paet",id:"phsar-kandal", text: "Phsar Kandal"},
		{district_id:"banan",id:"kantueu-muoy", text: "Kantueu Muoy"},
		{district_id:"banan",id:"kantueu-pir", text: "Kantueu Pir"},
		{district_id:"banan",id:"bay-damram", text: "Bay Damram"},
		{district_id:"banan",id:"chheu-teal", text: "Chheu Teal"},
		{district_id:"banan",id:"chaeng-mean-chey", text: "Chaeng Mean Chey"},
		{district_id:"banan",id:"phnum-sampov", text: "Phnum Sampov"},
		{district_id:"banan",id:"snoeng", text: "Snoeng"},
		{district_id:"banan",id:"ta-kream", text: "Ta Kream"},
		{district_id:"thma-koul",id:"ta-pung", text: "Ta Pung"},
		{district_id:"thma-koul",id:"ta-meun", text: "Ta Meun"},
		{district_id:"thma-koul",id:"ou-ta-ki", text: "Ou Ta Ki"},
		{district_id:"thma-koul",id:"chrey", text: "Chrey"},
		{district_id:"thma-koul",id:"anlong-run", text: "Anlong Run"},
		{district_id:"thma-koul",id:"chrouy-sdau", text: "Chrouy Sdau"},
		{district_id:"thma-koul",id:"boeng-pring", text: "Boeng Pring"},
		{district_id:"thma-koul",id:"kouk-khmum", text: "Kouk Khmum"},
		{district_id:"thma-koul",id:"bansay-traeng", text: "Bansay Traeng"},
		{district_id:"thma-koul",id:"rung-chrey", text: "Rung Chrey"},
		{district_id:"krong-battambang",id:"tuol-ta-ek", text: "Tuol Ta Ek"},
		{district_id:"krong-battambang",id:"prek-preah-sdach", text: "Prek Preah Sdach"},
		{district_id:"krong-battambang",id:"rottanak", text: "Rottanak"},
		{district_id:"krong-battambang",id:"chomkar-somraong", text: "Chomkar Somraong"},
		{district_id:"krong-battambang",id:"sla-ket", text: "Sla Ket"},
		{district_id:"krong-battambang",id:"kdol-doun-teav", text: "Kdol Doun Teav"},
		{district_id:"krong-battambang",id:"omal", text: "Omal"},
		{district_id:"krong-battambang",id:"wat-kor", text: "Wat Kor"},
		{district_id:"krong-battambang",id:"ou-char", text: "Ou Char"},
		{district_id:"krong-battambang",id:"svay-por", text: "Svay Por"},
		{district_id:"bavel",id:"bavel", text: "Bavel"},
		{district_id:"bavel",id:"khnach-romeas", text: "Khnach Romeas"},
		{district_id:"bavel",id:"lvea", text: "Lvea"},
		{district_id:"bavel",id:"prey-khpos", text: "Prey Khpos"},
		{district_id:"bavel",id:"ampil-pram-daeum", text: "Ampil Pram Daeum"},
		{district_id:"bavel",id:"kdol-ta-haen", text: "Kdol Ta Haen"},
		{district_id:"bavel",id:"khlaeng-meas", text: "Khlaeng Meas"},
		{district_id:"bavel",id:"boeung-pram", text: "Boeung Pram"},
		{district_id:"ek-phnom",id:"preaek-norint", text: "Preaek Norint"},
		{district_id:"ek-phnom",id:"samraong-knong", text: "Samraong Knong"},
		{district_id:"ek-phnom",id:"preaek-khpob", text: "Preaek Khpob"},
		{district_id:"ek-phnom",id:"preaek-luong", text: "Preaek Luong"},
		{district_id:"ek-phnom",id:"peam-aek", text: "Peam Aek"},
		{district_id:"ek-phnom",id:"prey-chas", text: "Prey Chas"},
		{district_id:"ek-phnom",id:"kaoh-chiveang", text: "Kaoh Chiveang"},
		{district_id:"moung-ruessi",id:"moung", text: "Moung"},
		{district_id:"moung-ruessi",id:"kear", text: "Kear"},
		{district_id:"moung-ruessi",id:"prey-svay", text: "Prey Svay"},
		{district_id:"moung-ruessi",id:"ruessei-krang", text: "Ruessei Krang"},
		{district_id:"moung-ruessi",id:"chrey", text: "Chrey"},
		{district_id:"moung-ruessi",id:"ta-loas", text: "Ta Loas"},
		{district_id:"moung-ruessi",id:"kakaoh", text: "Kakaoh"},
		{district_id:"moung-ruessi",id:"prey-touch", text: "Prey Touch"},
		{district_id:"moung-ruessi",id:"robas-mongkol", text: "Robas Mongkol"},
		{district_id:"rotanak-mondol",id:"sdau", text: "Sdau"},
		{district_id:"rotanak-mondol",id:"andaeuk-haeb", text: "Andaeuk Haeb"},
		{district_id:"rotanak-mondol",id:"phlov-meas", text: "Phlov Meas"},
		{district_id:"rotanak-mondol",id:"traeng", text: "Traeng"},
		{district_id:"rotanak-mondol",id:"reaksmei-songha", text: "Reaksmei Songha"},
		{district_id:"sangkae",id:"anlong-vil", text: "Anlong Vil"},
		{district_id:"sangkae",id:"norea", text: "Norea"},
		{district_id:"sangkae",id:"ta-pon", text: "Ta Pon"},
		{district_id:"sangkae",id:"roka", text: "Roka"},
		{district_id:"sangkae",id:"kampong-preah", text: "Kampong Preah"},
		{district_id:"sangkae",id:"kampong-prieng", text: "Kampong Prieng"},
		{district_id:"sangkae",id:"reang-kesei", text: "Reang Kesei"},
		{district_id:"sangkae",id:"ou-dambang-muoy", text: "Ou Dambang Muoy"},
		{district_id:"sangkae",id:"ou-dambang-pir", text: "Ou Dambang Pir"},
		{district_id:"sangkae",id:"vaot-ta-muem", text: "Vaot Ta Muem"},
		{district_id:"samlout",id:"ta-taok", text: "Ta Taok"},
		{district_id:"samlout",id:"kampong-lpov", text: "Kampong Lpov"},
		{district_id:"samlout",id:"ou-samril", text: "Ou Samril"},
		{district_id:"samlout",id:"sung", text: "Sung"},
		{district_id:"samlout",id:"samlout", text: "Samlout"},
		{district_id:"samlout",id:"mean-chey", text: "Mean Chey"},
		{district_id:"samlout",id:"ta-sanh", text: "Ta Sanh"},
		{district_id:"sampov-loun",id:"sampov-lun", text: "Sampov Lun"},
		{district_id:"sampov-loun",id:"angkor-ban", text: "Angkor Ban"},
		{district_id:"sampov-loun",id:"ta-sda", text: "Ta Sda"},
		{district_id:"sampov-loun",id:"santepheap", text: "Santepheap"},
		{district_id:"sampov-loun",id:"serei-mean-chey", text: "Serei Mean Chey"},
		{district_id:"sampov-loun",id:"chrey-seima", text: "Chrey Seima"},
		{district_id:"phnum-proek",id:"phnum-proek", text: "Phnum Proek"},
		{district_id:"phnum-proek",id:"pech-chenda", text: "Pech Chenda"},
		{district_id:"phnum-proek",id:"bour", text: "Bour"},
		{district_id:"phnum-proek",id:"barang-thleak", text: "Barang Thleak"},
		{district_id:"phnum-proek",id:"ou-rumduol", text: "Ou Rumduol"},
		{district_id:"kamrieng",id:"kamrieng", text: "Kamrieng"},
		{district_id:"kamrieng",id:"boeng-reang", text: "Boeng Reang"},
		{district_id:"kamrieng",id:"ou-da", text: "Ou Da"},
		{district_id:"kamrieng",id:"trang", text: "Trang"},
		{district_id:"kamrieng",id:"ta-saen", text: "Ta Saen"},
		{district_id:"kamrieng",id:"ta-krei", text: "Ta Krei"},
		{district_id:"koas-krala",id:"thipakdei", text: "Thipakdei"},
		{district_id:"koas-krala",id:"kaos-krala", text: "Kaos Krala"},
		{district_id:"koas-krala",id:"hab", text: "Hab"},
		{district_id:"koas-krala",id:"preah-phos", text: "Preah Phos"},
		{district_id:"koas-krala",id:"doun-ba", text: "Doun Ba"},
		{district_id:"koas-krala",id:"chhnal-moan", text: "Chhnal Moan"},
		{district_id:"rukhak-kiri",id:"preaek-chik", text: "Preaek Chik"},
		{district_id:"rukhak-kiri",id:"prey-tralach", text: "Prey Tralach"},
		{district_id:"rukhak-kiri",id:"mukh-reah", text: "Mukh Reah"},
		{district_id:"rukhak-kiri",id:"sdok-pravoek", text: "Sdok Pravoek"},
		{district_id:"rukhak-kiri",id:"basak", text: "Basak"},
		{district_id:"batheay",id:"batheay", text: "Batheay"},
		{district_id:"batheay",id:"chbar-ampov", text: "Chbar Ampov"},
		{district_id:"batheay",id:"chealea", text: "Chealea"},
		{district_id:"batheay",id:"cheung-prey", text: "Cheung Prey"},
		{district_id:"batheay",id:"me-pring", text: "Me Pring"},
		{district_id:"batheay",id:"ph-av", text: "Ph Av"},
		{district_id:"batheay",id:"sambour", text: "Sambour"},
		{district_id:"batheay",id:"sandaek", text: "Sandaek"},
		{district_id:"batheay",id:"tang-krang", text: "Tang Krang"},
		{district_id:"batheay",id:"tang-krasang", text: "Tang Krasang"},
		{district_id:"batheay",id:"trab", text: "Trab"},
		{district_id:"batheay",id:"tumnob", text: "Tumnob"},
		{district_id:"chamkar-leu",id:"bos-khnor", text: "Bos Khnor"},
		{district_id:"chamkar-leu",id:"chamkar-andoung", text: "Chamkar Andoung"},
		{district_id:"chamkar-leu",id:"cheyyou", text: "Cheyyou"},
		{district_id:"chamkar-leu",id:"lvea-leu", text: "Lvea Leu"},
		{district_id:"chamkar-leu",id:"spueu", text: "Spueu"},
		{district_id:"chamkar-leu",id:"svay-teab", text: "Svay Teab"},
		{district_id:"chamkar-leu",id:"ta-ong", text: "Ta Ong"},
		{district_id:"chamkar-leu",id:"ta-prok", text: "Ta Prok"},
		{district_id:"cheung-prey",id:"khnor-dambang", text: "Khnor Dambang"},
		{district_id:"cheung-prey",id:"kouk-rovieng", text: "Kouk Rovieng"},
		{district_id:"cheung-prey",id:"pdau-chum", text: "Pdau Chum"},
		{district_id:"cheung-prey",id:"prey-char", text: "Prey Char"},
		{district_id:"cheung-prey",id:"pring-chrum", text: "Pring Chrum"},
		{district_id:"cheung-prey",id:"sampong-chey", text: "Sampong Chey"},
		{district_id:"cheung-prey",id:"sdaeung-chey", text: "Sdaeung Chey"},
		{district_id:"cheung-prey",id:"soutib", text: "Soutib"},
		{district_id:"cheung-prey",id:"sramar", text: "Sramar"},
		{district_id:"cheung-prey",id:"trapeang-kor", text: "Trapeang Kor"},
		{district_id:"krong-kampong-cham",id:"boeng-kok", text: "Boeng Kok"},
		{district_id:"krong-kampong-cham",id:"kampong-cham", text: "Kampong Cham"},
		{district_id:"krong-kampong-cham",id:"sambuor-meas", text: "Sambuor Meas"},
		{district_id:"krong-kampong-cham",id:"veal-vong", text: "Veal Vong"},
		{district_id:"kampong-siem",id:"ampil", text: "Ampil"},
		{district_id:"kampong-siem",id:"hanchey", text: "Hanchey"},
		{district_id:"kampong-siem",id:"kien-chrey", text: "Kien Chrey"},
		{district_id:"kampong-siem",id:"kokor", text: "Kokor"},
		{district_id:"kampong-siem",id:"kaoh-mitt", text: "Kaoh Mitt"},
		{district_id:"kampong-siem",id:"kaoh-roka", text: "Kaoh Roka"},
		{district_id:"kampong-siem",id:"kaoh-samraong", text: "Kaoh Samraong"},
		{district_id:"kampong-siem",id:"kaoh-tontuem", text: "Kaoh Tontuem"},
		{district_id:"kampong-siem",id:"krala", text: "Krala"},
		{district_id:"kampong-siem",id:"ou-svay", text: "Ou Svay"},
		{district_id:"kampong-siem",id:"ro-ang", text: "Ro Ang"},
		{district_id:"kampong-siem",id:"rumchek", text: "Rumchek"},
		{district_id:"kampong-siem",id:"srak", text: "Srak"},
		{district_id:"kampong-siem",id:"trean", text: "Trean"},
		{district_id:"kampong-siem",id:"vihear-thum", text: "Vihear Thum"},
		{district_id:"kang-meas",id:"angkor-ban", text: "Angkor Ban"},
		{district_id:"kang-meas",id:"kang-ta-noeng", text: "Kang Ta Noeng"},
		{district_id:"kang-meas",id:"khchau", text: "Khchau"},
		{district_id:"kang-meas",id:"peam-chi-kang", text: "Peam Chi Kang"},
		{district_id:"kang-meas",id:"preaek-koy", text: "Preaek Koy"},
		{district_id:"kang-meas",id:"preaek-krabau", text: "Preaek Krabau"},
		{district_id:"kang-meas",id:"reay-pay", text: "Reay Pay"},
		{district_id:"kang-meas",id:"roka-ar", text: "Roka Ar"},
		{district_id:"kang-meas",id:"roka-koy", text: "Roka Koy"},
		{district_id:"kang-meas",id:"sdau", text: "Sdau"},
		{district_id:"kang-meas",id:"sour-kong", text: "Sour Kong"},
		{district_id:"koh-sotin",id:"kampong-reab", text: "Kampong Reab"},
		{district_id:"koh-sotin",id:"kaoh-soutin", text: "Kaoh Soutin"},
		{district_id:"koh-sotin",id:"lve", text: "Lve"},
		{district_id:"koh-sotin",id:"moha-leaph", text: "Moha Leaph"},
		{district_id:"koh-sotin",id:"moha-khnhoung", text: "Moha Khnhoung"},
		{district_id:"koh-sotin",id:"peam-prathnuoh", text: "Peam Prathnuoh"},
		{district_id:"koh-sotin",id:"pongro", text: "Pongro"},
		{district_id:"koh-sotin",id:"preaek-ta-nong", text: "Preaek Ta Nong"},
		{district_id:"prey-chhor",id:"baray", text: "Baray"},
		{district_id:"prey-chhor",id:"boeng-nay", text: "Boeng Nay"},
		{district_id:"prey-chhor",id:"chrey-vien", text: "Chrey Vien"},
		{district_id:"prey-chhor",id:"khvet-thum", text: "Khvet Thum"},
		{district_id:"prey-chhor",id:"kor", text: "Kor"},
		{district_id:"prey-chhor",id:"krouch", text: "Krouch"},
		{district_id:"prey-chhor",id:"lvea", text: "Lvea"},
		{district_id:"prey-chhor",id:"mien", text: "Mien"},
		{district_id:"prey-chhor",id:"prey-chhor", text: "Prey Chhor"},
		{district_id:"prey-chhor",id:"sour-saen", text: "Sour Saen"},
		{district_id:"prey-chhor",id:"samraong", text: "Samraong"},
		{district_id:"prey-chhor",id:"srangae", text: "Srangae"},
		{district_id:"prey-chhor",id:"thma-pun", text: "Thma Pun"},
		{district_id:"prey-chhor",id:"tong-rong", text: "Tong Rong"},
		{district_id:"prey-chhor",id:"trapeang-preah", text: "Trapeang Preah"},
		{district_id:"srey-santhor",id:"baray", text: "Baray"},
		{district_id:"srey-santhor",id:"chi-bal", text: "Chi Bal"},
		{district_id:"srey-santhor",id:"khnar-sa", text: "Khnar Sa"},
		{district_id:"srey-santhor",id:"kaoh-andaet", text: "Kaoh Andaet"},
		{district_id:"srey-santhor",id:"mean-chey", text: "Mean Chey"},
		{district_id:"srey-santhor",id:"pteah-kandal", text: "Pteah Kandal"},
		{district_id:"srey-santhor",id:"pram-yam", text: "Pram Yam"},
		{district_id:"srey-santhor",id:"preaek-dambouk", text: "Preaek Dambouk"},
		{district_id:"srey-santhor",id:"preaek-pou", text: "Preaek Pou"},
		{district_id:"srey-santhor",id:"preaek-rumdeng", text: "Preaek Rumdeng"},
		{district_id:"srey-santhor",id:"ruessei-srok", text: "Ruessei Srok"},
		{district_id:"srey-santhor",id:"svay-pou", text: "Svay Pou"},
		{district_id:"srey-santhor",id:"svay-sach-phnum", text: "Svay Sach Phnum"},
		{district_id:"srey-santhor",id:"tong-tralach", text: "Tong Tralach"},
		{district_id:"stueng-trang",id:"areaks-tnaot", text: "Areaks Tnaot"},
		{district_id:"stueng-trang",id:"dang-kdar", text: "Dang Kdar"},
		{district_id:"stueng-trang",id:"khpob-ta-nguon", text: "Khpob Ta Nguon"},
		{district_id:"stueng-trang",id:"me-sar-chrey", text: "Me Sar Chrey"},
		{district_id:"stueng-trang",id:"ou-mlu", text: "Ou Mlu"},
		{district_id:"stueng-trang",id:"peam-kaoh-sna", text: "Peam Kaoh Sna"},
		{district_id:"stueng-trang",id:"preah-andoung", text: "Preah Andoung"},
		{district_id:"stueng-trang",id:"preaek-bak", text: "Preaek Bak"},
		{district_id:"stueng-trang",id:"preaek-kak", text: "Preaek Kak"},
		{district_id:"stueng-trang",id:"soupheas", text: "Soupheas"},
		{district_id:"stueng-trang",id:"tuol-preah-khleang", text: "Tuol Preah Khleang"},
		{district_id:"stueng-trang",id:"tuol-sambuor", text: "Tuol Sambuor"},
		{district_id:"baribour",id:"anhchanh-rung", text: "Anhchanh Rung"},
		{district_id:"baribour",id:"chhnok-tru", text: "Chhnok Tru"},
		{district_id:"baribour",id:"chak", text: "Chak"},
		{district_id:"baribour",id:"khon-rang", text: "Khon Rang"},
		{district_id:"baribour",id:"kampong-preah-kokir", text: "Kampong Preah Kokir"},
		{district_id:"baribour",id:"melum", text: "Melum"},
		{district_id:"baribour",id:"phsar", text: "Phsar"},
		{district_id:"baribour",id:"pech-changvar", text: "Pech Changvar"},
		{district_id:"baribour",id:"popel", text: "Popel"},
		{district_id:"baribour",id:"ponley", text: "Ponley"},
		{district_id:"baribour",id:"trapeang-chan", text: "Trapeang Chan"},
		{district_id:"chol-kiri",id:"chol-sar", text: "Chol Sar"},
		{district_id:"chol-kiri",id:"kaoh-thkov", text: "Kaoh Thkov"},
		{district_id:"chol-kiri",id:"kampong-os", text: "Kampong Os"},
		{district_id:"chol-kiri",id:"peam-chhkaok", text: "Peam Chhkaok"},
		{district_id:"chol-kiri",id:"prey-kri", text: "Prey Kri"},
		{district_id:"krong-kampong-chhnang",id:"phsar-chhnang", text: "Phsar Chhnang"},
		{district_id:"krong-kampong-chhnang",id:"kampong-chhnang", text: "Kampong Chhnang"},
		{district_id:"krong-kampong-chhnang",id:"ph-er", text: "Ph Er"},
		{district_id:"krong-kampong-chhnang",id:"khsam", text: "Khsam"},
		{district_id:"kampong-leaeng",id:"chranouk", text: "Chranouk"},
		{district_id:"kampong-leaeng",id:"dar", text: "Dar"},
		{district_id:"kampong-leaeng",id:"kampong-hau", text: "Kampong Hau"},
		{district_id:"kampong-leaeng",id:"phlov-tuk", text: "Phlov Tuk"},
		{district_id:"kampong-leaeng",id:"pou", text: "Pou"},
		{district_id:"kampong-leaeng",id:"pralay-meas", text: "Pralay Meas"},
		{district_id:"kampong-leaeng",id:"samraong-saen", text: "Samraong Saen"},
		{district_id:"kampong-leaeng",id:"svay-rumpear", text: "Svay Rumpear"},
		{district_id:"kampong-leaeng",id:"trangel", text: "Trangel"},
		{district_id:"kampong-tralach",id:"ampil-tuek", text: "Ampil Tuek"},
		{district_id:"kampong-tralach",id:"chhuk-sa", text: "Chhuk Sa"},
		{district_id:"kampong-tralach",id:"chres", text: "Chres"},
		{district_id:"kampong-tralach",id:"kampong-tralach", text: "Kampong Tralach"},
		{district_id:"kampong-tralach",id:"longveaek", text: "Longveaek"},
		{district_id:"kampong-tralach",id:"ou-ruessei", text: "Ou Ruessei"},
		{district_id:"kampong-tralach",id:"peani", text: "Peani"},
		{district_id:"kampong-tralach",id:"saeb", text: "Saeb"},
		{district_id:"kampong-tralach",id:"ta-ches", text: "Ta Ches"},
		{district_id:"kampong-tralach",id:"thma-edth", text: "Thma Edth"},
		{district_id:"rolea-bier",id:"andoung-snay", text: "Andoung Snay"},
		{district_id:"rolea-bier",id:"banteay-preal", text: "Banteay Preal"},
		{district_id:"rolea-bier",id:"cheung-kreav", text: "Cheung Kreav"},
		{district_id:"rolea-bier",id:"chrey-bak", text: "Chrey Bak"},
		{district_id:"rolea-bier",id:"kouk-banteay", text: "Kouk Banteay"},
		{district_id:"rolea-bier",id:"krang-leav", text: "Krang Leav"},
		{district_id:"rolea-bier",id:"pongro", text: "Pongro"},
		{district_id:"rolea-bier",id:"prasneb", text: "Prasneb"},
		{district_id:"rolea-bier",id:"prey-mul", text: "Prey Mul"},
		{district_id:"rolea-bier",id:"rolea-b-ier", text: "Rolea B Ier"},
		{district_id:"rolea-bier",id:"srae-thmei", text: "Srae Thmei"},
		{district_id:"rolea-bier",id:"svay-chrum", text: "Svay Chrum"},
		{district_id:"rolea-bier",id:"tuek-hout", text: "Tuek Hout"},
		{district_id:"sameakki-mean-chey",id:"chhean-laeung", text: "Chhean Laeung"},
		{district_id:"sameakki-mean-chey",id:"khnar-chhmar", text: "Khnar Chhmar"},
		{district_id:"sameakki-mean-chey",id:"krang-lvea", text: "Krang Lvea"},
		{district_id:"sameakki-mean-chey",id:"peam", text: "Peam"},
		{district_id:"sameakki-mean-chey",id:"sedthei", text: "Sedthei"},
		{district_id:"sameakki-mean-chey",id:"svay", text: "Svay"},
		{district_id:"sameakki-mean-chey",id:"svay-chuk", text: "Svay Chuk"},
		{district_id:"sameakki-mean-chey",id:"tbaeng-khpos", text: "Tbaeng Khpos"},
		{district_id:"sameakki-mean-chey",id:"thlok-vien", text: "Thlok Vien"},
		{district_id:"tuek-phos",id:"akphivoadth", text: "Akphivoadth"},
		{district_id:"tuek-phos",id:"chieb", text: "Chieb"},
		{district_id:"tuek-phos",id:"chaong-maong", text: "Chaong Maong"},
		{district_id:"tuek-phos",id:"kbal-tuek", text: "Kbal Tuek"},
		{district_id:"tuek-phos",id:"khlong-popok", text: "Khlong Popok"},
		{district_id:"tuek-phos",id:"krang-skear", text: "Krang Skear"},
		{district_id:"tuek-phos",id:"tang-krasang", text: "Tang Krasang"},
		{district_id:"tuek-phos",id:"toul-khpos", text: "Toul Khpos"},
		{district_id:"tuek-phos",id:"kdol-sen-chey", text: "Kdol Sen Chey"},
		{district_id:"kampong-speu",id:"borsedth", text: "Borsedth"},
		{district_id:"kampong-speu",id:"kat-phluk", text: "Kat Phluk"},
		{district_id:"kampong-speu",id:"nitean", text: "Nitean"},
		{district_id:"kampong-speu",id:"pheakdei", text: "Pheakdei"},
		{district_id:"kampong-speu",id:"pheari-mean-chey", text: "Pheari Mean Chey"},
		{district_id:"kampong-speu",id:"phong", text: "Phong"},
		{district_id:"kampong-speu",id:"pou-angkrang", text: "Pou Angkrang"},
		{district_id:"kampong-speu",id:"pou-chamraeun", text: "Pou Chamraeun"},
		{district_id:"kampong-speu",id:"pou-mreal", text: "Pou Mreal"},
		{district_id:"kampong-speu",id:"svay-chacheb", text: "Svay Chacheb"},
		{district_id:"kampong-speu",id:"toul-ampil", text: "Toul Ampil"},
		{district_id:"kampong-speu",id:"toul-sala", text: "Toul Sala"},
		{district_id:"kampong-speu",id:"kak", text: "Kak"},
		{district_id:"kampong-speu",id:"ponley", text: "Ponley"},
		{district_id:"kampong-speu",id:"preah-khae", text: "Preah Khae"},
		{district_id:"krong-chbar-mon",id:"chbar-mon", text: "Chbar Mon"},
		{district_id:"krong-chbar-mon",id:"kandaol-dom", text: "Kandaol Dom"},
		{district_id:"krong-chbar-mon",id:"roka-thum", text: "Roka Thum"},
		{district_id:"krong-chbar-mon",id:"sopoar-tep", text: "Sopoar Tep"},
		{district_id:"krong-chbar-mon",id:"svay-kravan", text: "Svay Kravan"},
		{district_id:"kong-pisei",id:"angk-popel", text: "Angk Popel"},
		{district_id:"kong-pisei",id:"chongruk", text: "Chongruk"},
		{district_id:"kong-pisei",id:"moha-ruessei", text: "Moha Ruessei"},
		{district_id:"kong-pisei",id:"pechr-muni", text: "Pechr Muni"},
		{district_id:"kong-pisei",id:"preah-nipean", text: "Preah Nipean"},
		{district_id:"kong-pisei",id:"prey-nheat", text: "Prey Nheat"},
		{district_id:"kong-pisei",id:"prey-vihear", text: "Prey Vihear"},
		{district_id:"kong-pisei",id:"roka-kaoh", text: "Roka Kaoh"},
		{district_id:"kong-pisei",id:"sdok", text: "Sdok"},
		{district_id:"kong-pisei",id:"snam-krapeu", text: "Snam Krapeu"},
		{district_id:"kong-pisei",id:"srang", text: "Srang"},
		{district_id:"kong-pisei",id:"tuek-l-ak", text: "Tuek L Ak"},
		{district_id:"kong-pisei",id:"veal", text: "Veal"},
		{district_id:"aoral",id:"haong-samnam", text: "Haong Samnam"},
		{district_id:"aoral",id:"reaksmei-sameakki", text: "Reaksmei Sameakki"},
		{district_id:"aoral",id:"trapeang-chour", text: "Trapeang Chour"},
		{district_id:"aoral",id:"sangkae-satob", text: "Sangkae Satob"},
		{district_id:"aoral",id:"ta-sal", text: "Ta Sal"},
		{district_id:"odongk",id:"chant-saen", text: "Chant Saen"},
		{district_id:"odongk",id:"cheung-roas", text: "Cheung Roas"},
		{district_id:"odongk",id:"chumpu-proeks", text: "Chumpu Proeks"},
		{district_id:"odongk",id:"khsem-khsan", text: "Khsem Khsan"},
		{district_id:"odongk",id:"krang-chek", text: "Krang Chek"},
		{district_id:"odongk",id:"mean-chey", text: "Mean Chey"},
		{district_id:"odongk",id:"preah-srae", text: "Preah Srae"},
		{district_id:"odongk",id:"prey-krasang", text: "Prey Krasang"},
		{district_id:"odongk",id:"trach-tong", text: "Trach Tong"},
		{district_id:"odongk",id:"veal-pung", text: "Veal Pung"},
		{district_id:"odongk",id:"veang-chas", text: "Veang Chas"},
		{district_id:"odongk",id:"yutth-sameakki", text: "Yutth Sameakki"},
		{district_id:"odongk",id:"damnak-reang", text: "Damnak Reang"},
		{district_id:"odongk",id:"peang-lvea", text: "Peang Lvea"},
		{district_id:"odongk",id:"phnum-touch", text: "Phnum Touch"},
		{district_id:"phnom-sruoch",id:"chambak", text: "Chambak"},
		{district_id:"phnom-sruoch",id:"choam-sangkae", text: "Choam Sangkae"},
		{district_id:"phnom-sruoch",id:"dambouk-rung", text: "Dambouk Rung"},
		{district_id:"phnom-sruoch",id:"kiri-voan", text: "Kiri Voan"},
		{district_id:"phnom-sruoch",id:"krang-dei-vay", text: "Krang Dei Vay"},
		{district_id:"phnom-sruoch",id:"moha-sang", text: "Moha Sang"},
		{district_id:"phnom-sruoch",id:"ou", text: "Ou"},
		{district_id:"phnom-sruoch",id:"prey-rumduol", text: "Prey Rumduol"},
		{district_id:"phnom-sruoch",id:"prey-kmeng", text: "Prey Kmeng"},
		{district_id:"phnom-sruoch",id:"tang-samraong", text: "Tang Samraong"},
		{district_id:"phnom-sruoch",id:"tang-sya", text: "Tang Sya"},
		{district_id:"phnom-sruoch",id:"traeng-trayueng", text: "Traeng Trayueng"},
		{district_id:"samraong-tong",id:"roleang-chak", text: "Roleang Chak"},
		{district_id:"samraong-tong",id:"kahaeng", text: "Kahaeng"},
		{district_id:"samraong-tong",id:"khtum-krang", text: "Khtum Krang"},
		{district_id:"samraong-tong",id:"krang-ampil", text: "Krang Ampil"},
		{district_id:"samraong-tong",id:"pneay", text: "Pneay"},
		{district_id:"samraong-tong",id:"roleang-kreul", text: "Roleang Kreul"},
		{district_id:"samraong-tong",id:"samraong-tong", text: "Samraong Tong"},
		{district_id:"samraong-tong",id:"sambour", text: "Sambour"},
		{district_id:"samraong-tong",id:"saen-dei", text: "Saen Dei"},
		{district_id:"samraong-tong",id:"skuh", text: "Skuh"},
		{district_id:"samraong-tong",id:"tang-krouch", text: "Tang Krouch"},
		{district_id:"samraong-tong",id:"thommoda-ar", text: "Thommoda Ar"},
		{district_id:"samraong-tong",id:"trapeang-kong", text: "Trapeang Kong"},
		{district_id:"samraong-tong",id:"tumpoar-meas", text: "Tumpoar Meas"},
		{district_id:"samraong-tong",id:"voa-sa", text: "Voa Sa"},
		{district_id:"thpong",id:"amleang", text: "Amleang"},
		{district_id:"thpong",id:"monourom", text: "Monourom"},
		{district_id:"thpong",id:"prambei-mom", text: "Prambei Mom"},
		{district_id:"thpong",id:"rung-roeang", text: "Rung Roeang"},
		{district_id:"thpong",id:"toap-mean", text: "Toap Mean"},
		{district_id:"thpong",id:"veal-pon", text: "Veal Pon"},
		{district_id:"thpong",id:"yea-angk", text: "Yea Angk"},
		{district_id:"baray",id:"bak-sna", text: "Bak Sna"},
		{district_id:"baray",id:"ballangk", text: "Ballangk"},
		{district_id:"baray",id:"baray", text: "Baray"},
		{district_id:"baray",id:"boeng", text: "Boeng"},
		{district_id:"baray",id:"chaeung-daeung", text: "Chaeung Daeung"},
		{district_id:"baray",id:"chranieng", text: "Chranieng"},
		{district_id:"baray",id:"chhuk-khsach", text: "Chhuk Khsach"},
		{district_id:"baray",id:"chong-doung", text: "Chong Doung"},
		{district_id:"baray",id:"chrolong", text: "Chrolong"},
		{district_id:"baray",id:"kokir-thum", text: "Kokir Thum"},
		{district_id:"baray",id:"krava", text: "Krava"},
		{district_id:"baray",id:"andoung-pou", text: "Andoung Pou"},
		{district_id:"baray",id:"pongro", text: "Pongro"},
		{district_id:"baray",id:"sou-young", text: "Sou Young"},
		{district_id:"baray",id:"sralau", text: "Sralau"},
		{district_id:"baray",id:"svay-phleung", text: "Svay Phleung"},
		{district_id:"baray",id:"tnaot-chum", text: "Tnaot Chum"},
		{district_id:"baray",id:"treal", text: "Treal"},
		{district_id:"kampong-svay",id:"chey", text: "Chey"},
		{district_id:"kampong-svay",id:"damrei-slab", text: "Damrei Slab"},
		{district_id:"kampong-svay",id:"kampong-kou", text: "Kampong Kou"},
		{district_id:"kampong-svay",id:"kampong-svay", text: "Kampong Svay"},
		{district_id:"kampong-svay",id:"ni-pechr", text: "Ni Pechr"},
		{district_id:"kampong-svay",id:"phat-sanday", text: "Phat Sanday"},
		{district_id:"kampong-svay",id:"san-kor", text: "San Kor"},
		{district_id:"kampong-svay",id:"tbaeng", text: "Tbaeng"},
		{district_id:"kampong-svay",id:"trapeang-ruessei", text: "Trapeang Ruessei"},
		{district_id:"kampong-svay",id:"kdei-doung", text: "Kdei Doung"},
		{district_id:"kampong-svay",id:"prey-kuy", text: "Prey Kuy"},
		{district_id:"krong-stueng-saen",id:"damrei-choan-khla", text: "Damrei Choan Khla"},
		{district_id:"krong-stueng-saen",id:"kampong-thum", text: "Kampong Thum"},
		{district_id:"krong-stueng-saen",id:"kampong-roteh", text: "Kampong Roteh"},
		{district_id:"krong-stueng-saen",id:"ou-kanthor", text: "Ou Kanthor"},
		{district_id:"krong-stueng-saen",id:"kampong-krabau", text: "Kampong Krabau"},
		{district_id:"krong-stueng-saen",id:"prey-ta-hu", text: "Prey Ta Hu"},
		{district_id:"krong-stueng-saen",id:"achar-leak", text: "Achar Leak"},
		{district_id:"krong-stueng-saen",id:"srayov", text: "Srayov"},
		{district_id:"prasat-balangk",id:"doung", text: "Doung"},
		{district_id:"prasat-balangk",id:"kraya", text: "Kraya"},
		{district_id:"prasat-balangk",id:"phan-nheum", text: "Phan Nheum"},
		{district_id:"prasat-balangk",id:"sa-kream", text: "Sa Kream"},
		{district_id:"prasat-balangk",id:"sala-visai", text: "Sala Visai"},
		{district_id:"prasat-balangk",id:"sameakki", text: "Sameakki"},
		{district_id:"prasat-balangk",id:"tuol-kreul", text: "Tuol Kreul"},
		{district_id:"prasat-sambour",id:"chhuk", text: "Chhuk"},
		{district_id:"prasat-sambour",id:"koul", text: "Koul"},
		{district_id:"prasat-sambour",id:"sambour", text: "Sambour"},
		{district_id:"prasat-sambour",id:"sraeung", text: "Sraeung"},
		{district_id:"prasat-sambour",id:"tang-krasau", text: "Tang Krasau"},
		{district_id:"sandaan",id:"chheu-teal", text: "Chheu Teal"},
		{district_id:"sandaan",id:"dang-kambet", text: "Dang Kambet"},
		{district_id:"sandaan",id:"klaeng", text: "Klaeng"},
		{district_id:"sandaan",id:"mean-ritth", text: "Mean Ritth"},
		{district_id:"sandaan",id:"mean-chey", text: "Mean Chey"},
		{district_id:"sandaan",id:"ngan", text: "Ngan"},
		{district_id:"sandaan",id:"sandan", text: "Sandan"},
		{district_id:"sandaan",id:"sochet", text: "Sochet"},
		{district_id:"sandaan",id:"tum-ring", text: "Tum Ring"},
		{district_id:"santuk",id:"boeng-lvea", text: "Boeng Lvea"},
		{district_id:"santuk",id:"chroab", text: "Chroab"},
		{district_id:"santuk",id:"kampong-thma", text: "Kampong Thma"},
		{district_id:"santuk",id:"kakaoh", text: "Kakaoh"},
		{district_id:"santuk",id:"kraya", text: "Kraya"},
		{district_id:"santuk",id:"pnov", text: "Pnov"},
		{district_id:"santuk",id:"tang-krasang", text: "Tang Krasang"},
		{district_id:"santuk",id:"prasat", text: "Prasat"},
		{district_id:"santuk",id:"ti-pou", text: "Ti Pou"},
		{district_id:"santuk",id:"tboung-krapeu", text: "Tboung Krapeu"},
		{district_id:"stoung",id:"banteay-stoung", text: "Banteay Stoung"},
		{district_id:"stoung",id:"chamnar-kraom", text: "Chamnar Kraom"},
		{district_id:"stoung",id:"chamnar-leu", text: "Chamnar Leu"},
		{district_id:"stoung",id:"kampong-chen-cheung", text: "Kampong Chen Cheung"},
		{district_id:"stoung",id:"kampong-chen-tboung", text: "Kampong Chen Tboung"},
		{district_id:"stoung",id:"msar-krang", text: "Msar Krang"},
		{district_id:"stoung",id:"peam-bang", text: "Peam Bang"},
		{district_id:"stoung",id:"popok", text: "Popok"},
		{district_id:"stoung",id:"pralay", text: "Pralay"},
		{district_id:"stoung",id:"preah-damrei", text: "Preah Damrei"},
		{district_id:"stoung",id:"rung-roeang", text: "Rung Roeang"},
		{district_id:"stoung",id:"samprouch", text: "Samprouch"},
		{district_id:"stoung",id:"trea", text: "Trea"},
		{district_id:"angkor-chey",id:"angk-phnum-touch", text: "Angk Phnum Touch"},
		{district_id:"angkor-chey",id:"angkor-chey", text: "Angkor Chey"},
		{district_id:"angkor-chey",id:"champei", text: "Champei"},
		{district_id:"angkor-chey",id:"dambouk-khpos", text: "Dambouk Khpos"},
		{district_id:"angkor-chey",id:"dan-koum", text: "Dan Koum"},
		{district_id:"angkor-chey",id:"daeum-doung", text: "Daeum Doung"},
		{district_id:"angkor-chey",id:"mroum", text: "Mroum"},
		{district_id:"angkor-chey",id:"phnum-kong", text: "Phnum Kong"},
		{district_id:"angkor-chey",id:"praphnum", text: "Praphnum"},
		{district_id:"angkor-chey",id:"samlanh", text: "Samlanh"},
		{district_id:"angkor-chey",id:"tani", text: "Tani"},
		{district_id:"banteay-meas",id:"tnaot-chong-srang", text: "Tnaot Chong Srang"},
		{district_id:"banteay-meas",id:"trapeang-sala-khang-kaeut", text: "Trapeang Sala Khang Kaeut"},
		{district_id:"banteay-meas",id:"trapeang-sala-khang-lech", text: "Trapeang Sala Khang Lech"},
		{district_id:"banteay-meas",id:"tuk-meas-khang-kaeut", text: "Tuk Meas Khang Kaeut"},
		{district_id:"banteay-meas",id:"tuk-meas-khang-lech", text: "Tuk Meas Khang Lech"},
		{district_id:"banteay-meas",id:"banteay-meas-khang-kaeut", text: "Banteay Meas Khang Kaeut"},
		{district_id:"banteay-meas",id:"banteay-meas-khang-lech", text: "Banteay Meas Khang Lech"},
		{district_id:"banteay-meas",id:"prey-tonle", text: "Prey Tonle"},
		{district_id:"banteay-meas",id:"voat-angk-khang-cheung", text: "Voat Angk Khang Cheung"},
		{district_id:"banteay-meas",id:"voat-angk-khang-tboung", text: "Voat Angk Khang Tboung"},
		{district_id:"banteay-meas",id:"samraong-kraom", text: "Samraong Kraom"},
		{district_id:"banteay-meas",id:"samraong-leu", text: "Samraong Leu"},
		{district_id:"banteay-meas",id:"sdach-kong-khang-cheung", text: "Sdach Kong Khang Cheung"},
		{district_id:"banteay-meas",id:"sdach-kong-khang-tboung", text: "Sdach Kong Khang Tboung"},
		{district_id:"banteay-meas",id:"sdach-kong-khang-lech", text: "Sdach Kong Khang Lech"},
		{district_id:"chhuk",id:"baniev", text: "Baniev"},
		{district_id:"chhuk",id:"boeng-nimol", text: "Boeng Nimol"},
		{district_id:"chhuk",id:"chhuk", text: "Chhuk"},
		{district_id:"chhuk",id:"doun-yay", text: "Doun Yay"},
		{district_id:"chhuk",id:"krang-sbov", text: "Krang Sbov"},
		{district_id:"chhuk",id:"krang-snay", text: "Krang Snay"},
		{district_id:"chhuk",id:"lbaeuk", text: "Lbaeuk"},
		{district_id:"chhuk",id:"mean-chey", text: "Mean Chey"},
		{district_id:"chhuk",id:"nareay", text: "Nareay"},
		{district_id:"chhuk",id:"satv-pong", text: "Satv Pong"},
		{district_id:"chhuk",id:"trapeang-bei", text: "Trapeang Bei"},
		{district_id:"chhuk",id:"tramaeng", text: "Tramaeng"},
		{district_id:"chhuk",id:"ta-kaen", text: "Ta Kaen"},
		{district_id:"chhuk",id:"trapeang-plang", text: "Trapeang Plang"},
		{district_id:"chum-kiri",id:"chres", text: "Chres"},
		{district_id:"chum-kiri",id:"chumpu-voan", text: "Chumpu Voan"},
		{district_id:"chum-kiri",id:"snay-anhchet", text: "Snay Anhchet"},
		{district_id:"chum-kiri",id:"srae-chaeng", text: "Srae Chaeng"},
		{district_id:"chum-kiri",id:"srae-knong", text: "Srae Knong"},
		{district_id:"chum-kiri",id:"srae-samraong", text: "Srae Samraong"},
		{district_id:"chum-kiri",id:"trapeang-reang", text: "Trapeang Reang"},
		{district_id:"dang-tong",id:"damnak-sokram", text: "Damnak Sokram"},
		{district_id:"dang-tong",id:"dang-tong", text: "Dang Tong"},
		{district_id:"dang-tong",id:"khcheay-khang-cheung", text: "Khcheay Khang Cheung"},
		{district_id:"dang-tong",id:"khcheay-khang-tboung", text: "Khcheay Khang Tboung"},
		{district_id:"dang-tong",id:"mean-ritth", text: "Mean Ritth"},
		{district_id:"dang-tong",id:"srae-chea-khang-cheung", text: "Srae Chea Khang Cheung"},
		{district_id:"dang-tong",id:"srae-chea-khang-tboung", text: "Srae Chea Khang Tboung"},
		{district_id:"dang-tong",id:"totung", text: "Totung"},
		{district_id:"dang-tong",id:"angkor-meas", text: "Angkor Meas"},
		{district_id:"dang-tong",id:"l-ang", text: "L Ang"},
		{district_id:"kampong-trach",id:"boeng-sala-khang-cheung", text: "Boeng Sala Khang Cheung"},
		{district_id:"kampong-trach",id:"boeng-sala-khang-tboung", text: "Boeng Sala Khang Tboung"},
		{district_id:"kampong-trach",id:"damnak-kantuot-khang-cheung", text: "Damnak Kantuot Khang Cheung"},
		{district_id:"kampong-trach",id:"damnak-kantuot-khang-tboung", text: "Damnak Kantuot Khang Tboung"},
		{district_id:"kampong-trach",id:"kampong-trach-khang-kaeut", text: "Kampong Trach Khang Kaeut"},
		{district_id:"kampong-trach",id:"kampong-trach-khang-lech", text: "Kampong Trach Khang Lech"},
		{district_id:"kampong-trach",id:"prasat-phnom-khyorng", text: "Prasat Phnom Khyorng"},
		{district_id:"kampong-trach",id:"phnom-prasat", text: "Phnom Prasat"},
		{district_id:"kampong-trach",id:"ank-sorophy", text: "Ank Sorophy"},
		{district_id:"kampong-trach",id:"preaek-kroes", text: "Preaek Kroes"},
		{district_id:"kampong-trach",id:"ruessei-srok-khang-kaeut", text: "Ruessei Srok Khang Kaeut"},
		{district_id:"kampong-trach",id:"ruessei-srok-khang-lech", text: "Ruessei Srok Khang Lech"},
		{district_id:"kampong-trach",id:"svay-tong-khang-cheung", text: "Svay Tong Khang Cheung"},
		{district_id:"kampong-trach",id:"svay-tong-khang-tboung", text: "Svay Tong Khang Tboung"},
		{district_id:"tuek-chhou",id:"boeng-tuk", text: "Boeng Tuk"},
		{district_id:"tuek-chhou",id:"chum-kriel", text: "Chum Kriel"},
		{district_id:"tuek-chhou",id:"kampong-samraong", text: "Kampong Samraong"},
		{district_id:"tuek-chhou",id:"kandal", text: "Kandal"},
		{district_id:"tuek-chhou",id:"kaoh-touch", text: "Kaoh Touch"},
		{district_id:"tuek-chhou",id:"koun-satv", text: "Koun Satv"},
		{district_id:"tuek-chhou",id:"meakprang", text: "Meakprang"},
		{district_id:"tuek-chhou",id:"preaek-tnaot", text: "Preaek Tnaot"},
		{district_id:"tuek-chhou",id:"prey-khmum", text: "Prey Khmum"},
		{district_id:"tuek-chhou",id:"prey-thnang", text: "Prey Thnang"},
		{district_id:"tuek-chhou",id:"stueng-kaev", text: "Stueng Kaev"},
		{district_id:"tuek-chhou",id:"thmei", text: "Thmei"},
		{district_id:"tuek-chhou",id:"trapeang-pring", text: "Trapeang Pring"},
		{district_id:"tuek-chhou",id:"trapeang-sangkae", text: "Trapeang Sangkae"},
		{district_id:"tuek-chhou",id:"kampong-kraeng", text: "Kampong Kraeng"},
		{district_id:"tuek-chhou",id:"trapeang-thum", text: "Trapeang Thum"},
		{district_id:"krong-kampot",id:"kampong-kandal", text: "Kampong Kandal"},
		{district_id:"krong-kampot",id:"krang-ampil", text: "Krang Ampil"},
		{district_id:"krong-kampot",id:"kampong-bay", text: "Kampong Bay"},
		{district_id:"krong-kampot",id:"andoung-khmaer", text: "Andoung Khmaer"},
		{district_id:"krong-kampot",id:"traeuy-kaoh", text: "Traeuy Kaoh"},
		{district_id:"kandal-stueng",id:"ampov-prey", text: "Ampov Prey"},
		{district_id:"kandal-stueng",id:"anlong-romiet", text: "Anlong Romiet"},
		{district_id:"kandal-stueng",id:"barku", text: "Barku"},
		{district_id:"kandal-stueng",id:"boeng-khyang", text: "Boeng Khyang"},
		{district_id:"kandal-stueng",id:"cheung-kaeub", text: "Cheung Kaeub"},
		{district_id:"kandal-stueng",id:"daeum-rues", text: "Daeum Rues"},
		{district_id:"kandal-stueng",id:"kandaok", text: "Kandaok"},
		{district_id:"kandal-stueng",id:"thmei", text: "Thmei"},
		{district_id:"kandal-stueng",id:"kouk-trab", text: "Kouk Trab"},
		{district_id:"kandal-stueng",id:"preah-putth", text: "Preah Putth"},
		{district_id:"kandal-stueng",id:"preaek-roka", text: "Preaek Roka"},
		{district_id:"kandal-stueng",id:"preaek-slaeng", text: "Preaek Slaeng"},
		{district_id:"kandal-stueng",id:"roka", text: "Roka"},
		{district_id:"kandal-stueng",id:"roleang-kaen", text: "Roleang Kaen"},
		{district_id:"kandal-stueng",id:"siem-reab", text: "Siem Reab"},
		{district_id:"kandal-stueng",id:"tbaeng", text: "Tbaeng"},
		{district_id:"kandal-stueng",id:"trapeang-veaeng", text: "Trapeang Veaeng"},
		{district_id:"kandal-stueng",id:"trea", text: "Trea"},
		{district_id:"kien-svay",id:"banteay-daek", text: "Banteay Daek"},
		{district_id:"kien-svay",id:"chheu-teal", text: "Chheu Teal"},
		{district_id:"kien-svay",id:"dei-edth", text: "Dei Edth"},
		{district_id:"kien-svay",id:"kampong-svay", text: "Kampong Svay"},
		{district_id:"kien-svay",id:"kokir", text: "Kokir"},
		{district_id:"kien-svay",id:"kokir-thum", text: "Kokir Thum"},
		{district_id:"kien-svay",id:"phum-thum", text: "Phum Thum"},
		{district_id:"kien-svay",id:"samraong-thum", text: "Samraong Thum"},
		{district_id:"khsach-kandal",id:"bak-dav", text: "Bak Dav"},
		{district_id:"khsach-kandal",id:"chey-thum", text: "Chey Thum"},
		{district_id:"khsach-kandal",id:"kampong-chamlang", text: "Kampong Chamlang"},
		{district_id:"khsach-kandal",id:"kaoh-chouram", text: "Kaoh Chouram"},
		{district_id:"khsach-kandal",id:"kaoh-oknha-tei", text: "Kaoh Oknha Tei"},
		{district_id:"khsach-kandal",id:"preah-prasab", text: "Preah Prasab"},
		{district_id:"khsach-kandal",id:"preaek-ampil", text: "Preaek Ampil"},
		{district_id:"khsach-kandal",id:"preaek-luong", text: "Preaek Luong"},
		{district_id:"khsach-kandal",id:"preaek-ta-kov", text: "Preaek Ta Kov"},
		{district_id:"khsach-kandal",id:"preaek-ta-meak", text: "Preaek Ta Meak"},
		{district_id:"khsach-kandal",id:"puk-ruessei", text: "Puk Ruessei"},
		{district_id:"khsach-kandal",id:"roka-chonlueng", text: "Roka Chonlueng"},
		{district_id:"khsach-kandal",id:"sanlung", text: "Sanlung"},
		{district_id:"khsach-kandal",id:"sithor", text: "Sithor"},
		{district_id:"khsach-kandal",id:"svay-chrum", text: "Svay Chrum"},
		{district_id:"khsach-kandal",id:"svay-romiet", text: "Svay Romiet"},
		{district_id:"khsach-kandal",id:"ta-aek", text: "Ta Aek"},
		{district_id:"khsach-kandal",id:"vihear-suork", text: "Vihear Suork"},
		{district_id:"kaoh-thum",id:"chheu-khmau", text: "Chheu Khmau"},
		{district_id:"kaoh-thum",id:"chrouy-ta-kaev", text: "Chrouy Ta Kaev"},
		{district_id:"kaoh-thum",id:"kampong-kong", text: "Kampong Kong"},
		{district_id:"kaoh-thum",id:"kaoh-thum-ka", text: "Kaoh Thum Ka"},
		{district_id:"kaoh-thum",id:"kaoh-thum-kha", text: "Kaoh Thum Kha"},
		{district_id:"kaoh-thum",id:"leuk-daek", text: "Leuk Daek"},
		{district_id:"kaoh-thum",id:"pouthi-ban", text: "Pouthi Ban"},
		{district_id:"kaoh-thum",id:"preaek-chrey", text: "Preaek Chrey"},
		{district_id:"kaoh-thum",id:"preaek-sdei", text: "Preaek Sdei"},
		{district_id:"kaoh-thum",id:"preaek-thmei", text: "Preaek Thmei"},
		{district_id:"kaoh-thum",id:"sampov-pun", text: "Sampov Pun"},
		{district_id:"leuk-daek",id:"kampong-phnum", text: "Kampong Phnum"},
		{district_id:"leuk-daek",id:"k-am-samnar", text: "K Am Samnar"},
		{district_id:"leuk-daek",id:"khpob-ateav", text: "Khpob Ateav"},
		{district_id:"leuk-daek",id:"peam-reang", text: "Peam Reang"},
		{district_id:"leuk-daek",id:"preaek-dach", text: "Preaek Dach"},
		{district_id:"leuk-daek",id:"preaek-tonloab", text: "Preaek Tonloab"},
		{district_id:"leuk-daek",id:"sandar", text: "Sandar"},
		{district_id:"lvea-aem",id:"akreiy-ksatr", text: "Akreiy Ksatr"},
		{district_id:"lvea-aem",id:"barong", text: "Barong"},
		{district_id:"lvea-aem",id:"boeng-krum", text: "Boeng Krum"},
		{district_id:"lvea-aem",id:"kaoh-kaev", text: "Kaoh Kaev"},
		{district_id:"lvea-aem",id:"kaoh-reah", text: "Kaoh Reah"},
		{district_id:"lvea-aem",id:"lvea-sa", text: "Lvea Sa"},
		{district_id:"lvea-aem",id:"peam-oknha-ong", text: "Peam Oknha Ong"},
		{district_id:"lvea-aem",id:"phum-thum", text: "Phum Thum"},
		{district_id:"lvea-aem",id:"preaek-kmeng", text: "Preaek Kmeng"},
		{district_id:"lvea-aem",id:"preaek-rey", text: "Preaek Rey"},
		{district_id:"lvea-aem",id:"preaek-ruessei", text: "Preaek Ruessei"},
		{district_id:"lvea-aem",id:"sambuor", text: "Sambuor"},
		{district_id:"lvea-aem",id:"sarikakaev", text: "Sarikakaev"},
		{district_id:"lvea-aem",id:"thma-kor", text: "Thma Kor"},
		{district_id:"lvea-aem",id:"tuek-khleang", text: "Tuek Khleang"},
		{district_id:"mukh-kampul",id:"preaek-anhchanh", text: "Preaek Anhchanh"},
		{district_id:"mukh-kampul",id:"preaek-dambang", text: "Preaek Dambang"},
		{district_id:"mukh-kampul",id:"roka-kaong-muoy", text: "Roka Kaong Muoy"},
		{district_id:"mukh-kampul",id:"roka-kaong-pir", text: "Roka Kaong Pir"},
		{district_id:"mukh-kampul",id:"ruessei-chrouy", text: "Ruessei Chrouy"},
		{district_id:"mukh-kampul",id:"sambuor-meas", text: "Sambuor Meas"},
		{district_id:"mukh-kampul",id:"svay-ampear", text: "Svay Ampear"},
		{district_id:"angk-snuol",id:"baek-chan", text: "Baek Chan"},
		{district_id:"angk-snuol",id:"chhak-chheu-neang", text: "Chhak Chheu Neang"},
		{district_id:"angk-snuol",id:"damnak-ampil", text: "Damnak Ampil"},
		{district_id:"angk-snuol",id:"krang-mkak", text: "Krang Mkak"},
		{district_id:"angk-snuol",id:"lumhach", text: "Lumhach"},
		{district_id:"angk-snuol",id:"mkak", text: "Mkak"},
		{district_id:"angk-snuol",id:"peuk", text: "Peuk"},
		{district_id:"angk-snuol",id:"prey-puok", text: "Prey Puok"},
		{district_id:"angk-snuol",id:"samraong-leu", text: "Samraong Leu"},
		{district_id:"angk-snuol",id:"tuol-prech", text: "Tuol Prech"},
		{district_id:"ponhea-lueu",id:"chhveang", text: "Chhveang"},
		{district_id:"ponhea-lueu",id:"chrey-loas", text: "Chrey Loas"},
		{district_id:"ponhea-lueu",id:"kampong-luong", text: "Kampong Luong"},
		{district_id:"ponhea-lueu",id:"kampong-os", text: "Kampong Os"},
		{district_id:"ponhea-lueu",id:"kaoh-chen", text: "Kaoh Chen"},
		{district_id:"ponhea-lueu",id:"phnum-bat", text: "Phnum Bat"},
		{district_id:"ponhea-lueu",id:"ponhea-pon", text: "Ponhea Pon"},
		{district_id:"ponhea-lueu",id:"preaek-ta-teaen", text: "Preaek Ta Teaen"},
		{district_id:"ponhea-lueu",id:"phsar-daek", text: "Phsar Daek"},
		{district_id:"ponhea-lueu",id:"tumnob-thum", text: "Tumnob Thum"},
		{district_id:"ponhea-lueu",id:"vihear-luong", text: "Vihear Luong"},
		{district_id:"sa-ang",id:"khpob", text: "Khpob"},
		{district_id:"sa-ang",id:"kaoh-anlong-chen", text: "Kaoh Anlong Chen"},
		{district_id:"sa-ang",id:"kaoh-khael", text: "Kaoh Khael"},
		{district_id:"sa-ang",id:"kaoh-khsach-tonlea", text: "Kaoh Khsach Tonlea"},
		{district_id:"sa-ang",id:"krang-yov", text: "Krang Yov"},
		{district_id:"sa-ang",id:"prasat", text: "Prasat"},
		{district_id:"sa-ang",id:"preaek-ambel", text: "Preaek Ambel"},
		{district_id:"sa-ang",id:"preaek-koy", text: "Preaek Koy"},
		{district_id:"sa-ang",id:"roka-khpos", text: "Roka Khpos"},
		{district_id:"sa-ang",id:"s-ang-phnum", text: "S Ang Phnum"},
		{district_id:"sa-ang",id:"setbou", text: "Setbou"},
		{district_id:"sa-ang",id:"svay-prateal", text: "Svay Prateal"},
		{district_id:"sa-ang",id:"svay-rolum", text: "Svay Rolum"},
		{district_id:"sa-ang",id:"ta-lon", text: "Ta Lon"},
		{district_id:"sa-ang",id:"traeuy-sla", text: "Traeuy Sla"},
		{district_id:"sa-ang",id:"tuek-vil", text: "Tuek Vil"},
		{district_id:"krong-ta-khmau",id:"kampong-phnum", text: "Kampong Phnum"},
		{district_id:"krong-ta-khmau",id:"daeum-mien", text: "Daeum Mien"},
		{district_id:"krong-ta-khmau",id:"ta-kdol", text: "Ta Kdol"},
		{district_id:"krong-ta-khmau",id:"ta-khmau", text: "Ta Khmau"},
		{district_id:"krong-ta-khmau",id:"preaek-hou", text: "Preaek Hou"},
		{district_id:"krong-ta-khmau",id:"kampong-samnanh", text: "Kampong Samnanh"},
		{district_id:"botum-sakor",id:"andoung-tuek", text: "Andoung Tuek"},
		{district_id:"botum-sakor",id:"kandaol", text: "Kandaol"},
		{district_id:"botum-sakor",id:"ta-nuon", text: "Ta Nuon"},
		{district_id:"botum-sakor",id:"thma-sa", text: "Thma Sa"},
		{district_id:"kiri-sakor",id:"kaoh-sdach", text: "Kaoh Sdach"},
		{district_id:"kiri-sakor",id:"phnhi-meas", text: "Phnhi Meas"},
		{district_id:"kiri-sakor",id:"preaek-khsach", text: "Preaek Khsach"},
		{district_id:"koh-kong",id:"chrouy-pras", text: "Chrouy Pras"},
		{district_id:"koh-kong",id:"kaoh-kapi", text: "Kaoh Kapi"},
		{district_id:"koh-kong",id:"ta-tai-kraom", text: "Ta Tai Kraom"},
		{district_id:"koh-kong",id:"trapeang-rung", text: "Trapeang Rung"},
		{district_id:"krong-khemara-phoumin",id:"smach-mean-chey", text: "Smach Mean Chey"},
		{district_id:"krong-khemara-phoumin",id:"dang-tong", text: "Dang Tong"},
		{district_id:"krong-khemara-phoumin",id:"stueng-veaeng", text: "Stueng Veaeng"},
		{district_id:"mondol-seima",id:"bak-khlang", text: "Bak Khlang"},
		{district_id:"mondol-seima",id:"peam-krasaob", text: "Peam Krasaob"},
		{district_id:"mondol-seima",id:"tuol-kokir-leu", text: "Tuol Kokir Leu"},
		{district_id:"srae-ambel",id:"boeng-preav", text: "Boeng Preav"},
		{district_id:"srae-ambel",id:"chi-kha-kraom", text: "Chi Kha Kraom"},
		{district_id:"srae-ambel",id:"chi-kha-leu", text: "Chi Kha Leu"},
		{district_id:"srae-ambel",id:"chrouy-svay", text: "Chrouy Svay"},
		{district_id:"srae-ambel",id:"dang-peaeng", text: "Dang Peaeng"},
		{district_id:"srae-ambel",id:"srae-ambel", text: "Srae Ambel"},
		{district_id:"thma-bang",id:"bak-khlang", text: "Bak Khlang"},
		{district_id:"thma-bang",id:"peam-krasaob", text: "Peam Krasaob"},
		{district_id:"thma-bang",id:"chi-kha-leu", text: "Chi Kha Leu"},
		{district_id:"thma-bang",id:"chrouy-svay", text: "Chrouy Svay"},
		{district_id:"thma-bang",id:"dang-peaeng", text: "Dang Peaeng"},
		{district_id:"thma-bang",id:"srae-ambel", text: "Srae Ambel"},
		{district_id:"chhloung",id:"chhloung", text: "Chhloung"},
		{district_id:"chhloung",id:"damrei-phong", text: "Damrei Phong"},
		{district_id:"chhloung",id:"han-chey", text: "Han Chey"},
		{district_id:"chhloung",id:"kampong-damrei", text: "Kampong Damrei"},
		{district_id:"chhloung",id:"kanhchor", text: "Kanhchor"},
		{district_id:"chhloung",id:"khsach-andaet", text: "Khsach Andaet"},
		{district_id:"chhloung",id:"pongro", text: "Pongro"},
		{district_id:"chhloung",id:"preaek-saman", text: "Preaek Saman"},
		{district_id:"krong-kratie",id:"kaoh-trong", text: "Kaoh Trong"},
		{district_id:"krong-kratie",id:"krakor", text: "Krakor"},
		{district_id:"krong-kratie",id:"kracheh", text: "Kracheh"},
		{district_id:"krong-kratie",id:"ou-ruessei", text: "Ou Ruessei"},
		{district_id:"krong-kratie",id:"roka-kandal", text: "Roka Kandal"},
		{district_id:"preaek-prasab",id:"chambak", text: "Chambak"},
		{district_id:"preaek-prasab",id:"chrouy-banteay", text: "Chrouy Banteay"},
		{district_id:"preaek-prasab",id:"kampong-kor", text: "Kampong Kor"},
		{district_id:"preaek-prasab",id:"kaoh-ta-suy", text: "Kaoh Ta Suy"},
		{district_id:"preaek-prasab",id:"preaek-prasab", text: "Preaek Prasab"},
		{district_id:"preaek-prasab",id:"ruessei-keo", text: "Ruessei Keo"},
		{district_id:"preaek-prasab",id:"saob", text: "Saob"},
		{district_id:"preaek-prasab",id:"ta-mau", text: "Ta Mau"},
		{district_id:"sambour",id:"boeng-char", text: "Boeng Char"},
		{district_id:"sambour",id:"kampong-cham", text: "Kampong Cham"},
		{district_id:"sambour",id:"kbal-damrei", text: "Kbal Damrei"},
		{district_id:"sambour",id:"kaoh-khnhaer", text: "Kaoh Khnhaer"},
		{district_id:"sambour",id:"ou-krieng", text: "Ou Krieng"},
		{district_id:"sambour",id:"roluos-mean-chey", text: "Roluos Mean Chey"},
		{district_id:"sambour",id:"sambour", text: "Sambour"},
		{district_id:"sambour",id:"sandan", text: "Sandan"},
		{district_id:"sambour",id:"srae-chis", text: "Srae Chis"},
		{district_id:"sambour",id:"voadthanak", text: "Voadthanak"},
		{district_id:"snuol",id:"khsuem", text: "Khsuem"},
		{district_id:"snuol",id:"pir-thnu", text: "Pir Thnu"},
		{district_id:"snuol",id:"snuol", text: "Snuol"},
		{district_id:"snuol",id:"srae-char", text: "Srae Char"},
		{district_id:"snuol",id:"svay-chreah", text: "Svay Chreah"},
		{district_id:"snuol",id:"kronhoung-sen-chey", text: "Kronhoung Sen Chey"},
		{district_id:"chitr-borie",id:"bos-leav", text: "Bos Leav"},
		{district_id:"chitr-borie",id:"changkrang", text: "Changkrang"},
		{district_id:"chitr-borie",id:"dar", text: "Dar"},
		{district_id:"chitr-borie",id:"kantuot", text: "Kantuot"},
		{district_id:"chitr-borie",id:"kou-loab", text: "Kou Loab"},
		{district_id:"chitr-borie",id:"kaoh-chraeng", text: "Kaoh Chraeng"},
		{district_id:"chitr-borie",id:"sambok", text: "Sambok"},
		{district_id:"chitr-borie",id:"thma-andaeuk", text: "Thma Andaeuk"},
		{district_id:"chitr-borie",id:"thma-kreae", text: "Thma Kreae"},
		{district_id:"chitr-borie",id:"thmei", text: "Thmei"},
		{district_id:"kaev-seima",id:"chong-phlah", text: "Chong Phlah"},
		{district_id:"kaev-seima",id:"memang", text: "Memang"},
		{district_id:"kaev-seima",id:"srae-chhuk", text: "Srae Chhuk"},
		{district_id:"kaev-seima",id:"srae-khtum", text: "Srae Khtum"},
		{district_id:"kaev-seima",id:"srae-preah", text: "Srae Preah"},
		{district_id:"kaoh-nheaek",id:"nang-khi-lik", text: "Nang Khi Lik"},
		{district_id:"kaoh-nheaek",id:"a-buon-leu", text: "A Buon Leu"},
		{district_id:"kaoh-nheaek",id:"roya", text: "Roya"},
		{district_id:"kaoh-nheaek",id:"sokh-sant", text: "Sokh Sant"},
		{district_id:"kaoh-nheaek",id:"srae-huy", text: "Srae Huy"},
		{district_id:"kaoh-nheaek",id:"srae-sangkum", text: "Srae Sangkum"},
		{district_id:"ou-reang",id:"dak-dam", text: "Dak Dam"},
		{district_id:"ou-reang",id:"saen-monourom", text: "Saen Monourom"},
		{district_id:"pechr-chenda",id:"krang-teh", text: "Krang Teh"},
		{district_id:"pechr-chenda",id:"pu-chrey", text: "Pu Chrey"},
		{district_id:"pechr-chenda",id:"srae-ampum", text: "Srae Ampum"},
		{district_id:"pechr-chenda",id:"bu-sra", text: "Bu Sra"},
		{district_id:"krong-saen-monourom",id:"monourom", text: "Monourom"},
		{district_id:"krong-saen-monourom",id:"sokh-dom", text: "Sokh Dom"},
		{district_id:"krong-saen-monourom",id:"spean-mean-chey", text: "Spean Mean Chey"},
		{district_id:"krong-saen-monourom",id:"romonea", text: "Romonea"},
		{district_id:"chamkar-mon",id:"tonle-bassac", text: "Tonle Bassac"},
		{district_id:"chamkar-mon",id:"beung-kengkang1", text: "Beung Kengkang1"},
		{district_id:"chamkar-mon",id:"beung-kengkang2", text: "Beung Kengkang2"},
		{district_id:"chamkar-mon",id:"beung-kengkang3", text: "Beung Kengkang3"},
		{district_id:"chamkar-mon",id:"olympic", text: "Olympic"},
		{district_id:"chamkar-mon",id:"toul-svayprey1", text: "Toul Svayprey1"},
		{district_id:"chamkar-mon",id:"toul-svayprey2", text: "Toul Svayprey2"},
		{district_id:"chamkar-mon",id:"tomnub-teuk", text: "Tomnub Teuk"},
		{district_id:"chamkar-mon",id:"toul-tompung1", text: "Toul Tompung1"},
		{district_id:"chamkar-mon",id:"toul-tompung2", text: "Toul Tompung2"},
		{district_id:"chamkar-mon",id:"beung-trabaek", text: "Beung Trabaek"},
		{district_id:"chamkar-mon",id:"psar-deumtkov", text: "Psar Deumtkov"},
		{district_id:"doun-penh",id:"psar-thmei1", text: "Psar Thmei1"},
		{district_id:"doun-penh",id:"psar-thmei2", text: "Psar Thmei2"},
		{district_id:"doun-penh",id:"psar-thmei3", text: "Psar Thmei3"},
		{district_id:"doun-penh",id:"boeung-reang", text: "Boeung Reang"},
		{district_id:"doun-penh",id:"psar-kandal1", text: "Psar Kandal1"},
		{district_id:"doun-penh",id:"psar-kandal2", text: "Psar Kandal2"},
		{district_id:"doun-penh",id:"chaktomukh", text: "Chaktomukh"},
		{district_id:"doun-penh",id:"chey-chumneah", text: "Chey Chumneah"},
		{district_id:"doun-penh",id:"psar-chas", text: "Psar Chas"},
		{district_id:"doun-penh",id:"srah-chork", text: "Srah Chork"},
		{district_id:"doun-penh",id:"vat-phnum", text: "Vat Phnum"},
		{district_id:"prampir-meakkakra",id:"o-reussei-1", text: "O Reussei 1"},
		{district_id:"prampir-meakkakra",id:"o-reussei-2", text: "O Reussei 2"},
		{district_id:"prampir-meakkakra",id:"o-reussei-3", text: "O Reussei 3"},
		{district_id:"prampir-meakkakra",id:"o-reussei-4", text: "O Reussei 4"},
		{district_id:"prampir-meakkakra",id:"monorom", text: "Monorom"},
		{district_id:"prampir-meakkakra",id:"mittapheap", text: "Mittapheap"},
		{district_id:"prampir-meakkakra",id:"vealvong", text: "Vealvong"},
		{district_id:"prampir-meakkakra",id:"beung-prolit", text: "Beung Prolit"},
		{district_id:"tuol-kouk",id:"psar-depot1", text: "Psar Depot1"},
		{district_id:"tuol-kouk",id:"psar-depot2", text: "Psar Depot2"},
		{district_id:"tuol-kouk",id:"psar-depot3", text: "Psar Depot3"},
		{district_id:"tuol-kouk",id:"teuk-laork1", text: "Teuk Laork1"},
		{district_id:"tuol-kouk",id:"teuk-laork2", text: "Teuk Laork2"},
		{district_id:"tuol-kouk",id:"teuk-laork3", text: "Teuk Laork3"},
		{district_id:"tuol-kouk",id:"beung-kok1", text: "Beung Kok1"},
		{district_id:"tuol-kouk",id:"beung-kok12", text: "Beung Kok12"},
		{district_id:"tuol-kouk",id:"psar-deumkor", text: "Psar Deumkor"},
		{district_id:"tuol-kouk",id:"beung-salang", text: "Beung Salang"},
		{district_id:"dangkao",id:"dangkor", text: "Dangkor"},
		{district_id:"dangkao",id:"prey-sa", text: "Prey Sa"},
		{district_id:"dangkao",id:"cheung-aek", text: "Cheung Aek"},
		{district_id:"dangkao",id:"spean-thma", text: "Spean Thma"},
		{district_id:"dangkao",id:"prey-vaeng", text: "Prey Vaeng"},
		{district_id:"dangkao",id:"pong-tuek", text: "Pong Tuek"},
		{district_id:"dangkao",id:"prateah-lang", text: "Prateah Lang"},
		{district_id:"dangkao",id:"sak-sampov", text: "Sak Sampov"},
		{district_id:"dangkao",id:"krang-pongro", text: "Krang Pongro"},
		{district_id:"dangkao",id:"kong-noy", text: "Kong Noy"},
		{district_id:"dangkao",id:"tien", text: "Tien"},
		{district_id:"dangkao",id:"praek-kampues", text: "Praek Kampues"},
		{district_id:"dangkao",id:"roluos", text: "Roluos"},
		{district_id:"mean-chey",id:"stung-meanchey-mouy", text: "Stung Meanchey Mouy"},
		{district_id:"mean-chey",id:"boeng-tompun-ti-mouy", text: "Boeng Tompun Ti Mouy"},
		{district_id:"mean-chey",id:"chak-angrae-leu", text: "Chak Angrae Leu"},
		{district_id:"mean-chey",id:"chak-angrae-kroam", text: "Chak Angrae Kroam"},
		{district_id:"mean-chey",id:"boeng-tompun-ti-pir", text: "Boeng Tompun Ti Pir"},
		{district_id:"mean-chey",id:"stung-meanchey-ti-pir", text: "Stung Meanchey Ti Pir"},
		{district_id:"mean-chey",id:"stung-meanchey-ti-bey", text: "Stung Meanchey Ti Bey"},
		{district_id:"russey-keo",id:"svay-pak", text: "Svay Pak"},
		{district_id:"russey-keo",id:"chrang-chamreh-1", text: "Chrang Chamreh 1"},
		{district_id:"russey-keo",id:"chrang-chamreh-2", text: "Chrang Chamreh 2"},
		{district_id:"russey-keo",id:"kilometr-lek-6", text: "Kilometr Lek 6"},
		{district_id:"russey-keo",id:"toul-sangke-ti-mouy", text: "Toul Sangke Ti Mouy"},
		{district_id:"russey-keo",id:"russey-keo", text: "Russey Keo"},
		{district_id:"russey-keo",id:"toul-sangke-ti-pir", text: "Toul Sangke Ti Pir"},
		{district_id:"sen-sok",id:"krang-thnong", text: "Krang Thnong"},
		{district_id:"sen-sok",id:"khmuonh", text: "Khmuonh"},
		{district_id:"sen-sok",id:"phnom-penh-thmei", text: "Phnom Penh Thmei"},
		{district_id:"sen-sok",id:"tuek-thla", text: "Tuek Thla"},
		{district_id:"sen-sok",id:"our-bek-k-om", text: "Our Bek K Om"},
		{district_id:"sen-sok",id:"kork-kleang", text: "Kork Kleang"},
		{district_id:"pou-senchey",id:"ovlaok", text: "Ovlaok"},
		{district_id:"pou-senchey",id:"kamboul", text: "Kamboul"},
		{district_id:"pou-senchey",id:"kantaok", text: "Kantaok"},
		{district_id:"pou-senchey",id:"boeng-thum", text: "Boeng Thum"},
		{district_id:"pou-senchey",id:"phleung-chheh-roteh", text: "Phleung Chheh Roteh"},
		{district_id:"pou-senchey",id:"chaom-chau-ti-mouy", text: "Chaom Chau Ti Mouy"},
		{district_id:"pou-senchey",id:"trapeang-krasang", text: "Trapeang Krasang"},
		{district_id:"pou-senchey",id:"kakab-ti-mouy", text: "Kakab Ti Mouy"},
		{district_id:"pou-senchey",id:"samraong-kraom", text: "Samraong Kraom"},
		{district_id:"pou-senchey",id:"snaor", text: "Snaor"},
		{district_id:"pou-senchey",id:"chaom-chau-ti-pir", text: "Chaom Chau Ti Pir"},
		{district_id:"pou-senchey",id:"chaom-chau-ti-bey", text: "Chaom Chau Ti Bey"},
		{district_id:"pou-senchey",id:"kakab-ti-pir", text: "Kakab Ti Pir"},
		{district_id:"chrouy-changvar",id:"bak-kheng", text: "Bak Kheng"},
		{district_id:"chrouy-changvar",id:"praek-leab", text: "Praek Leab"},
		{district_id:"chrouy-changvar",id:"praek-ta-sek", text: "Praek Ta Sek"},
		{district_id:"chrouy-changvar",id:"chrouy-changvar", text: "Chrouy Changvar"},
		{district_id:"chrouy-changvar",id:"kaoh-dach", text: "Kaoh Dach"},
		{district_id:"preaek-pnov",id:"ponsang", text: "Ponsang"},
		{district_id:"preaek-pnov",id:"kouk-roka", text: "Kouk Roka"},
		{district_id:"preaek-pnov",id:"samraong", text: "Samraong"},
		{district_id:"preaek-pnov",id:"ponhea-pon", text: "Ponhea Pon"},
		{district_id:"preaek-pnov",id:"praek-phnov", text: "Praek Phnov"},
		{district_id:"chbar-ampov",id:"chbar-ampov-1", text: "Chbar Ampov 1"},
		{district_id:"chbar-ampov",id:"chbar-ampov-2", text: "Chbar Ampov 2"},
		{district_id:"chbar-ampov",id:"nirouth", text: "Nirouth"},
		{district_id:"chbar-ampov",id:"praek-pra", text: "Praek Pra"},
		{district_id:"chbar-ampov",id:"praek-thmei", text: "Praek Thmei"},
		{district_id:"chbar-ampov",id:"kbal-kaoh", text: "Kbal Kaoh"},
		{district_id:"chbar-ampov",id:"praek-aeng", text: "Praek Aeng"},
		{district_id:"chbar-ampov",id:"veal-sbov", text: "Veal Sbov"},
		{district_id:"chey-saen",id:"s-ang", text: "S Ang"},
		{district_id:"chey-saen",id:"tasu", text: "Tasu"},
		{district_id:"chey-saen",id:"khyang", text: "Khyang"},
		{district_id:"chey-saen",id:"chrach", text: "Chrach"},
		{district_id:"chey-saen",id:"thmea", text: "Thmea"},
		{district_id:"chey-saen",id:"putrea", text: "Putrea"},
		{district_id:"chhaeb",id:"chhaeb-muoy", text: "Chhaeb Muoy"},
		{district_id:"chhaeb",id:"chhaeb-pir", text: "Chhaeb Pir"},
		{district_id:"chhaeb",id:"sangkae-muoy", text: "Sangkae Muoy"},
		{district_id:"chhaeb",id:"sangkae-pir", text: "Sangkae Pir"},
		{district_id:"chhaeb",id:"mlu-prey-muoy", text: "Mlu Prey Muoy"},
		{district_id:"chhaeb",id:"mlu-prey-pir", text: "Mlu Prey Pir"},
		{district_id:"chhaeb",id:"kampong-sralau-muoy", text: "Kampong Sralau Muoy"},
		{district_id:"chhaeb",id:"kampong-sralau-pir", text: "Kampong Sralau Pir"},
		{district_id:"choam-khsant",id:"choam-ksant", text: "Choam Ksant"},
		{district_id:"choam-khsant",id:"tuek-kraham", text: "Tuek Kraham"},
		{district_id:"choam-khsant",id:"pring-thum", text: "Pring Thum"},
		{district_id:"choam-khsant",id:"rumdaoh-srae", text: "Rumdaoh Srae"},
		{district_id:"choam-khsant",id:"yeang", text: "Yeang"},
		{district_id:"choam-khsant",id:"kantuot", text: "Kantuot"},
		{district_id:"kuleaen",id:"kuleaen-tboung", text: "Kuleaen Tboung"},
		{district_id:"kuleaen",id:"kuleaen-cheung", text: "Kuleaen Cheung"},
		{district_id:"kuleaen",id:"thmei", text: "Thmei"},
		{district_id:"kuleaen",id:"phnum-penh", text: "Phnum Penh"},
		{district_id:"kuleaen",id:"phnum-tbaeng-pir", text: "Phnum Tbaeng Pir"},
		{district_id:"kuleaen",id:"srayang", text: "Srayang"},
		{district_id:"rovieng",id:"robieb", text: "Robieb"},
		{district_id:"rovieng",id:"reaksmei", text: "Reaksmei"},
		{district_id:"rovieng",id:"rohas", text: "Rohas"},
		{district_id:"rovieng",id:"rung-roeang", text: "Rung Roeang"},
		{district_id:"rovieng",id:"rik-reay", text: "Rik Reay"},
		{district_id:"rovieng",id:"ruos-roan", text: "Ruos Roan"},
		{district_id:"rovieng",id:"rotanak", text: "Rotanak"},
		{district_id:"rovieng",id:"rieb-roy", text: "Rieb Roy"},
		{district_id:"rovieng",id:"reaksa", text: "Reaksa"},
		{district_id:"rovieng",id:"rumdaoh", text: "Rumdaoh"},
		{district_id:"rovieng",id:"romtum", text: "Romtum"},
		{district_id:"rovieng",id:"romoneiy", text: "Romoneiy"},
		{district_id:"sangkom-thmei",id:"chamraeun", text: "Chamraeun"},
		{district_id:"sangkom-thmei",id:"ro-ang", text: "Ro Ang"},
		{district_id:"sangkom-thmei",id:"phnum-tbaeng-muoy", text: "Phnum Tbaeng Muoy"},
		{district_id:"sangkom-thmei",id:"sdau", text: "Sdau"},
		{district_id:"sangkom-thmei",id:"ronak-ser", text: "Ronak Ser"},
		{district_id:"tbaeng-mean-chey",id:"chhean-mukh", text: "Chhean Mukh"},
		{district_id:"tbaeng-mean-chey",id:"pou", text: "Pou"},
		{district_id:"tbaeng-mean-chey",id:"prame", text: "Prame"},
		{district_id:"tbaeng-mean-chey",id:"preah-khleang", text: "Preah Khleang"},
		{district_id:"krong-preah-vihear",id:"kampong-pranak", text: "Kampong Pranak"},
		{district_id:"krong-preah-vihear",id:"pal-hal", text: "Pal Hal"},
		{district_id:"ba-phnum",id:"boeng-preah", text: "Boeng Preah"},
		{district_id:"ba-phnum",id:"cheung-phnum", text: "Cheung Phnum"},
		{district_id:"ba-phnum",id:"chheu-kach", text: "Chheu Kach"},
		{district_id:"ba-phnum",id:"reaks-chey", text: "Reaks Chey"},
		{district_id:"ba-phnum",id:"roung-damrei", text: "Roung Damrei"},
		{district_id:"ba-phnum",id:"sdau-kaong", text: "Sdau Kaong"},
		{district_id:"ba-phnum",id:"spueu-ka", text: "Spueu Ka"},
		{district_id:"ba-phnum",id:"spueu-kha", text: "Spueu Kha"},
		{district_id:"ba-phnum",id:"theay", text: "Theay"},
		{district_id:"kamchay-mear",id:"cheach", text: "Cheach"},
		{district_id:"kamchay-mear",id:"doun-koeng", text: "Doun Koeng"},
		{district_id:"kamchay-mear",id:"kranhung", text: "Kranhung"},
		{district_id:"kamchay-mear",id:"krabau", text: "Krabau"},
		{district_id:"kamchay-mear",id:"seang-khveang", text: "Seang Khveang"},
		{district_id:"kamchay-mear",id:"smaong-khang-cheung", text: "Smaong Khang Cheung"},
		{district_id:"kamchay-mear",id:"smaong-khang-tboung", text: "Smaong Khang Tboung"},
		{district_id:"kamchay-mear",id:"trabaek", text: "Trabaek"},
		{district_id:"kampong-trabaek",id:"ansaong", text: "Ansaong"},
		{district_id:"kampong-trabaek",id:"cham", text: "Cham"},
		{district_id:"kampong-trabaek",id:"cheang-daek", text: "Cheang Daek"},
		{district_id:"kampong-trabaek",id:"chrey", text: "Chrey"},
		{district_id:"kampong-trabaek",id:"kansoam-ak", text: "Kansoam Ak"},
		{district_id:"kampong-trabaek",id:"kou-khchak", text: "Kou Khchak"},
		{district_id:"kampong-trabaek",id:"kampong-trabaek", text: "Kampong Trabaek"},
		{district_id:"kampong-trabaek",id:"peam-montear", text: "Peam Montear"},
		{district_id:"kampong-trabaek",id:"prasat", text: "Prasat"},
		{district_id:"kampong-trabaek",id:"pratheat", text: "Pratheat"},
		{district_id:"kampong-trabaek",id:"prey-chhor", text: "Prey Chhor"},
		{district_id:"kampong-trabaek",id:"prey-poun", text: "Prey Poun"},
		{district_id:"kampong-trabaek",id:"thkov", text: "Thkov"},
		{district_id:"kanhchriech",id:"chong-ampil", text: "Chong Ampil"},
		{district_id:"kanhchriech",id:"kanhchriech", text: "Kanhchriech"},
		{district_id:"kanhchriech",id:"kdoeang-reay", text: "Kdoeang Reay"},
		{district_id:"kanhchriech",id:"kouk-kong-kaeut", text: "Kouk Kong Kaeut"},
		{district_id:"kanhchriech",id:"kouk-kong-lech", text: "Kouk Kong Lech"},
		{district_id:"kanhchriech",id:"preal", text: "Preal"},
		{district_id:"kanhchriech",id:"thma-pun", text: "Thma Pun"},
		{district_id:"kanhchriech",id:"tnaot", text: "Tnaot"},
		{district_id:"me-sang",id:"angkor-sar", text: "Angkor Sar"},
		{district_id:"me-sang",id:"chres", text: "Chres"},
		{district_id:"me-sang",id:"chi-phoch", text: "Chi Phoch"},
		{district_id:"me-sang",id:"prey-khnes", text: "Prey Khnes"},
		{district_id:"me-sang",id:"prey-rumdeng", text: "Prey Rumdeng"},
		{district_id:"me-sang",id:"prey-totueng", text: "Prey Totueng"},
		{district_id:"me-sang",id:"svay-chrum", text: "Svay Chrum"},
		{district_id:"me-sang",id:"trapeang-srae", text: "Trapeang Srae"},
		{district_id:"peam-chor",id:"angkor-angk", text: "Angkor Angk"},
		{district_id:"peam-chor",id:"kampong-prasat", text: "Kampong Prasat"},
		{district_id:"peam-chor",id:"kaoh-chek", text: "Kaoh Chek"},
		{district_id:"peam-chor",id:"kaoh-roka", text: "Kaoh Roka"},
		{district_id:"peam-chor",id:"kaoh-sampov", text: "Kaoh Sampov"},
		{district_id:"peam-chor",id:"krang-ta-yang", text: "Krang Ta Yang"},
		{district_id:"peam-chor",id:"preaek-krabau", text: "Preaek Krabau"},
		{district_id:"peam-chor",id:"preaek-sambuor", text: "Preaek Sambuor"},
		{district_id:"peam-chor",id:"ruessei-srok", text: "Ruessei Srok"},
		{district_id:"peam-chor",id:"svay-phluoh", text: "Svay Phluoh"},
		{district_id:"peam-ro",id:"ba-baong", text: "Ba Baong"},
		{district_id:"peam-ro",id:"banlich-prasat", text: "Banlich Prasat"},
		{district_id:"peam-ro",id:"neak-loeang", text: "Neak Loeang"},
		{district_id:"peam-ro",id:"peam-mean-chey", text: "Peam Mean Chey"},
		{district_id:"peam-ro",id:"peam-ro", text: "Peam Ro"},
		{district_id:"peam-ro",id:"preaek-khsay-ka", text: "Preaek Khsay Ka"},
		{district_id:"peam-ro",id:"preaek-khsay-kha", text: "Preaek Khsay Kha"},
		{district_id:"peam-ro",id:"prey-kandieng", text: "Prey Kandieng"},
		{district_id:"pea-reang",id:"kampong-popil", text: "Kampong Popil"},
		{district_id:"pea-reang",id:"kanhcham", text: "Kanhcham"},
		{district_id:"pea-reang",id:"kampong-prang", text: "Kampong Prang"},
		{district_id:"pea-reang",id:"kampong-ruessei", text: "Kampong Ruessei"},
		{district_id:"pea-reang",id:"mesar-prachan", text: "Mesar Prachan"},
		{district_id:"pea-reang",id:"preaek-ta-sar", text: "Preaek Ta Sar"},
		{district_id:"pea-reang",id:"prey-pnov", text: "Prey Pnov"},
		{district_id:"pea-reang",id:"prey-sniet", text: "Prey Sniet"},
		{district_id:"pea-reang",id:"prey-sralet", text: "Prey Sralet"},
		{district_id:"pea-reang",id:"reab", text: "Reab"},
		{district_id:"pea-reang",id:"roka", text: "Roka"},
		{district_id:"preah-sdach",id:"angkor-reach", text: "Angkor Reach"},
		{district_id:"preah-sdach",id:"banteay-chakrei", text: "Banteay Chakrei"},
		{district_id:"preah-sdach",id:"boeng-daol", text: "Boeng Daol"},
		{district_id:"preah-sdach",id:"chey-kampok", text: "Chey Kampok"},
		{district_id:"preah-sdach",id:"kampong-soeng", text: "Kampong Soeng"},
		{district_id:"preah-sdach",id:"krang-svay", text: "Krang Svay"},
		{district_id:"preah-sdach",id:"lvea", text: "Lvea"},
		{district_id:"preah-sdach",id:"preah-sdach", text: "Preah Sdach"},
		{district_id:"preah-sdach",id:"reathor", text: "Reathor"},
		{district_id:"preah-sdach",id:"rumchek", text: "Rumchek"},
		{district_id:"preah-sdach",id:"sena-reach-otdam", text: "Sena Reach Otdam"},
		{district_id:"krong-prey-veaeng",id:"baray", text: "Baray"},
		{district_id:"krong-prey-veaeng",id:"cheung-tuek", text: "Cheung Tuek"},
		{district_id:"krong-prey-veaeng",id:"kampong-leav", text: "Kampong Leav"},
		{district_id:"por-reang",id:"pou-rieng", text: "Pou Rieng"},
		{district_id:"por-reang",id:"preaek-anteah", text: "Preaek Anteah"},
		{district_id:"por-reang",id:"preaek-chrey", text: "Preaek Chrey"},
		{district_id:"por-reang",id:"prey-kanlaong", text: "Prey Kanlaong"},
		{district_id:"por-reang",id:"ta-kao", text: "Ta Kao"},
		{district_id:"por-reang",id:"kampong-russei", text: "Kampong Russei"},
		{district_id:"por-reang",id:"ta-sar", text: "Ta Sar"},
		{district_id:"sithor-kandal",id:"ampil-krau", text: "Ampil Krau"},
		{district_id:"sithor-kandal",id:"chrey-khmum", text: "Chrey Khmum"},
		{district_id:"sithor-kandal",id:"lve", text: "Lve"},
		{district_id:"sithor-kandal",id:"pnov-ti-muoy", text: "Pnov Ti Muoy"},
		{district_id:"sithor-kandal",id:"pnov-ti-pir", text: "Pnov Ti Pir"},
		{district_id:"sithor-kandal",id:"pou-ti", text: "Pou Ti"},
		{district_id:"sithor-kandal",id:"preaek-changkran", text: "Preaek Changkran"},
		{district_id:"sithor-kandal",id:"prey-daeum-thnoeng", text: "Prey Daeum Thnoeng"},
		{district_id:"sithor-kandal",id:"prey-tueng", text: "Prey Tueng"},
		{district_id:"sithor-kandal",id:"rumlech", text: "Rumlech"},
		{district_id:"sithor-kandal",id:"ruessei-sanh", text: "Ruessei Sanh"},
		{district_id:"svay-ontor",id:"angkor-tret", text: "Angkor Tret"},
		{district_id:"svay-ontor",id:"chea-khlang", text: "Chea Khlang"},
		{district_id:"svay-ontor",id:"chrey", text: "Chrey"},
		{district_id:"svay-ontor",id:"damrei-puon", text: "Damrei Puon"},
		{district_id:"svay-ontor",id:"me-bon", text: "Me Bon"},
		{district_id:"svay-ontor",id:"pean-roung", text: "Pean Roung"},
		{district_id:"svay-ontor",id:"popueus", text: "Popueus"},
		{district_id:"svay-ontor",id:"prey-khla", text: "Prey Khla"},
		{district_id:"svay-ontor",id:"samraong", text: "Samraong"},
		{district_id:"svay-ontor",id:"svay-antor", text: "Svay Antor"},
		{district_id:"svay-ontor",id:"tuek-thla", text: "Tuek Thla"},
		{district_id:"bakan",id:"boeng-bat-kandaol", text: "Boeng Bat Kandaol"},
		{district_id:"bakan",id:"boeng-khnar", text: "Boeng Khnar"},
		{district_id:"bakan",id:"khnar-totueng", text: "Khnar Totueng"},
		{district_id:"bakan",id:"me-tuek", text: "Me Tuek"},
		{district_id:"bakan",id:"ou-ta-paong", text: "Ou Ta Paong"},
		{district_id:"bakan",id:"rumlech", text: "Rumlech"},
		{district_id:"bakan",id:"snam-preah", text: "Snam Preah"},
		{district_id:"bakan",id:"svay-doun-kaev", text: "Svay Doun Kaev"},
		{district_id:"bakan",id:"ta-lou", text: "Ta Lou"},
		{district_id:"bakan",id:"trapeang-chorng", text: "Trapeang Chorng"},
		{district_id:"kandieng",id:"anlong-vil", text: "Anlong Vil"},
		{district_id:"kandieng",id:"kandieng", text: "Kandieng"},
		{district_id:"kandieng",id:"kanhchor", text: "Kanhchor"},
		{district_id:"kandieng",id:"reang-til", text: "Reang Til"},
		{district_id:"kandieng",id:"srae-sdok", text: "Srae Sdok"},
		{district_id:"kandieng",id:"svay-luong", text: "Svay Luong"},
		{district_id:"kandieng",id:"sya", text: "Sya"},
		{district_id:"kandieng",id:"veal", text: "Veal"},
		{district_id:"kandieng",id:"kaoh-chum", text: "Kaoh Chum"},
		{district_id:"krakor",id:"anlong-tnaot", text: "Anlong Tnaot"},
		{district_id:"krakor",id:"ansa-chambak", text: "Ansa Chambak"},
		{district_id:"krakor",id:"boeng-kantuot", text: "Boeng Kantuot"},
		{district_id:"krakor",id:"chheu-tom", text: "Chheu Tom"},
		{district_id:"krakor",id:"kampong-luong", text: "Kampong Luong"},
		{district_id:"krakor",id:"kampong-pou", text: "Kampong Pou"},
		{district_id:"krakor",id:"kbal-trach", text: "Kbal Trach"},
		{district_id:"krakor",id:"ou-sandan", text: "Ou Sandan"},
		{district_id:"krakor",id:"sna-ansa", text: "Sna Ansa"},
		{district_id:"krakor",id:"svay-sa", text: "Svay Sa"},
		{district_id:"krakor",id:"tnaot-chum", text: "Tnaot Chum"},
		{district_id:"phnum-kravanh",id:"bak-chenhchien", text: "Bak Chenhchien"},
		{district_id:"phnum-kravanh",id:"leach", text: "Leach"},
		{district_id:"phnum-kravanh",id:"phteah-rung", text: "Phteah Rung"},
		{district_id:"phnum-kravanh",id:"prongil", text: "Prongil"},
		{district_id:"phnum-kravanh",id:"rokat", text: "Rokat"},
		{district_id:"phnum-kravanh",id:"santreae", text: "Santreae"},
		{district_id:"phnum-kravanh",id:"samraong", text: "Samraong"},
		{district_id:"krong-pursat",id:"chamraeun-phal", text: "Chamraeun Phal"},
		{district_id:"krong-pursat",id:"lolok-sa", text: "Lolok Sa"},
		{district_id:"krong-pursat",id:"phteah-prey", text: "Phteah Prey"},
		{district_id:"krong-pursat",id:"prey-nhi", text: "Prey Nhi"},
		{district_id:"krong-pursat",id:"roleab", text: "Roleab"},
		{district_id:"krong-pursat",id:"svay-at", text: "Svay At"},
		{district_id:"krong-pursat",id:"banteay-dei", text: "Banteay Dei"},
		{district_id:"veal-veaeng",id:"ou-saom", text: "Ou Saom"},
		{district_id:"veal-veaeng",id:"krapeu-pir", text: "Krapeu Pir"},
		{district_id:"veal-veaeng",id:"anlong-reab", text: "Anlong Reab"},
		{district_id:"veal-veaeng",id:"pramaoy", text: "Pramaoy"},
		{district_id:"veal-veaeng",id:"thma-da", text: "Thma Da"},
		{district_id:"andoung-meas",id:"malik", text: "Malik"},
		{district_id:"andoung-meas",id:"nhang", text: "Nhang"},
		{district_id:"andoung-meas",id:"ta-lav", text: "Ta Lav"},
		{district_id:"krong-banlung",id:"kachanh", text: "Kachanh"},
		{district_id:"krong-banlung",id:"labansiek", text: "Labansiek"},
		{district_id:"krong-banlung",id:"yeak-laom", text: "Yeak Laom"},
		{district_id:"bar-kaev",id:"kak", text: "Kak"},
		{district_id:"bar-kaev",id:"keh-chong", text: "Keh Chong"},
		{district_id:"bar-kaev",id:"la-minh", text: "La Minh"},
		{district_id:"bar-kaev",id:"lung-khung", text: "Lung Khung"},
		{district_id:"bar-kaev",id:"saeung", text: "Saeung"},
		{district_id:"bar-kaev",id:"ting-chak", text: "Ting Chak"},
		{district_id:"koun-mom",id:"serei-mongkol", text: "Serei Mongkol"},
		{district_id:"koun-mom",id:"srae-angkrorng", text: "Srae Angkrorng"},
		{district_id:"koun-mom",id:"ta-ang", text: "Ta Ang"},
		{district_id:"koun-mom",id:"teun", text: "Teun"},
		{district_id:"koun-mom",id:"trapeang-chres", text: "Trapeang Chres"},
		{district_id:"koun-mom",id:"trapeang-kraham", text: "Trapeang Kraham"},
		{district_id:"lumphat",id:"chey-otdam", text: "Chey Otdam"},
		{district_id:"lumphat",id:"ka-laeng", text: "Ka Laeng"},
		{district_id:"lumphat",id:"lbang-muoy", text: "Lbang Muoy"},
		{district_id:"lumphat",id:"lbang-pir", text: "Lbang Pir"},
		{district_id:"lumphat",id:"a-tang", text: "A Tang"},
		{district_id:"lumphat",id:"seda", text: "Seda"},
		{district_id:"ou-chum",id:"cha-ung", text: "Cha Ung"},
		{district_id:"ou-chum",id:"pouy", text: "Pouy"},
		{district_id:"ou-chum",id:"aekakpheap", text: "Aekakpheap"},
		{district_id:"ou-chum",id:"kalai", text: "Kalai"},
		{district_id:"ou-chum",id:"ou-chum", text: "Ou Chum"},
		{district_id:"ou-chum",id:"sameakk", text: "Sameakk"},
		{district_id:"ou-chum",id:"l-ak", text: "L Ak"},
		{district_id:"ou-ya-dav",id:"bar-kham", text: "Bar Kham"},
		{district_id:"ou-ya-dav",id:"lum-choar", text: "Lum Choar"},
		{district_id:"ou-ya-dav",id:"pak-nhai", text: "Pak Nhai"},
		{district_id:"ou-ya-dav",id:"pa-te", text: "Pa Te"},
		{district_id:"ou-ya-dav",id:"sesan", text: "Sesan"},
		{district_id:"ou-ya-dav",id:"saom-thum", text: "Saom Thum"},
		{district_id:"ou-ya-dav",id:"ya-tung", text: "Ya Tung"},
		{district_id:"ta-veaeng",id:"ta-veaeng-leu", text: "Ta Veaeng Leu"},
		{district_id:"ta-veaeng",id:"ta-veaeng-kraom", text: "Ta Veaeng Kraom"},
		{district_id:"veun-sai",id:"pong", text: "Pong"},
		{district_id:"veun-sai",id:"hat-pak", text: "Hat Pak"},
		{district_id:"veun-sai",id:"ka-choun", text: "Ka Choun"},
		{district_id:"veun-sai",id:"kaoh-pang", text: "Kaoh Pang"},
		{district_id:"veun-sai",id:"kaoh-peak", text: "Kaoh Peak"},
		{district_id:"veun-sai",id:"kok-lak", text: "Kok Lak"},
		{district_id:"veun-sai",id:"pa-kalan", text: "Pa Kalan"},
		{district_id:"veun-sai",id:"phnum-kok", text: "Phnum Kok"},
		{district_id:"veun-sai",id:"veun-sai", text: "Veun Sai"},
		{district_id:"angkor-chum",id:"char-chhuk", text: "Char Chhuk"},
		{district_id:"angkor-chum",id:"doun-peng", text: "Doun Peng"},
		{district_id:"angkor-chum",id:"kouk-doung", text: "Kouk Doung"},
		{district_id:"angkor-chum",id:"koul", text: "Koul"},
		{district_id:"angkor-chum",id:"nokor-pheas", text: "Nokor Pheas"},
		{district_id:"angkor-chum",id:"srae-khvav", text: "Srae Khvav"},
		{district_id:"angkor-chum",id:"ta-saom", text: "Ta Saom"},
		{district_id:"angkor-thom",id:"chob-ta-trav", text: "Chob Ta Trav"},
		{district_id:"angkor-thom",id:"leang-dai", text: "Leang Dai"},
		{district_id:"angkor-thom",id:"peak-snaeng", text: "Peak Snaeng"},
		{district_id:"angkor-thom",id:"svay-chek", text: "Svay Chek"},
		{district_id:"banteay-srei",id:"khnar-sanday", text: "Khnar Sanday"},
		{district_id:"banteay-srei",id:"khun-ream", text: "Khun Ream"},
		{district_id:"banteay-srei",id:"preak-dak", text: "Preak Dak"},
		{district_id:"banteay-srei",id:"rumchek", text: "Rumchek"},
		{district_id:"banteay-srei",id:"run-ta-aek", text: "Run Ta Aek"},
		{district_id:"banteay-srei",id:"tbaeng", text: "Tbaeng"},
		{district_id:"chi-kraeng",id:"anlong-samnar", text: "Anlong Samnar"},
		{district_id:"chi-kraeng",id:"chi-kraeng", text: "Chi Kraeng"},
		{district_id:"chi-kraeng",id:"kampong-kdei", text: "Kampong Kdei"},
		{district_id:"chi-kraeng",id:"khvav", text: "Khvav"},
		{district_id:"chi-kraeng",id:"kouk-thlok-kraom", text: "Kouk Thlok Kraom"},
		{district_id:"chi-kraeng",id:"kouk-thlok-leu", text: "Kouk Thlok Leu"},
		{district_id:"chi-kraeng",id:"lveaeng-ruessei", text: "Lveaeng Ruessei"},
		{district_id:"chi-kraeng",id:"pongro-kraom", text: "Pongro Kraom"},
		{district_id:"chi-kraeng",id:"pongro-leu", text: "Pongro Leu"},
		{district_id:"chi-kraeng",id:"ruessei-lok", text: "Ruessei Lok"},
		{district_id:"chi-kraeng",id:"run-ta-aek", text: "Run Ta Aek"},
		{district_id:"chi-kraeng",id:"spean-tnaot", text: "Spean Tnaot"},
		{district_id:"kralanh",id:"chonloas-dai", text: "Chonloas Dai"},
		{district_id:"kralanh",id:"kampong-thkov", text: "Kampong Thkov"},
		{district_id:"kralanh",id:"kralanh", text: "Kralanh"},
		{district_id:"kralanh",id:"krouch-kor", text: "Krouch Kor"},
		{district_id:"kralanh",id:"roung-kou", text: "Roung Kou"},
		{district_id:"kralanh",id:"sambuor", text: "Sambuor"},
		{district_id:"kralanh",id:"saen-sokh", text: "Saen Sokh"},
		{district_id:"kralanh",id:"snuol", text: "Snuol"},
		{district_id:"kralanh",id:"sranal", text: "Sranal"},
		{district_id:"kralanh",id:"ta-an", text: "Ta An"},
		{district_id:"puok",id:"sasar-sdam", text: "Sasar Sdam"},
		{district_id:"puok",id:"doun-kaev", text: "Doun Kaev"},
		{district_id:"puok",id:"kdei-run", text: "Kdei Run"},
		{district_id:"puok",id:"kaev-poar", text: "Kaev Poar"},
		{district_id:"puok",id:"khnat", text: "Khnat"},
		{district_id:"puok",id:"lvea", text: "Lvea"},
		{district_id:"puok",id:"mukh-paen", text: "Mukh Paen"},
		{district_id:"puok",id:"pou-treay", text: "Pou Treay"},
		{district_id:"puok",id:"puok", text: "Puok"},
		{district_id:"puok",id:"prey-chruk", text: "Prey Chruk"},
		{district_id:"puok",id:"reul", text: "Reul"},
		{district_id:"puok",id:"samraong-yea", text: "Samraong Yea"},
		{district_id:"puok",id:"trei-nhoar", text: "Trei Nhoar"},
		{district_id:"puok",id:"yeang", text: "Yeang"},
		{district_id:"prasat-bakong",id:"bakong", text: "Bakong"},
		{district_id:"prasat-bakong",id:"ballangk", text: "Ballangk"},
		{district_id:"prasat-bakong",id:"kampong-phluk", text: "Kampong Phluk"},
		{district_id:"prasat-bakong",id:"kantreang", text: "Kantreang"},
		{district_id:"prasat-bakong",id:"kandaek", text: "Kandaek"},
		{district_id:"prasat-bakong",id:"mean-chey", text: "Mean Chey"},
		{district_id:"prasat-bakong",id:"roluos", text: "Roluos"},
		{district_id:"prasat-bakong",id:"trapeang-thum", text: "Trapeang Thum"},
		{district_id:"krong-siem-reap",id:"sla-kram", text: "Sla Kram"},
		{district_id:"krong-siem-reap",id:"svay-dankum", text: "Svay Dankum"},
		{district_id:"krong-siem-reap",id:"kouk-chak", text: "Kouk Chak"},
		{district_id:"krong-siem-reap",id:"sala-kamraeuk", text: "Sala Kamraeuk"},
		{district_id:"krong-siem-reap",id:"nokor-thum", text: "Nokor Thum"},
		{district_id:"krong-siem-reap",id:"chreav", text: "Chreav"},
		{district_id:"krong-siem-reap",id:"chong-knies", text: "Chong Knies"},
		{district_id:"krong-siem-reap",id:"sambuor", text: "Sambuor"},
		{district_id:"krong-siem-reap",id:"siem-reab", text: "Siem Reab"},
		{district_id:"krong-siem-reap",id:"srangae", text: "Srangae"},
		{district_id:"krong-siem-reap",id:"ampil", text: "Ampil"},
		{district_id:"krong-siem-reap",id:"krabei-riel", text: "Krabei Riel"},
		{district_id:"krong-siem-reap",id:"tuek-vil", text: "Tuek Vil"},
		{district_id:"sout-nikom",id:"chan-sar", text: "Chan Sar"},
		{district_id:"sout-nikom",id:"dam-daek", text: "Dam Daek"},
		{district_id:"sout-nikom",id:"dan-run", text: "Dan Run"},
		{district_id:"sout-nikom",id:"kampong-khleang", text: "Kampong Khleang"},
		{district_id:"sout-nikom",id:"kien-sangkae", text: "Kien Sangkae"},
		{district_id:"sout-nikom",id:"khchas", text: "Khchas"},
		{district_id:"sout-nikom",id:"khnar-pou", text: "Khnar Pou"},
		{district_id:"sout-nikom",id:"popel", text: "Popel"},
		{district_id:"sout-nikom",id:"samraong", text: "Samraong"},
		{district_id:"sout-nikom",id:"ta-yaek", text: "Ta Yaek"},
		{district_id:"srei-snam",id:"chrouy-neang-nguon", text: "Chrouy Neang Nguon"},
		{district_id:"srei-snam",id:"klang-hay", text: "Klang Hay"},
		{district_id:"srei-snam",id:"tram-sasar", text: "Tram Sasar"},
		{district_id:"srei-snam",id:"moung", text: "Moung"},
		{district_id:"srei-snam",id:"prei", text: "Prei"},
		{district_id:"srei-snam",id:"slaeng-spean", text: "Slaeng Spean"},
		{district_id:"svay-leu",id:"boeng-mealea", text: "Boeng Mealea"},
		{district_id:"svay-leu",id:"kantuot", text: "Kantuot"},
		{district_id:"svay-leu",id:"khnang-phnum", text: "Khnang Phnum"},
		{district_id:"svay-leu",id:"svay-leu", text: "Svay Leu"},
		{district_id:"svay-leu",id:"ta-siem", text: "Ta Siem"},
		{district_id:"varin",id:"prasat", text: "Prasat"},
		{district_id:"varin",id:"lvea-krang", text: "Lvea Krang"},
		{district_id:"varin",id:"srae-nouy", text: "Srae Nouy"},
		{district_id:"varin",id:"svay-sa", text: "Svay Sa"},
		{district_id:"varin",id:"varin", text: "Varin"},
		{district_id:"krong-preah-sihanouk",id:"lekh-muoy", text: "Lekh Muoy"},
		{district_id:"krong-preah-sihanouk",id:"lekh-pir", text: "Lekh Pir"},
		{district_id:"krong-preah-sihanouk",id:"lekh-bei", text: "Lekh Bei"},
		{district_id:"krong-preah-sihanouk",id:"lekh-buon", text: "Lekh Buon"},
		{district_id:"krong-preah-sihanouk",id:"kaoh-rung", text: "Kaoh Rung"},
		{district_id:"prey-nob",id:"andoung-thma", text: "Andoung Thma"},
		{district_id:"prey-nob",id:"boeng-ta-prum", text: "Boeng Ta Prum"},
		{district_id:"prey-nob",id:"bet-trang", text: "Bet Trang"},
		{district_id:"prey-nob",id:"cheung-kou", text: "Cheung Kou"},
		{district_id:"prey-nob",id:"ou-chrov", text: "Ou Chrov"},
		{district_id:"prey-nob",id:"ou-oknha-heng", text: "Ou Oknha Heng"},
		{district_id:"prey-nob",id:"prey-nob", text: "Prey Nob"},
		{district_id:"prey-nob",id:"ream", text: "Ream"},
		{district_id:"prey-nob",id:"sameakki", text: "Sameakki"},
		{district_id:"prey-nob",id:"samrong", text: "Samrong"},
		{district_id:"prey-nob",id:"tuek-l-ak", text: "Tuek L Ak"},
		{district_id:"prey-nob",id:"tuek-thla", text: "Tuek Thla"},
		{district_id:"prey-nob",id:"tuol-totueng", text: "Tuol Totueng"},
		{district_id:"prey-nob",id:"veal-renh", text: "Veal Renh"},
		{district_id:"prey-nob",id:"ta-ney", text: "Ta Ney"},
		{district_id:"prey-nob",id:"koh-rung-sanleom", text: "Koh Rung Sanleom"},
		{district_id:"stueng-hav",id:"kampenh", text: "Kampenh"},
		{district_id:"stueng-hav",id:"ou-treh", text: "Ou Treh"},
		{district_id:"stueng-hav",id:"tumnob-rolok", text: "Tumnob Rolok"},
		{district_id:"stueng-hav",id:"kaev-phos", text: "Kaev Phos"},
		{district_id:"kampong-seila",id:"chamkar-luong", text: "Chamkar Luong"},
		{district_id:"kampong-seila",id:"kampong-seila", text: "Kampong Seila"},
		{district_id:"kampong-seila",id:"ou-bak-roteh", text: "Ou Bak Roteh"},
		{district_id:"kampong-seila",id:"stueng-chhay", text: "Stueng Chhay"},
		{district_id:"sesan",id:"kamphun", text: "Kamphun"},
		{district_id:"sesan",id:"kbal-romeas", text: "Kbal Romeas"},
		{district_id:"sesan",id:"phluk", text: "Phluk"},
		{district_id:"sesan",id:"samkuoy", text: "Samkuoy"},
		{district_id:"sesan",id:"sdau", text: "Sdau"},
		{district_id:"sesan",id:"srae-kor", text: "Srae Kor"},
		{district_id:"sesan",id:"ta-lat", text: "Ta Lat"},
		{district_id:"siem-bouk",id:"kaoh-preah", text: "Kaoh Preah"},
		{district_id:"siem-bouk",id:"kaoh-sampeay", text: "Kaoh Sampeay"},
		{district_id:"siem-bouk",id:"kaoh-sralay", text: "Kaoh Sralay"},
		{district_id:"siem-bouk",id:"ou-mreah", text: "Ou Mreah"},
		{district_id:"siem-bouk",id:"ou-ruessei-kandal", text: "Ou Ruessei Kandal"},
		{district_id:"siem-bouk",id:"siem-bouk", text: "Siem Bouk"},
		{district_id:"siem-bouk",id:"srae-krasang", text: "Srae Krasang"},
		{district_id:"siem-pang",id:"preaek-meas", text: "Preaek Meas"},
		{district_id:"siem-pang",id:"sekong", text: "Sekong"},
		{district_id:"siem-pang",id:"santepheap", text: "Santepheap"},
		{district_id:"siem-pang",id:"srae-sambour", text: "Srae Sambour"},
		{district_id:"siem-pang",id:"tma-kaev", text: "Tma Kaev"},
		{district_id:"krong-stung-treng",id:"stueng-traeng", text: "Stueng Traeng"},
		{district_id:"krong-stung-treng",id:"srah-ruessei", text: "Srah Ruessei"},
		{district_id:"krong-stung-treng",id:"preah-bat", text: "Preah Bat"},
		{district_id:"krong-stung-treng",id:"sameakki", text: "Sameakki"},
		{district_id:"thala-barivat",id:"anlong-phe", text: "Anlong Phe"},
		{district_id:"thala-barivat",id:"chamkar-leu", text: "Chamkar Leu"},
		{district_id:"thala-barivat",id:"kang-cham", text: "Kang Cham"},
		{district_id:"thala-barivat",id:"kaoh-snaeng", text: "Kaoh Snaeng"},
		{district_id:"thala-barivat",id:"anlong-chrey", text: "Anlong Chrey"},
		{district_id:"thala-barivat",id:"ou-rai", text: "Ou Rai"},
		{district_id:"thala-barivat",id:"ou-svay", text: "Ou Svay"},
		{district_id:"thala-barivat",id:"preah-rumkel", text: "Preah Rumkel"},
		{district_id:"thala-barivat",id:"sam-ang", text: "Sam Ang"},
		{district_id:"thala-barivat",id:"srae-ruessei", text: "Srae Ruessei"},
		{district_id:"thala-barivat",id:"thala-barivat", text: "Thala Barivat"},
		{district_id:"chantrea",id:"chantrea", text: "Chantrea"},
		{district_id:"chantrea",id:"chres", text: "Chres"},
		{district_id:"chantrea",id:"me-sar-thngak", text: "Me Sar Thngak"},
		{district_id:"chantrea",id:"prey-kokir", text: "Prey Kokir"},
		{district_id:"chantrea",id:"samraong", text: "Samraong"},
		{district_id:"chantrea",id:"tuol-sdei", text: "Tuol Sdei"},
		{district_id:"kampong-rou",id:"banteay-krang", text: "Banteay Krang"},
		{district_id:"kampong-rou",id:"nhor", text: "Nhor"},
		{district_id:"kampong-rou",id:"khsaetr", text: "Khsaetr"},
		{district_id:"kampong-rou",id:"preah-ponlea", text: "Preah Ponlea"},
		{district_id:"kampong-rou",id:"prey-thum", text: "Prey Thum"},
		{district_id:"kampong-rou",id:"reach-montir", text: "Reach Montir"},
		{district_id:"kampong-rou",id:"samlei", text: "Samlei"},
		{district_id:"kampong-rou",id:"samyaong", text: "Samyaong"},
		{district_id:"kampong-rou",id:"svay-ta-yean", text: "Svay Ta Yean"},
		{district_id:"kampong-rou",id:"thmei", text: "Thmei"},
		{district_id:"kampong-rou",id:"tnaot", text: "Tnaot"},
		{district_id:"rumduol",id:"bos-mon", text: "Bos Mon"},
		{district_id:"rumduol",id:"thmea", text: "Thmea"},
		{district_id:"rumduol",id:"kampong-chak", text: "Kampong Chak"},
		{district_id:"rumduol",id:"chrung-popel", text: "Chrung Popel"},
		{district_id:"rumduol",id:"kampong-ampil", text: "Kampong Ampil"},
		{district_id:"rumduol",id:"meun-chey", text: "Meun Chey"},
		{district_id:"rumduol",id:"pong-tuek", text: "Pong Tuek"},
		{district_id:"rumduol",id:"sangkae", text: "Sangkae"},
		{district_id:"rumduol",id:"svay-chek", text: "Svay Chek"},
		{district_id:"rumduol",id:"thna-thnong", text: "Thna Thnong"},
		{district_id:"romeas-haek",id:"ampil", text: "Ampil"},
		{district_id:"romeas-haek",id:"andoung-pou", text: "Andoung Pou"},
		{district_id:"romeas-haek",id:"andoung-trabaek", text: "Andoung Trabaek"},
		{district_id:"romeas-haek",id:"angk-prasrae", text: "Angk Prasrae"},
		{district_id:"romeas-haek",id:"chantrei", text: "Chantrei"},
		{district_id:"romeas-haek",id:"chrey-thum", text: "Chrey Thum"},
		{district_id:"romeas-haek",id:"doung", text: "Doung"},
		{district_id:"romeas-haek",id:"kampong-trach", text: "Kampong Trach"},
		{district_id:"romeas-haek",id:"kokir", text: "Kokir"},
		{district_id:"romeas-haek",id:"krasang", text: "Krasang"},
		{district_id:"romeas-haek",id:"mukh-da", text: "Mukh Da"},
		{district_id:"romeas-haek",id:"mream", text: "Mream"},
		{district_id:"romeas-haek",id:"sambuor", text: "Sambuor"},
		{district_id:"romeas-haek",id:"sambatt-mean-chey", text: "Sambatt Mean Chey"},
		{district_id:"romeas-haek",id:"trapeang-sdau", text: "Trapeang Sdau"},
		{district_id:"romeas-haek",id:"tras", text: "Tras"},
		{district_id:"svay-chrum",id:"angk-ta-sou", text: "Angk Ta Sou"},
		{district_id:"svay-chrum",id:"basak", text: "Basak"},
		{district_id:"svay-chrum",id:"chambak", text: "Chambak"},
		{district_id:"svay-chrum",id:"kampong-chamlang", text: "Kampong Chamlang"},
		{district_id:"svay-chrum",id:"ta-suos", text: "Ta Suos"},
		{district_id:"svay-chrum",id:"chheu-teal", text: "Chheu Teal"},
		{district_id:"svay-chrum",id:"doun-sa", text: "Doun Sa"},
		{district_id:"svay-chrum",id:"kouk-pring", text: "Kouk Pring"},
		{district_id:"svay-chrum",id:"kraol-kou", text: "Kraol Kou"},
		{district_id:"svay-chrum",id:"kruos", text: "Kruos"},
		{district_id:"svay-chrum",id:"pouthi-reach", text: "Pouthi Reach"},
		{district_id:"svay-chrum",id:"svay-angk", text: "Svay Angk"},
		{district_id:"svay-chrum",id:"svay-chrum", text: "Svay Chrum"},
		{district_id:"svay-chrum",id:"svay-thum", text: "Svay Thum"},
		{district_id:"svay-chrum",id:"svay-yea", text: "Svay Yea"},
		{district_id:"svay-chrum",id:"thlok", text: "Thlok"},
		{district_id:"krong-svay-rieng",id:"svay-rieng", text: "Svay Rieng"},
		{district_id:"krong-svay-rieng",id:"prey-chhlak", text: "Prey Chhlak"},
		{district_id:"krong-svay-rieng",id:"koy-trabaek", text: "Koy Trabaek"},
		{district_id:"krong-svay-rieng",id:"pou-ta-hao", text: "Pou Ta Hao"},
		{district_id:"krong-svay-rieng",id:"chek", text: "Chek"},
		{district_id:"krong-svay-rieng",id:"svay-toea", text: "Svay Toea"},
		{district_id:"krong-svay-rieng",id:"sangkhoar", text: "Sangkhoar"},
		{district_id:"svay-teab",id:"kokir-saom", text: "Kokir Saom"},
		{district_id:"svay-teab",id:"kandieng-reay", text: "Kandieng Reay"},
		{district_id:"svay-teab",id:"monourom", text: "Monourom"},
		{district_id:"svay-teab",id:"popeaet", text: "Popeaet"},
		{district_id:"svay-teab",id:"prey-ta-ei", text: "Prey Ta Ei"},
		{district_id:"svay-teab",id:"prasoutr", text: "Prasoutr"},
		{district_id:"svay-teab",id:"romeang-thkaol", text: "Romeang Thkaol"},
		{district_id:"svay-teab",id:"sambuor", text: "Sambuor"},
		{district_id:"svay-teab",id:"svay-rumpear", text: "Svay Rumpear"},
		{district_id:"krong-bavet",id:"bati", text: "Bati"},
		{district_id:"krong-bavet",id:"bavet", text: "Bavet"},
		{district_id:"krong-bavet",id:"chrak-mtes", text: "Chrak Mtes"},
		{district_id:"krong-bavet",id:"prasat", text: "Prasat"},
		{district_id:"krong-bavet",id:"prey-angkunh", text: "Prey Angkunh"},
		{district_id:"angkor-borei",id:"angkor-borei", text: "Angkor Borei"},
		{district_id:"angkor-borei",id:"ba-srae", text: "Ba Srae"},
		{district_id:"angkor-borei",id:"kouk-thlok", text: "Kouk Thlok"},
		{district_id:"angkor-borei",id:"ponley", text: "Ponley"},
		{district_id:"angkor-borei",id:"preaek-phtoul", text: "Preaek Phtoul"},
		{district_id:"angkor-borei",id:"prey-phkoam", text: "Prey Phkoam"},
		{district_id:"bati",id:"chambak", text: "Chambak"},
		{district_id:"bati",id:"champei", text: "Champei"},
		{district_id:"bati",id:"doung", text: "Doung"},
		{district_id:"bati",id:"kandoeng", text: "Kandoeng"},
		{district_id:"bati",id:"komar-reachea", text: "Komar Reachea"},
		{district_id:"bati",id:"krang-leav", text: "Krang Leav"},
		{district_id:"bati",id:"krang-thnong", text: "Krang Thnong"},
		{district_id:"bati",id:"lumpong", text: "Lumpong"},
		{district_id:"bati",id:"pea-ream", text: "Pea Ream"},
		{district_id:"bati",id:"pot-sar", text: "Pot Sar"},
		{district_id:"bati",id:"sour-phi", text: "Sour Phi"},
		{district_id:"bati",id:"tang-doung", text: "Tang Doung"},
		{district_id:"bati",id:"tnaot", text: "Tnaot"},
		{district_id:"bati",id:"trapeang-krasang", text: "Trapeang Krasang"},
		{district_id:"bati",id:"trapeang-sab", text: "Trapeang Sab"},
		{district_id:"bourei-cholsar",id:"bourei-cholsar", text: "Bourei Cholsar"},
		{district_id:"bourei-cholsar",id:"chey-chouk", text: "Chey Chouk"},
		{district_id:"bourei-cholsar",id:"doung-khpos", text: "Doung Khpos"},
		{district_id:"bourei-cholsar",id:"kampong-krasang", text: "Kampong Krasang"},
		{district_id:"bourei-cholsar",id:"kouk-pou", text: "Kouk Pou"},
		{district_id:"kiri-vong",id:"angk-prasat", text: "Angk Prasat"},
		{district_id:"kiri-vong",id:"preah-bat-choan-chum", text: "Preah Bat Choan Chum"},
		{district_id:"kiri-vong",id:"kamnab", text: "Kamnab"},
		{district_id:"kiri-vong",id:"kampeaeng", text: "Kampeaeng"},
		{district_id:"kiri-vong",id:"kiri-chong-kaoh", text: "Kiri Chong Kaoh"},
		{district_id:"kiri-vong",id:"kouk-prech", text: "Kouk Prech"},
		{district_id:"kiri-vong",id:"phnum-den", text: "Phnum Den"},
		{district_id:"kiri-vong",id:"prey-ampok", text: "Prey Ampok"},
		{district_id:"kiri-vong",id:"prey-rumdeng", text: "Prey Rumdeng"},
		{district_id:"kiri-vong",id:"ream-andaeuk", text: "Ream Andaeuk"},
		{district_id:"kiri-vong",id:"saom", text: "Saom"},
		{district_id:"kiri-vong",id:"ta-ou", text: "Ta Ou"},
		{district_id:"kaoh-andaet",id:"krapum-chhuk", text: "Krapum Chhuk"},
		{district_id:"kaoh-andaet",id:"pech-sar", text: "Pech Sar"},
		{district_id:"kaoh-andaet",id:"prey-khla", text: "Prey Khla"},
		{district_id:"kaoh-andaet",id:"prey-yuthka", text: "Prey Yuthka"},
		{district_id:"kaoh-andaet",id:"romenh", text: "Romenh"},
		{district_id:"kaoh-andaet",id:"thlea-prachum", text: "Thlea Prachum"},
		{district_id:"prey-kabbas",id:"angkanh", text: "Angkanh"},
		{district_id:"prey-kabbas",id:"ban-kam", text: "Ban Kam"},
		{district_id:"prey-kabbas",id:"champa", text: "Champa"},
		{district_id:"prey-kabbas",id:"char", text: "Char"},
		{district_id:"prey-kabbas",id:"kampeaeng", text: "Kampeaeng"},
		{district_id:"prey-kabbas",id:"kampong-reab", text: "Kampong Reab"},
		{district_id:"prey-kabbas",id:"kdanh", text: "Kdanh"},
		{district_id:"prey-kabbas",id:"pou-rumchak", text: "Pou Rumchak"},
		{district_id:"prey-kabbas",id:"prey-kabbas", text: "Prey Kabbas"},
		{district_id:"prey-kabbas",id:"prey-lvea", text: "Prey Lvea"},
		{district_id:"prey-kabbas",id:"prey-phdau", text: "Prey Phdau"},
		{district_id:"prey-kabbas",id:"snao", text: "Snao"},
		{district_id:"prey-kabbas",id:"tang-yab", text: "Tang Yab"},
		{district_id:"samraong",id:"boeng-tranh-khang-cheung", text: "Boeng Tranh Khang Cheung"},
		{district_id:"samraong",id:"boeng-tranh-khang-tboung", text: "Boeng Tranh Khang Tboung"},
		{district_id:"samraong",id:"cheung-kuon", text: "Cheung Kuon"},
		{district_id:"samraong",id:"chumreah-pen", text: "Chumreah Pen"},
		{district_id:"samraong",id:"khvav", text: "Khvav"},
		{district_id:"samraong",id:"lumchang", text: "Lumchang"},
		{district_id:"samraong",id:"rovieng", text: "Rovieng"},
		{district_id:"samraong",id:"samraong", text: "Samraong"},
		{district_id:"samraong",id:"soeng", text: "Soeng"},
		{district_id:"samraong",id:"sla", text: "Sla"},
		{district_id:"samraong",id:"trea", text: "Trea"},
		{district_id:"krong-doun-kaev",id:"baray", text: "Baray"},
		{district_id:"krong-doun-kaev",id:"roka-knong", text: "Roka Knong"},
		{district_id:"krong-doun-kaev",id:"roka-krau", text: "Roka Krau"},
		{district_id:"tram-kak",id:"angk-ta-saom", text: "Angk Ta Saom"},
		{district_id:"tram-kak",id:"cheang-tong", text: "Cheang Tong"},
		{district_id:"tram-kak",id:"kus", text: "Kus"},
		{district_id:"tram-kak",id:"leay-bour", text: "Leay Bour"},
		{district_id:"tram-kak",id:"nhaeng-nhang", text: "Nhaeng Nhang"},
		{district_id:"tram-kak",id:"ou-saray", text: "Ou Saray"},
		{district_id:"tram-kak",id:"trapeang-kranhoung", text: "Trapeang Kranhoung"},
		{district_id:"tram-kak",id:"otdam-soriya", text: "Otdam Soriya"},
		{district_id:"tram-kak",id:"popel", text: "Popel"},
		{district_id:"tram-kak",id:"samraong", text: "Samraong"},
		{district_id:"tram-kak",id:"srae-ronoung", text: "Srae Ronoung"},
		{district_id:"tram-kak",id:"ta-phem", text: "Ta Phem"},
		{district_id:"tram-kak",id:"tram-kak", text: "Tram Kak"},
		{district_id:"tram-kak",id:"trapeang-thum-khang-cheung", text: "Trapeang Thum Khang Cheung"},
		{district_id:"tram-kak",id:"trapeang-thum-khang-tboung", text: "Trapeang Thum Khang Tboung"},
		{district_id:"treang",id:"angkanh", text: "Angkanh"},
		{district_id:"treang",id:"angk-khnaor", text: "Angk Khnaor"},
		{district_id:"treang",id:"chi-khmar", text: "Chi Khmar"},
		{district_id:"treang",id:"khvav", text: "Khvav"},
		{district_id:"treang",id:"prambei-mom", text: "Prambei Mom"},
		{district_id:"treang",id:"angk-kaev", text: "Angk Kaev"},
		{district_id:"treang",id:"prey-sloek", text: "Prey Sloek"},
		{district_id:"treang",id:"roneam", text: "Roneam"},
		{district_id:"treang",id:"sambuor", text: "Sambuor"},
		{district_id:"treang",id:"sanlung", text: "Sanlung"},
		{district_id:"treang",id:"smaong", text: "Smaong"},
		{district_id:"treang",id:"srangae", text: "Srangae"},
		{district_id:"treang",id:"thlok", text: "Thlok"},
		{district_id:"treang",id:"tralach", text: "Tralach"},
		{district_id:"anlong-veaeng",id:"anlong-veaeng", text: "Anlong Veaeng"},
		{district_id:"anlong-veaeng",id:"trapeang-tav", text: "Trapeang Tav"},
		{district_id:"anlong-veaeng",id:"trapeang-prei", text: "Trapeang Prei"},
		{district_id:"anlong-veaeng",id:"thlat", text: "Thlat"},
		{district_id:"anlong-veaeng",id:"lumtong", text: "Lumtong"},
		{district_id:"banteay-ampil",id:"ampil", text: "Ampil"},
		{district_id:"banteay-ampil",id:"beng", text: "Beng"},
		{district_id:"banteay-ampil",id:"kouk-khpos", text: "Kouk Khpos"},
		{district_id:"banteay-ampil",id:"kouk-mon", text: "Kouk Mon"},
		{district_id:"chong-kal",id:"cheung-tien", text: "Cheung Tien"},
		{district_id:"chong-kal",id:"chong-kal", text: "Chong Kal"},
		{district_id:"chong-kal",id:"krasang", text: "Krasang"},
		{district_id:"chong-kal",id:"pongro", text: "Pongro"},
		{district_id:"krong-samraong",id:"bansay-reak", text: "Bansay Reak"},
		{district_id:"krong-samraong",id:"bos-sbov", text: "Bos Sbov"},
		{district_id:"krong-samraong",id:"koun-kriel", text: "Koun Kriel"},
		{district_id:"krong-samraong",id:"samraong", text: "Samraong"},
		{district_id:"krong-samraong",id:"ou-smach", text: "Ou Smach"},
		{district_id:"trapeang-prasat",id:"bak-anloung", text: "Bak Anloung"},
		{district_id:"trapeang-prasat",id:"ph-av", text: "Ph Av"},
		{district_id:"trapeang-prasat",id:"ou-svay", text: "Ou Svay"},
		{district_id:"trapeang-prasat",id:"preah-pralay", text: "Preah Pralay"},
		{district_id:"trapeang-prasat",id:"tumnob-dach", text: "Tumnob Dach"},
		{district_id:"trapeang-prasat",id:"trapeang-prasat", text: "Trapeang Prasat"},
		{district_id:"damnak-chang-aeur",id:"angkaol", text: "Angkaol"},
		{district_id:"damnak-chang-aeur",id:"pong-tuek", text: "Pong Tuek"},
		{district_id:"krong-kep",id:"kaeb", text: "Kaeb"},
		{district_id:"krong-kep",id:"prey-thum", text: "Prey Thum"},
		{district_id:"krong-kep",id:"ou-krasar", text: "Ou Krasar"},
		{district_id:"krong-pailin",id:"pailin", text: "Pailin"},
		{district_id:"krong-pailin",id:"ou-ta-vau", text: "Ou Ta Vau"},
		{district_id:"krong-pailin",id:"tuol-lvea", text: "Tuol Lvea"},
		{district_id:"krong-pailin",id:"bar-yakha", text: "Bar Yakha"},
		{district_id:"sala-krau",id:"sala-krau", text: "Sala Krau"},
		{district_id:"sala-krau",id:"stueng-trang", text: "Stueng Trang"},
		{district_id:"sala-krau",id:"stueng-kach", text: "Stueng Kach"},
		{district_id:"sala-krau",id:"ou-andoung", text: "Ou Andoung"},
		{district_id:"dambae",id:"chong-cheach", text: "Chong Cheach"},
		{district_id:"dambae",id:"dambae", text: "Dambae"},
		{district_id:"dambae",id:"kouk-srok", text: "Kouk Srok"},
		{district_id:"dambae",id:"neang-teut", text: "Neang Teut"},
		{district_id:"dambae",id:"seda", text: "Seda"},
		{district_id:"dambae",id:"tuek-chrov", text: "Tuek Chrov"},
		{district_id:"dambae",id:"trapeang-pring", text: "Trapeang Pring"},
		{district_id:"krouch-chhmar",id:"chhuk", text: "Chhuk"},
		{district_id:"krouch-chhmar",id:"chumnik", text: "Chumnik"},
		{district_id:"krouch-chhmar",id:"kampong-treas", text: "Kampong Treas"},
		{district_id:"krouch-chhmar",id:"kaoh-pir", text: "Kaoh Pir"},
		{district_id:"krouch-chhmar",id:"krouch-chhmar", text: "Krouch Chhmar"},
		{district_id:"krouch-chhmar",id:"peus-muoy", text: "Peus Muoy"},
		{district_id:"krouch-chhmar",id:"peus-pir", text: "Peus Pir"},
		{district_id:"krouch-chhmar",id:"preaek-a-chi", text: "Preaek A Chi"},
		{district_id:"krouch-chhmar",id:"roka-khnol", text: "Roka Khnol"},
		{district_id:"krouch-chhmar",id:"svay-khleang", text: "Svay Khleang"},
		{district_id:"krouch-chhmar",id:"trea", text: "Trea"},
		{district_id:"krouch-chhmar",id:"tuol-snuol", text: "Tuol Snuol"},
		{district_id:"memot",id:"chan-mul", text: "Chan Mul"},
		{district_id:"memot",id:"chaom", text: "Chaom"},
		{district_id:"memot",id:"chaom-kravien", text: "Chaom Kravien"},
		{district_id:"memot",id:"chaom-ta-mau", text: "Chaom Ta Mau"},
		{district_id:"memot",id:"dar", text: "Dar"},
		{district_id:"memot",id:"kampoan", text: "Kampoan"},
		{district_id:"memot",id:"memong", text: "Memong"},
		{district_id:"memot",id:"memot", text: "Memot"},
		{district_id:"memot",id:"rung", text: "Rung"},
		{district_id:"memot",id:"rumchek", text: "Rumchek"},
		{district_id:"memot",id:"tramung", text: "Tramung"},
		{district_id:"memot",id:"tonlung", text: "Tonlung"},
		{district_id:"memot",id:"triek", text: "Triek"},
		{district_id:"memot",id:"kokir", text: "Kokir"},
		{district_id:"ou-reang-ov",id:"ampil-ta-pok", text: "Ampil Ta Pok"},
		{district_id:"ou-reang-ov",id:"chak", text: "Chak"},
		{district_id:"ou-reang-ov",id:"damrel", text: "Damrel"},
		{district_id:"ou-reang-ov",id:"kong-chey", text: "Kong Chey"},
		{district_id:"ou-reang-ov",id:"mien", text: "Mien"},
		{district_id:"ou-reang-ov",id:"preah-theat", text: "Preah Theat"},
		{district_id:"ou-reang-ov",id:"tuol-sophi", text: "Tuol Sophi"},
		{district_id:"ponhea-kraek",id:"dountei", text: "Dountei"},
		{district_id:"ponhea-kraek",id:"kak", text: "Kak"},
		{district_id:"ponhea-kraek",id:"kandaol-chrum", text: "Kandaol Chrum"},
		{district_id:"ponhea-kraek",id:"kaong-kang", text: "Kaong Kang"},
		{district_id:"ponhea-kraek",id:"kraek", text: "Kraek"},
		{district_id:"ponhea-kraek",id:"popel", text: "Popel"},
		{district_id:"ponhea-kraek",id:"trapeang-phlong", text: "Trapeang Phlong"},
		{district_id:"ponhea-kraek",id:"veal-mlu", text: "Veal Mlu"},
		{district_id:"tboung-khmum",id:"anhchaeum", text: "Anhchaeum"},
		{district_id:"tboung-khmum",id:"boeng-pruol", text: "Boeng Pruol"},
		{district_id:"tboung-khmum",id:"chikor", text: "Chikor"},
		{district_id:"tboung-khmum",id:"chirou-ti-muoy", text: "Chirou Ti Muoy"},
		{district_id:"tboung-khmum",id:"chirou-ti-pir", text: "Chirou Ti Pir"},
		{district_id:"tboung-khmum",id:"chob", text: "Chob"},
		{district_id:"tboung-khmum",id:"kor", text: "Kor"},
		{district_id:"tboung-khmum",id:"lngieng", text: "Lngieng"},
		{district_id:"tboung-khmum",id:"mong-riev", text: "Mong Riev"},
		{district_id:"tboung-khmum",id:"peam-chileang", text: "Peam Chileang"},
		{district_id:"tboung-khmum",id:"roka-po-pram", text: "Roka Po Pram"},
		{district_id:"tboung-khmum",id:"sralab", text: "Sralab"},
		{district_id:"tboung-khmum",id:"thma-pechr", text: "Thma Pechr"},
		{district_id:"tboung-khmum",id:"tonle-bet", text: "Tonle Bet"},
		{district_id:"krong-suong",id:"suong", text: "Suong"},
		{district_id:"krong-suong",id:"vihear-luong", text: "Vihear Luong"}];


		// this.delete100();
		

	}

	resetCounter(){
		for (let p of this.provinces){
			let data = {
				sale: 0,
				rent: 0,
				id: p.id,
				rank: p.rank,
				text: p.text
			};
			this.countsCollection.doc(p.id).set(data);
		}
		
	}

	getProvinces(){
		return this.provinces;
	}
	getDistricts(provinceId){

		let districts = [];
		for (let d of this.districts){
			if (d['province_id'] == provinceId){
				districts.push(d);
			}
		}
		return districts;
	}
	getCommunes(districtId){

		let communes = [];
		for (let c of this.communes){
			if (c['district_id'] == districtId){
				communes.push(c);
			}
		}
		return communes;
	}
	getProvince(id){
		for (let p of this.provinces){
			if (p.id == id){
				return p;
			}
		}
	}
	getDistrict(id){
		for (let d of this.districts){
			if (d.id == id){
				return d;
			}
		}
	}
	getCommune(id){
		for (let c of this.communes){
			if (c.id == id){
				return c;
			}
		}
	}
	delete100(){
		return new Promise<Object>((resolve, reject) => {
			this.afStore.collection('listings', ref => {
				let query: firebase.firestore.Query = ref;
				query = query.where('province', '==', 'phnom-penh');
				query = query.where('status', '==', 1);
				query = query.orderBy('created_date', 'asc').limit(100);
				
				

				return query;
			})
			.valueChanges().subscribe((listingsData: Listing[]) => {
				
				this.listingsCollection.doc(listingsData[0]['id']).delete();
			});
		});
	}
	
	getAll(filter){


		let queryArray = [];
		if (filter.property_type){
			queryArray.push('property_type='+filter.property_type);
		}
		if (filter.listing_type){
			queryArray.push('listing_type='+filter.listing_type);	
		}
		if (filter.province){
			queryArray.push('province='+filter.province);	
		}
		if (filter.district){
			queryArray.push('district='+filter.district);	
		}
		if (filter.min_price){
			queryArray.push('min_price='+filter.min_price);	
		}
		if (filter.max_price){
			queryArray.push('max_price='+filter.max_price);	
		}
		if (filter.keyword){
			queryArray.push('q='+filter.keyword);	
		}
		if (filter.sort_by){
			queryArray.push('sort_by='+filter.sort_by);	
		}
		if (filter.page){
			queryArray.push('page='+filter.page);
		}
		if (filter.location){
			queryArray.push('latlng='+filter.location);
		}



		let query = queryArray.join('&');
		query = this.queryUrl + '?' + query;

		
		return new Promise<Object>((resolve, reject) => {

			this.http.get(query)
			.subscribe((res) => {
				this.listingsList = [];
				res['hits'].forEach((listing: Listing) => {
					this.listingsList.push(listing);
				});

				resolve(this.listingsList);
			}, (err) => {
				console.error('err', JSON.stringify(err));
			});

		});
	}

	createId(){
		return new Promise<Object>((resolve, reject) => {
			const id = this.afStore.createId();

			resolve(id);
		});
	}
	markAsActive(listing){

		return new Promise<Object>((resolve, reject) => {
			this.listingsCollection.doc(listing.id).update({status: 1}).then((res) => {
				this.addCount(listing.province, listing.listing_type);

				resolve(listing.id);
			}).catch((msg) => {
				reject(msg);
			});
		});
	}
	sendReport(issue){
		return new Promise<Object>((resolve, reject) => {
			const id = this.afStore.createId();
			const issueData = issue;
			issueData.number = 0;
			this.reportsCollection.doc(id).set(issueData).then(async (respondId) => {
				resolve(respondId);
			}).catch((error) => {
				reject(error);
			});
		});
	}
	submitAppBuilder(appData){
		return new Promise<Object>((resolve, reject) => {
			const id = this.afStore.createId();
			const data = appData;
			this.appBuilderCollection.doc(id).set(data).then(async (respondId) => {
				resolve(respondId);
			}).catch((error) => {
				reject(error);
			});
		});
	}
	markAsSold(listing){

		return new Promise<Object>((resolve, reject) => {
			this.listingsCollection.doc(listing.id).update({status: 0}).then((res) => {
				this.minusCount(listing.province, listing.listing_type);

				resolve(listing.id);
			}).catch((msg) => {

				reject(msg);
			});
		});
	}
	deleteListing(listing){

		if (listing.status == 1){
			this.minusCount(listing.province, listing.listing_type);
		}
		return new Promise<Object>((resolve, reject) => {
			this.listingsCollection.doc(listing.id).delete().then((res) => {
				resolve(listing.id);
			}).catch((msg) => {
				reject(msg);
			});
		});
	}
	addCount(province, listing_type){

		let countData = {};
		this.countsCollection.doc(province).get().subscribe((data) => {

			if (listing_type == 'sale'){
				countData['sale'] = data.data().sale + 1;
			}
			else if(listing_type == 'rent'){
				countData['rent'] = data.data().rent + 1;
			}
			this.countsCollection.doc(province).update(countData);

		}, (error) => {
			console.error('===> 11', error);
		});
	}
	minusCount(province, listing_type){
		let countData = {};
		this.countsCollection.doc(province).get().subscribe((data) => {

			if (listing_type == 'sale'){
				countData['sale'] = data.data().sale - 1;
			}
			else if(listing_type == 'rent'){
				countData['rent'] = data.data().rent - 1;
			}

			this.countsCollection.doc(province).update(countData);

		});
	}
	getListing(id){
		return new Promise<Object>((resolve, reject) => {
			this.listingsCollection.doc(id).snapshotChanges().subscribe((listingsData) => {
				let data = listingsData.payload.data();
				data['id'] = listingsData.payload.id;

				resolve(data);
			});
		});
	}
	set(id, listing){
		return new Promise<Object>((resolve, reject) => {
			listing.price = parseFloat(listing.price);
			listing.bedrooms = parseFloat(listing.bedrooms);
			listing.bathrooms = parseFloat(listing.bathrooms);
			listing.lat = parseFloat(listing.lat);
			listing.lng = parseFloat(listing.lng);
			listing.provinceName = this.getProvince(listing.province).text;
			listing.districtName = this.getDistrict(listing.district).text;

			this.listingsCollection.doc(id).set(listing).then((res) => {

				resolve(id);
			}).catch((msg) => {

				console.error('error set', JSON.stringify(msg));
				reject(msg);
			});
		});
	}
	add(listing){


		return new Promise<Object>((resolve, reject) => {
			// const id = this.afStore.createId();

			listing.created_date = new Date();
			listing.status = 1;

			let size = listing.property_type + Math.floor(100000 + Math.random() * 900000);
			listing.property_id = size;
			
			this.addCount(listing.province, listing.listing_type);

			this.set(listing.id, listing).then((id) => {
				resolve(listing);
			}).catch((msg) => {
				reject(msg);
			});

		});
	}
	update(id, listing){
		return new Promise<Object>((resolve, reject) => {
			this.set(id, listing).then((id) => {
				resolve(id);
			}).catch((msg) => {
				reject(msg);
			});
		});
	}
	uploadImagesToFirestore(id, dataUrl, index){
		return new Promise<Object>((resolve, reject) => {
			const currentTime = new Date().getTime();
			const storageRef: AngularFireStorageReference = this.afStorage.ref(`listing_images/${currentTime}_${index}.jpeg`);
			if (document.URL.startsWith('https')){
				storageRef.put(dataUrl).then((snapshot) => {
					storageRef.getDownloadURL().subscribe((url) => {
						resolve(url);
					})
				}).catch((msg) => {
					reject(msg);
				});
			}
			else{
				let metaData = {
					contentType: 'image/jpeg',
				};
				storageRef.putString(dataUrl, 'data_url', metaData).then(() => {
					storageRef.getDownloadURL().subscribe((url: any) => {
						resolve(url);
					});
				}).catch((msg) => {
					console.error('ERROR STORAGE', JSON.stringify(msg));
					reject(msg);
				});
			}


		});
	}
	updateImages(id, images){
		return new Promise<Object>((resolve, reject) => {
			let imagesArray = [];
			let countImg = 0;
			let totalImg = images.length;
			let thumbReady = false;
			let thumbImage = '';
			for(let i = 0; i < images.length; i ++){
				let image = images[i];

				if (document.URL.startsWith('https')){
					this.uploadImagesToFirestore(id, image, i).then((url) => {
						countImg ++;
						imagesArray.push(url);
					}, (error) => {
						console.error('ERROR UPLOAD IMAGE', JSON.stringify(error));
					});
				}
				else{
					let filename = image.substring(image.lastIndexOf('/')+1);
					filename = filename.split('?')[0];
					let path =  image.substring(0,image.lastIndexOf('/')+1);

					this.file.readAsDataURL(path, filename).then((dataUrl) => {

						this.uploadImagesToFirestore(id, dataUrl, i).then((url) => {

							countImg ++;
							imagesArray.push(url);
						});
					}).catch((error) => {
						console.error("ERORR UPLOAD", JSON.stringify(error));
					})
				}
			}

			let myInterval = setInterval(() => {
				if (totalImg == countImg){
					clearInterval(myInterval);
					resolve(imagesArray);
				}
			}, 500);
		});
	}
	getFavorites(){
		return new Promise<Object>((resolve, reject) => {
			this.auth.getUser().then((user) => {
				this.usersCollection.doc(user['uid']).collection('favorites').valueChanges().subscribe((result) => {

					resolve(result);
				});
			});

		});
	}

	getFollows(){
		return new Promise<Object>((resolve, reject) => {
			this.auth.getUser().then((user) => {
				this.usersCollection.doc(user['uid']).collection('follows').valueChanges().subscribe((result) => {

					resolve(result);
				});
			});

		});
	}

	getUserListings(user_id, status, limit?: number){
		return new Promise<Object>((resolve, reject) => {
			this.auth.getUser().then((user) => {
				this.afStore.collection('listings', ref => {
					let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
					query = query.where('user_id', '==', user_id);
					if (status != 3){
						query = query.where('status', '==', status);	
					}
					console.log('holy');
					console.log('limit', limit);
					if (limit){
						query = query.orderBy('created_date', 'asc').limit(limit);	
					}
					
					
					return query;
				}).snapshotChanges().subscribe((listingsData) => {
					this.listingsList = [];

					listingsData.map((listing) => {
						let data = listing.payload.doc.data();
						data['id'] = listing.payload.doc.id;
						this.listingsList.push(data);
					});
					console.log('error 1');
					console.log(JSON.stringify(this.listingsList));
					resolve(this.listingsList);
				});
			});

		});
	}
	getCounter(){
		return new Promise<Object>((resolve, reject) => {
			this.afStore.collection('counts', ref => {
				let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
				query = query.orderBy('rank', 'asc');
				return query;
			}).valueChanges().subscribe((counter) => {
				resolve(counter);
			});
		});
	}
	countListingProvinces() {
		return new Promise<Object>((resolve, reject) => {

			let provincesObs = [];

			let provinces = [
			{id: "phnom-penh", total: 0},
			{id: "preah-sihanouk", total: 0},
			{id: "kampong-cham", total: 0},
			{id: "siem-reap", total: 0},
			{id: "battambang ", total: 0},
			{id: "kandal ", total: 0},
			{id: "banteay-meanchey", total: 0},
			{id: "kampong-chhnang", total: 0},
			{id: "kampong-speu", total: 0},
			{id: "kampong-thom", total: 0},
			{id: "kampot ", total: 0},
			{id: "kep ", total: 0},
			{id: "koh-kong", total: 0},
			{id: "kratie ", total: 0},
			{id: "mondulkiri ", total: 0},
			{id: "oddar-meanchey", total: 0},
			{id: "pailin ", total: 0},
			{id: "preah-vihear", total: 0},
			{id: "prey-veng", total: 0},
			{id: "pursat ", total: 0},
			{id: "ratanakiri ", total: 0},
			{id: "stung-treng", total: 0},
			{id: "svay-rieng", total: 0},
			{id: "takeo ", total: 0},
			{id: "tboung-khmum" , total: 0}
			];

			for (let province of provinces){
				let afProvince = this.afStore.collection('listings', ref => {
					let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
					query = query.where('status', '==', 1);
					query = query.where('province', '==', province.id);
					return query;
				}).snapshotChanges().take(1).map((data) => {
					province.total = data.length;
					return province;
				});
				provincesObs.push(afProvince);
			}

			Observable.forkJoin(
				provincesObs
				).subscribe((dataForkjoin) => {
					resolve(dataForkjoin);
				})
			});
	}

	setProspect(prospect){

		return new Promise<Object>((resolve, reject) => {
			this.auth.getUser().then((user) => {
				this.prospectCollection.doc(prospect.id).set(prospect).then(() => {

					resolve();
				}).catch((msg) => {

					console.error('error set', JSON.stringify(msg));
					reject(msg);
				});
			});
			
		});
		
	}

	

	deleteProspect(prospect_id){

		return new Promise<Object>((resolve, reject) => {
			this.prospectCollection.doc(prospect_id).delete().then(() => {
				resolve(true);
			});
		});

		
	}



	

	getProspects(){
		return new Promise<Object>((resolve, reject) => {
			this.auth.getUser().then((user) => {
				this.afStore.collection('prospects', ref => {
					let query: firebase.firestore.Query = ref;
					query = query.where('user_uid', '==', user['uid']);

					return query;
				})
				.valueChanges().subscribe((prospectData) => {
					
					resolve(prospectData);
				});
			});
			
		});
	}

	getProspectsByListing(listingId){
		return new Promise<Object>((resolve, reject) => {
			this.afStore.collection('prospects', ref => {
				let query: firebase.firestore.Query = ref;
				query = query.where('listing_id', '==', listingId);
				
				return query;
			})
			.valueChanges().subscribe((prospectData) => {
				
				resolve(prospectData);
			});
		});
	}



	getByUserRef(userRef) {
		return this.listingsCollection = this.afStore.collection('listings', ref => ref.where('user', '==', userRef));
	}
	getByFilters(name: string,
		listing_type:string,
		property_type:string,
		province:string,
		district:string,
		title:string,
		price:string,
		description:string,
		bedrooms:string,
		bathrooms:string,
		size:string,
		user_id:string,
		phone_1:string,
		phone_2:string,
		images:string,
		address:string) {
		return this.listingsCollection = this.afStore.collection<Listing>('listings', ref => {
			// Compose a query using multiple .where() methods
			return ref
			.where('listing_type', '==', listing_type)
			.where('price', '>', price);
		});
	}
}