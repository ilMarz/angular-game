import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../_service/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {}

  @Input('username')
  username: string = null;

  @Input('password')
  password: string = null;

  @Input('registerUsername')
  registerUsername: string = null;

  @Input('registerPassword')
  registerPassword: string = null;

  @Input('passwordConfirm')
  passwordConfirm: string = null;

  registeredUsername: string = null;
  registeredPassword: string = null;
  isUserRegistered: boolean = false;
  showCard: boolean = false;
  registerMessage: string = null;

  

  checkCredential(){
    this.authService.login(this.username,this.password).then(()=>{
      this.router.navigate(['/play']);
    })
    .catch(error=> {
      console.log("user not exist")
    })
  }

  createUser(){
    this.authService.create(this.registerUsername,this.registerPassword).then((credentials)=>{
      this.showCard = true;
      this.isUserRegistered = credentials.username!=null && credentials.password!=null;

      if(this.isUserRegistered){
        this.registeredUsername = credentials.username;
        this.registeredPassword = credentials.password;
        this.registerMessage = "User registered with success!";
      }
      else {
        this.registerMessage = "User alredy exists!"
      }
      console.log(credentials)
    })
    .catch(error=>{
      console.log("error on sign up")
    })
  }

}
