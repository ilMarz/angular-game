import { Injectable } from '@angular/core';
import { FirebaseService } from '../_firebase/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fs: FirebaseService) {}

  isUserLogged: boolean = false;

  login(username: string, password: string){
    return new Promise<Object>((resolve, reject) => {
      this.fs.checkCredential(username,password).then(userExists=>{
          if(userExists){
            this.isUserLogged = true;
            this.encodeTokenAndSaveInLocalStorage(username,password);
            resolve();
          }
          reject();
      })
    })
  }

  create(username: string, password: string){

    return new Promise<{username: string, password: string}>((resolve, reject) => {
      this.fs.checkIfUserAlreadyExists(username).then(userExists=>{
          if(userExists){
            this.fs.insertUser(username,password).then(()=>{
              var token = btoa(username + "::" + password);
              resolve({username: username, password: password});

            }).catch(error=>{
              console.log("error create user: ", error)
              reject();
            })
          }
          else {
            resolve({username: null, password: null});
          }
      })
    })
  }

  logout(){
    this.isUserLogged = false;
    localStorage.removeItem("token");
  }

  getCredentialMapFromLocalStorage():{ [key:string]:string; }{
    let credentialMap : { [key:string]:string; } = {username: null, password: null};

    if(localStorage.getItem("token")==null){
      return;
    }
    const credential = this.decodeTokenFromLocaleStorage();
    let username = credential.split("::")[0];
    let password = credential.split("::")[1];   

    if(username==undefined || password==undefined){
      return
    }

    credentialMap.username = username;
    credentialMap.password = password;

    return credentialMap;
  }

  private encodeTokenAndSaveInLocalStorage(username: string, password: string){
    const credential = username + '::' + password;
    const splitCredential = credential.trim().split('');
    const encodedCharCredential = [];
    splitCredential.forEach(c => encodedCharCredential.push(this.charEncode(c)));
    const token = btoa(encodedCharCredential.join(','));
    localStorage.setItem('token', token);
    console.log(token);

  }

  private decodeTokenFromLocaleStorage(){
    const decodedToken = atob(localStorage.getItem('token'));
    const decodedCharToken = decodedToken.split(',');
    const decodeCharCredential=[];
    decodedCharToken.forEach(d=>decodeCharCredential.push(this.charDecode(d)));
    const credential = decodeCharCredential.join('');
    console.log(credential);
    return credential;
  }


  private charEncode(value:string){
    return String.fromCharCode(value.codePointAt(0) + 11);
  }

  private charDecode(value:string){
    return String.fromCharCode(value.charCodeAt(0)-11)
  }
}
