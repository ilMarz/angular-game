import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.scss']
})
export class BattlefieldComponent implements OnInit {

  cellNumber = 154;
  range = Array.from(Array(this.cellNumber).keys());
  selectedCellList = new Array(); 
  indexOffset = 14;
  disableAll = false;

  item = {type: null,
          cell: []
        };

  selectedType = 1;

  constructor() { }

  ngOnInit() {
  }

  addToSelectedCellList(index: number){
    this.disableAll=true;
    this.createItem(index)
  }

  checkIfCellIsSelectedByIndexAndSetColourByType(index: number, type: number){
    var cellByIndex = this.getCellByIndex(index);
    return cellByIndex!=undefined ? cellByIndex.type==type : false;
  }

  getCellByIndex(index:number){
    return this.selectedCellList.find(cell => cell.index === index);
  }

  createItem(index: number){
    this.item.type = this.selectedType;

    if(this.selectedCellList.some(c => c.index === index)){
      //alert("già selezionato");
      return;
    }
      
    if(this.checkIfIsAValidCellToSelect(index)){
      var cell = this.generateMapFromIndex(index);
      this.item.cell.push(cell);
      this.selectedCellList.push({'index': index, 'type': this.selectedType});
    }      

    if(this.item.cell.length>=this.selectedType){
      alert("item completato");
      this.resetItem();
      this.disableAll=false;
      return;
    }
         
  }

  setType(type: number){
    this.selectedType = type;
  }

  generateMapFromIndex(index: number){
    var cell = {
      up: {index: index-this.indexOffset, isFree: true},
      down: {index: index+this.indexOffset, isFree: true},
      left: {index: index-1, isFree: true},
      right: {index: index + 1, isFree: true}
     }
     return cell;
  }

  checkIfIsAValidCellToSelect(index: number){
    if(this.item.cell.length==0){
      return true;
    }
    var upCell = this.item.cell.find( c => c.up.index === index);
    var downCell = this.item.cell.find( c => c.down.index === index);
    var leftCell = this.item.cell.find( c => c.left.index === index);
    var rightCell = this.item.cell.find( c => c.right.index === index);

    if (upCell!=undefined || downCell!=undefined || leftCell!=undefined || rightCell!=undefined) {
      return true;
      
    }

    //alert("troppo lontanto!");
    return false;
  }

  resetItem(){
    this.item = {type: null,
                cell: []
                };
  }
}
