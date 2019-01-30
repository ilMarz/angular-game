import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fs: FirebaseService) {}

  isUserLogged: Boolean = false;

  async login(username: string, password: string){
    var userExists = await this.fs.checkCredential(username,password);
    if(userExists){
      var token = btoa(username + "::" + password);
      this.isUserLogged = true;
      localStorage.setItem("token", token);
    }
  }

  checkToken(){
    if(localStorage.getItem("token")==null){
      return;
    }
    let token = atob(localStorage.getItem("token"));
    let username = token.split("::")[0];
    let password = token.split("::")[1];

    this.fs.checkCredential(username,password).then(res => {
      if(res==true){
        this.isUserLogged=true;
      }
    })
  }

  logout(){
    this.isUserLogged = false;
    localStorage.removeItem("token");
  }
}
