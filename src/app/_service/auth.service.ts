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
            var token = btoa(username + "::" + password);
            this.isUserLogged = true;
            localStorage.setItem("token", token);
            resolve();
          }
          reject();
      })
    })
  }

  create(username: string, password: string){

    return new Promise<{username: string, password: string}>((resolve, reject) => {
      this.fs.checkIfUserAlreadyExists(username).then(userExists=>{
          if(!userExists){
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
    let token = atob(localStorage.getItem("token"));
    let username = token.split("::")[0];
    let password = token.split("::")[1];   

    if(username==undefined || password==undefined){
      return
    }

    credentialMap.username = username;
    credentialMap.password = password;

    return credentialMap;
  }
}
