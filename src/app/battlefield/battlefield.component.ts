import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.scss']
})
export class BattlefieldComponent implements OnInit {

  range = new Array(48);
  selectedCell: number;

  constructor() { }

  ngOnInit() {
  }

  selectCell(index){
    this.selectedCell = index;
  }

}
