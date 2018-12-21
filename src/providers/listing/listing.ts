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
		this.usersCollection = this.afStore.collection<User>('users');
		this.countsCollection = this.afStore.collection<Count>('counts');

		this.provinces = [
		{id: "phnom-penh", text: "Phnom Penh", rank: 0, lat: 11.562108, lng: 104.888535},
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
		{province_id: "kampong-speu", id: "basedth", text: "Basedth"},
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
		{province_id: "prey-veng", id: "kampong-leav", text: "Kampong Leav"},
		{province_id: "prey-veng", id: "sithor-kandal", text: "Sithor Kandal"},
		{province_id: "prey-veng", id: "pea-reang", text: "Pea Reang"},
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
	// getFirebaseAll(filter){
	// 	return new Promise<Object>((resolve, reject) => {
	// 		this.afStore.collection('listings', ref => {
	// 			let query: firebase.firestore.Query = ref;
				
	// 			if (filter.listing_type) { query = query.where('listing_type', '==', filter.listing_type) };
	// 			if (filter.province) { query = query.where('province', '==', filter.province) };
	// 			query = query.where('status', '==', 1);
	// 			query = query.orderBy('created_date', 'desc').limit(10);
				
				

	// 			return query;
	// 		})
	// 		.valueChanges().subscribe((listingsData: Listing[]) => {
				
	// 			let lastIndex = listingsData[listingsData.length - 1];

	// 			this.afStore.collection('listings', ref => {
	// 			let query: firebase.firestore.Query = ref;
				
	// 			if (filter.listing_type) { query = query.where('listing_type', '==', filter.listing_type) };
	// 			if (filter.province) { query = query.where('province', '==', filter.province) };
	// 			query = query.where('status', '==', 1);
	// 			query = query.orderBy('created_date', 'desc').limit(10).startAfter(lastIndex);				
	// 			console.log('lastIndex ===> ', lastIndex.id);
	// 			return query;
	// 			})
	// 			.valueChanges().subscribe((listingsDataStartAt: Listing[]) => {
	// 				this.listingsList = [];

	// 				console.log('listingData', listingsDataStartAt.length);
	// 				listingsDataStartAt.forEach((listing: Listing) => {
	// 					this.listingsList.push(listing);
	// 				});
	// 				resolve(this.listingsList);
	// 			});

	// 		});
	// 	});
	// }
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
	// searchKeyword(keyword){
	// 	return new Promise<Object>((resolve, reject) => {
	// 		this.afStore.collection('listings', ref => {
	// 			let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
	// 			// query = query.orderBy('title').startAt(keyword).endAt(keyword+"\uf8ff");  
	// 			// query = query.orderBy('property_id').startAt(keyword).endAt(keyword+"\uf8ff");  
	// 			// query = query.orderBy('displayName').startAt(keyword).endAt(keyword+"\uf8ff");  
	// 			// query = query.orderBy('agencyName').startAt(keyword).endAt(keyword+"\uf8ff");  
	// 			// query = query.orderBy('provinceName').startAt(keyword).endAt(keyword+"\uf8ff");  
	// 			// query = query.orderBy('districtName').startAt(keyword).endAt(keyword+"\uf8ff");
	// 			// query = query.orderBy('listing_type').startAt(keyword).endAt(keyword+"\uf8ff");  
	// 			// query = query.orderBy('property_type').startAt(keyword).endAt(keyword+"\uf8ff");  
				
	// 			query = query.where('status', '==', 1);
	// 			return query;
	// 		})
	// 		.valueChanges().subscribe((listingsData: Listing[]) => {
	// 			this.listingsList = [];
	// 			listingsData.forEach((listing: Listing) => {
	// 				this.listingsList.push(listing);
					
	// 			});
	// 			resolve(this.listingsList);
	// 		});
	// 	});
	// }
	
	// filter(filter){
	// 	return new Promise<Object>((resolve, reject) => {
	// 		this.afStore.collection('listings', ref => {
	// 			let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
	// 			if (filter.property_type) { query = query.where('property_type', '==', filter.property_type) };
	// 			if (filter.listing_type) { query = query.where('listing_type', '==', filter.listing_type) };
	// 			if (filter.province) { query = query.where('province', '==', filter.province) };
	// 			if (filter.district) { query = query.where('district', '==', filter.district) };
	// 			if (filter.keyword) { 
	// 				query = query.orderBy('title').startAt(filter.keyword).endAt(filter.keyword+"\uf8ff");  
	// 			}
	// 			else{
	// 				if (filter.sort_by == 'newest' && !filter.min_price && !filter.max_price){
	// 					query = query.orderBy('created_date', 'desc');
	// 				}
	// 				if (filter.sort_by == 'oldest' && !filter.min_price && !filter.max_price){
	// 					query = query.orderBy('created_date', 'asc');
	// 				}
	// 				if (filter.sort_by == 'highest'){
	// 					query = query.orderBy('price', 'desc');
	// 				}
	// 				if (filter.sort_by == 'lowest'){
	// 					query = query.orderBy('price', 'asc');
	// 				}

	// 				if (filter.min_price && filter.sort_by != 'highest' && filter.sort_by != 'lowest'){
	// 					query = query.orderBy('price').where('price', '>=', parseFloat(filter.min_price));
	// 				}
	// 				else if (filter.min_price){
	// 					if (filter.sort_by == 'highest' || filter.sort_by == 'lowest'){
	// 						query = query.where('price', '>=', parseFloat(filter.min_price));	
	// 					}
	// 				}
	// 				if (filter.max_price){
	// 					query = query.where('price', '<=', parseFloat(filter.max_price));
	// 				}
	// 			}

	// 			query = query.where('status', '==', 1);


	// 			return query;
	// 		})
	// 		.valueChanges().subscribe((listingsData: Listing[]) => {
	// 			this.listingsList = [];
	// 			listingsData.forEach((listing: Listing) => {
	// 				this.listingsList.push(listing);
					
	// 			});
	// 			resolve(this.listingsList);
	// 		});
	// 	});
	// }
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
			const id = this.afStore.createId();
			
			listing.created_date = new Date();
			listing.status = 1;

				let size = listing.property_type + Math.floor(100000 + Math.random() * 900000);
				listing.property_id = size;
				let tmpImages = listing.images;
				listing.images = [];
				this.addCount(listing.province, listing.listing_type);
				
				this.set(id, listing).then((id) => {
					
					listing.id = id;
					listing.images = tmpImages;
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
			const storageRef: AngularFireStorageReference = this.afStorage.ref(`listing_images/${id}_${index}.jpeg`);
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
					listingUuid: id
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
	
	getUserListings(user_id, status){
		return new Promise<Object>((resolve, reject) => {
			this.auth.getUser().then((user) => {
				this.afStore.collection('listings', ref => {
					let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
					query = query.where('user_id', '==', user_id);
					query = query.where('status', '==', status);
					return query;
				}).snapshotChanges().subscribe((listingsData) => {
					this.listingsList = [];
					listingsData.map((listing) => {
						let data = listing.payload.doc.data();
						data['id'] = listing.payload.doc.id;
						this.listingsList.push(data);
					});
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