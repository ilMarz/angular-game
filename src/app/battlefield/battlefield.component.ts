import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.scss']
})
export class BattlefieldComponent implements OnInit {

  cellNumber = 96;
  range = Array.from(Array(this.cellNumber).keys());
  selectedCellList = new Array(); 

  constructor() { }

  ngOnInit() {
  }

  addToSelectedCellList(index: number){
    this.selectedCellList.push({'index': index});
  }

  checkIfCellIsSelectedByIndex(index: number){
    return this.selectedCellList.some(cell => cell.index === index);
  }

}
