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
    this.isUserLogged = userExists==true;
  }

  logout(){
    this.isUserLogged = false;
  }
}
