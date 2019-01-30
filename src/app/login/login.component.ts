import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  @Input('matchId')
  username: string = null;

  @Input('matchId')
  password: string = null;

  async checkCredential(){
    await this.authService.login(this.username,this.password);
    this.router.navigate(['/play']);
  }

}
