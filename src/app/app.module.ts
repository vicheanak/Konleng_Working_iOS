import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { FormsModule } from '@angular/forms';

import { SearchPage } from '../pages/search/search';
import { MePage } from '../pages/me/me';
import { ListingPage, FilterModal, DetailModal } from '../pages/listing/listing';
import { DetailPage, ImageModal } from '../pages/detail/detail';

import { ChangePasswordPage } from '../pages/change-password/change-password';
import { ConfirmationPage } from '../pages/confirmation/confirmation';
import { ContactUsPage } from '../pages/contact-us/contact-us';
import { EditPage } from '../pages/edit/edit';
import { MyPropertiesPage } from '../pages/my-properties/my-properties';
import { UserPropertiesPage } from '../pages/user-properties/user-properties';
import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';
import { ProfilePage } from '../pages/profile/profile';
import { SavedPage } from '../pages/saved/saved';
import { SettingsPage } from '../pages/settings/settings';
import { TermsOfUsePage } from '../pages/terms-of-use/terms-of-use';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { AddPage } from '../pages/add/add';
import { FollowPage } from '../pages/follow/follow';


import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { IonicStorageModule } from '@ionic/storage';


import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStepperModule } from 'ionic-stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GoogleMaps } from '@ionic-native/google-maps';

import { NativeGeocoder } from '@ionic-native/native-geocoder';


import { Base64 } from '@ionic-native/base64';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreModule, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { firebaseConfig } from '../config';

import { NgxErrorsModule } from '@ultimate/ngxerrors';
import { AuthServiceProvider } from '../providers/auth/auth';

import { Facebook } from '@ionic-native/facebook';


import { FirebaseAuthentication } from '@ionic-native/firebase-authentication';
import { ListingProvider } from '../providers/listing/listing';
import { AngularFireStorage, AngularFireStorageReference } from 'angularfire2/storage';
import { ImageResizer } from '@ionic-native/image-resizer';

import { File } from '@ionic-native/file';



import { PhotoViewer } from '@ionic-native/photo-viewer';
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';
import { ServiceProvider } from '../providers/service/service';

import { AppRate } from '@ionic-native/app-rate';
import { NativePageTransitions } from '@ionic-native/native-page-transitions';
import { Device } from '@ionic-native/device';

import { IonicImageViewerModule, ImageViewerComponent, ImageViewerController } from 'ionic-img-viewer';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ImagesProvider } from '../providers/images/images';


@NgModule({
  declarations: [
    MyApp,
    SearchPage,
    MePage,
    ListingPage,
    FilterModal,
    DetailModal,
    ImageModal,
    DetailPage,
    ChangePasswordPage,
    ConfirmationPage,
    ContactUsPage,
    EditPage,
    MyPropertiesPage,
    UserPropertiesPage,
    PrivacyPolicyPage,
    ProfilePage,
    SavedPage,
    SettingsPage,
    TermsOfUsePage,
    LoginPage,
    RegisterPage,
    FollowPage,
    AddPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxErrorsModule,
    IonicImageViewerModule,
    IonicModule.forRoot(MyApp, { scrollAssist: false, autoFocusAssist: false }),
    IonicStorageModule.forRoot({
      name: '__konleng',
         driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    IonicStepperModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig.fire),
    AngularFirestoreModule.enablePersistence(),
    TranslateModule.forRoot({
    loader: {
     provide: TranslateLoader,
     useFactory: (setTranslateLoader),
     deps: [HttpClient]
   }
  })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SearchPage,
    MePage,
    ListingPage,
    FilterModal,
    DetailModal,
    ImageModal,
    DetailPage,
    ChangePasswordPage,
    ConfirmationPage,
    ContactUsPage,
    FollowPage,
    EditPage,
    MyPropertiesPage,
    UserPropertiesPage,
    PrivacyPolicyPage,
    ProfilePage,
    SavedPage,
    SettingsPage,
    TermsOfUsePage,
    LoginPage,
    RegisterPage,
    AddPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GoogleMaps,
    NativeGeocoder,
    Base64,
    Camera,
    AngularFireAuth,
    AngularFirestore,
    AngularFireDatabase,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthServiceProvider,
    Facebook,
    FirebaseAuthentication,
    AngularFireStorage,
    ListingProvider,
    ImageResizer,
    File,
    PhotoViewer,
    CallNumber,
    EmailComposer,
    ServiceProvider,
    AppRate,
    NativePageTransitions,
    Device,
    ImageViewerController,
    ScreenOrientation,
    ImagesProvider
  ]
})
export class AppModule {
  // setTranslateLoader(http: HttpClient) {
  //   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  // }
}

export function setTranslateLoader(http: HttpClient) {
 return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}



