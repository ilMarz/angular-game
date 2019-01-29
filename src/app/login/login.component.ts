import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from '../firebase.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private fireBaseService: FirebaseService) { }

  ngOnInit() {
  }

  @Input('matchId')
  username: string = null;

  @Input('matchId')
  password: string = null;

  async checkCredential(){
    var exists = await this.fireBaseService.checkCredential(this.username,this.password);
    console.log("Does user exist?", exists)
  }

}
