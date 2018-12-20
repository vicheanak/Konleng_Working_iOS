import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { AngularFireStorage, AngularFireStorageReference } from 'angularfire2/storage';
import { map, tap, take, switchMap, mergeMap, expand, takeWhile } from 'rxjs/operators';
import { File } from '@ionic-native/file';
import {User, AuthServiceProvider} from '../auth/auth';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';
import 'rxjs/add/observable/forkJoin';

/*
  Generated class for the ImagesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ImagesProvider {

	private _READER : any  			=	new FileReader();
	private _REMOTE_URI : string 	=	"http://YOUR-REMOTE-URI-HERE/parse-upload.php";

  constructor(public http: HttpClient) {
    console.log('Hello ImagesProvider Provider');
  }

  handleImageSelection(event : any) : Observable<any>
   {
      let file 		: any 		= event.target.files[0];

      this._READER.readAsDataURL(file);
      return Observable.create((observer) =>
      {
         this._READER.onloadend = () =>
         {
            observer.next(this._READER.result);
            observer.complete();
         }
      });
   }

   isCorrectFileType(file)
   {
      return (/^(gif|jpg|jpeg|png)$/i).test(file);
   }


   uploadImageSelection(file 		: string,
                        mimeType 	: string) : Observable<any>
   {
      let headers 	: any		= new HttpHeaders({'Content-Type' : 'application/octet-stream'}),
          fileName  : any       = Date.now() + '.' + mimeType,
          options 	: any		= { "name" : fileName, "file" : file };

      return this.http.post(this._REMOTE_URI, JSON.stringify(options), headers);
   }

}
