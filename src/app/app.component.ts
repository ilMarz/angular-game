import { Component } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Game';

  constructor(private fs: FirebaseService, private router: Router, private authService: AuthService){}

  ngOnInit() {
    if(localStorage.getItem("token")==null){
      return;
    }
    let token = atob(localStorage.getItem("token"));
    let username = token.split("::")[0];
    let password = token.split("::")[1];   

    this.authService.login(username,password).then(data =>{
      this.router.navigate(['/play']);
    })
  }
}
