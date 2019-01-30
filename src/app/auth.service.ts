import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fs: FirebaseService) {}

  isUserLogged: Boolean = false;

  login(username: string, password: string){
    return new Promise<Object>(resolve => {
      this.fs.checkCredential(username,password).then(userExists=>{
          if(userExists){
            var token = btoa(username + "::" + password);
            this.isUserLogged = true;
            localStorage.setItem("token", token);
          }
          resolve();
      })
    })
  }

  logout(){
    this.isUserLogged = false;
    localStorage.removeItem("token");
  }
}
