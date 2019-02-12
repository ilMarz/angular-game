import { Component } from '@angular/core';
import { FirebaseService } from './_firebase/firebase.service';
import { Router } from '@angular/router';
import { AuthService } from './_service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Game';
  showLogout = false;
  username: string;

  constructor(private fs: FirebaseService, private router: Router, private authService: AuthService){}

  ngOnInit() {

    this.showLogout = this.authService.isUserLogged;

    let credentialMapFromLocalStorage = this.getCredentialMapFromLocalStorage();
    if( credentialMapFromLocalStorage==undefined){
      return
    }
    let username = credentialMapFromLocalStorage.username;
    let password = credentialMapFromLocalStorage.password;
    this.username = username;

    this.authService.login(username,password).then(data =>{
      this.showLogout = true;
      this.router.navigate(['/play']);
    })
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['']);
    this.showLogout = false;
  }

  //private
  private getCredentialMapFromLocalStorage():{ [key:string]:string; }{
    return this.authService.getCredentialMapFromLocalStorage();
  }
}
