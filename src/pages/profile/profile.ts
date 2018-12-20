import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ToastController, ActionSheetController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth/auth';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { LoginPage } from '../login/login';
import { ServiceProvider } from '../../providers/service/service';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


 @Component({
   selector: 'page-profile',
   templateUrl: 'profile.html',
 })
 export class ProfilePage {
   private user: any = {
     displayName: '',
     phone1: '',
     phone2: '',
     email: '',
     photoURL: '',
     userType: '',
     agencyName: ''
   };
   private actionSheetButtons = [];
   private actionSheetTitle: string;
   private photoUrl: any = '';
   private agencies: any = [];
   private myLoading: any;
   constructor(public alertCtrl: AlertController, 
     public navCtrl: NavController, 
     public navParams: NavParams,
     private auth: AuthServiceProvider,
     private sanitizer: DomSanitizer,
     private camera: Camera,
     private file: File,
     private actionSheetCtrl: ActionSheetController,
     private photoViewer: PhotoViewer,
     private toastCtrl: ToastController,
     private serviceProvider: ServiceProvider,
     private loadingCtrl: LoadingController) {
     this.auth.getUser().then((user) => {
       this.user = user; 
       this.user.userType = user['userType'] ? user['userType'] : '';
       this.user.agencyName = user['agencyName'] ? user['agencyName'] : '';
       console.log('USER ==> ', JSON.stringify(this.user));
       // this.user.type = this.user.type ? this.user.type : 'owner';
       if (!this.user){
         this.navCtrl.push(LoginPage, {page: 'add'}, {animate: false});
       }
       this.photoUrl = this.user.photoURL ? this.user.photoURL : '../assets/imgs/image_blank.png';
     });

   }
   ionViewWillEnter(){ this.serviceProvider.transition(); }


   ionViewDidLoad() {

     console.log('ionViewDidLoad ProfilePage');
   }

   getBackground(image) {
     return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
   }

   getPhoto(sourceType) {
     if (sourceType == 'camera'){
       sourceType = this.camera.PictureSourceType.CAMERA;
     }
     else if (sourceType == 'gallery'){
       sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;  
     }
     const options: CameraOptions = {
       quality: 80,
       destinationType: this.camera.DestinationType.FILE_URI,
       encodingType: this.camera.EncodingType.JPEG,
       mediaType: this.camera.MediaType.PICTURE,
       sourceType: sourceType,
       targetWidth: 1280,
       targetHeight: 1280,
       correctOrientation: true,
     }

     this.camera.getPicture(options).then((imageUri) => {
       this.user.photoURL = imageUri;
       let filename = imageUri.substring(imageUri.lastIndexOf('/')+1);
       filename = filename.split('?')[0];
       let path =  imageUri.substring(0,imageUri.lastIndexOf('/')+1);

       this.file.readAsDataURL(path, filename).then((dataUrl) => {
         this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
       }).catch((msg) => {
         console.error('error read file', JSON.stringify(msg));
       });

       
     }).catch((error) => {
       console.log('ERROR CAMERA ==> ', error);
     });
   }


   addImage() {
     this.actionSheetButtons = [
     {
       text: 'Camera',
       handler: () => {
         this.getPhoto('camera');
       }
     },{
       text: 'Gallery',
       handler: () => {
         this.getPhoto('gallery');
       }
     },{
       text: 'View Image',
       handler: () => {
         this.photoViewer.show(this.photoUrl);
       }
     }
     ];
     this.actionSheetTitle = 'Add Image';

     const actionSheet = this.actionSheetCtrl.create({
       title: this.actionSheetTitle,
       buttons: this.actionSheetButtons
     });
     actionSheet.present();
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

   submit(){
     this.presentLoading();
     this.auth.updateUser(this.user).then(() => {
       this.dismissLoading();
       this.presentToast();
     });
   }

   presentToast() {
     const toast = this.toastCtrl.create({
       message: 'Updated successfully',
       duration: 3000
     });
     toast.present();
   }

   promptChangePassword() {
     const prompt = this.alertCtrl.create({
       title: 'Change Password',
       inputs: [
       {
         name: 'old_password',
         placeholder: 'Old Password'
       },
       {
         name: 'new_password',
         placeholder: 'New Password'
       },
       {
         name: 'confirm_password',
         placeholder: 'Confirm Password'
       },
       ],
       buttons: [
       {
         text: 'Cancel',
         handler: data => {
           console.log('Cancel clicked');
         }
       },
       {
         text: 'Save',
         handler: data => {

           this.showWrongPassword();
           console.log('Saved clicked', JSON.stringify(data));
         }
       }
       ]
     });
     prompt.present();
   }

   showWrongPassword() {
     const confirm = this.alertCtrl.create({
       title: 'Wrong Password!',
       buttons: [
       {
         text: 'Close',
         handler: () => {
           console.log('Disagree clicked');
           this.showSuccessChangedPassword();
         }
       },
       {
         text: 'Retry',
         handler: () => {
           console.log('Agree clicked');
           this.promptChangePassword();
         }
       }
       ]
     });
     confirm.present();
   }

   showSuccessChangedPassword() {
     const confirm = this.alertCtrl.create({
       title: 'Password Changed!',
       buttons: [
       {
         text: 'Done',
         handler: () => {
           console.log('Agree clicked');
         }
       }
       ]
     });
     confirm.present();
   }

 }
