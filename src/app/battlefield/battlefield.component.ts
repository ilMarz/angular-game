import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.scss']
})
export class BattlefieldComponent implements OnInit {

  
  colNumber = 11;
  cellNumber = this.colNumber*this.colNumber;
  range = Array.from(Array(this.cellNumber).keys());
  indexOffset = this.colNumber;
  disableAllItemButton = false;

  item = {index: null,
          type: null,
          neighborList: []
        };
  itemList = new Array();
  selectedCellList = new Array();

  selectedType = 1;

  constructor() { }

  ngOnInit() {
  }

  addToSelectedCellList(index: number){
    if(this.itemList.length>=6){
      console.log("completo")
      return
    }
    this.disableAllItemButton=true;
    this.createItem(index);
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
    this.item.index = index;

    if(this.selectedCellList.some(c => c.index === index)){
      console.log("già selezionato: "+index);
      return;
    }
      
    if(this.checkIfIsAValidCellToSelect(index)){
      var neighbor = this.getNeighborhoodFromIndex(index);
      this.item.neighborList.push(neighbor);
      this.selectedCellList.push({index: index, type: this.selectedType});
    }      

    if(this.item.neighborList.length>=this.selectedType){
      console.log("item completato: "+this.item.type);
      this.addToItemListAndResetItemObject();
      this.disableAllItemButton=false;
      this.selectedType = this.selectedType==6 ? 1 : this.selectedType+1;
      return;
    }
         
  }

  setType(type: number){
    this.selectedType = type;
  }

  getNeighborhoodFromIndex(index: number){
    var neighbor = {
      up: {index: index-this.indexOffset, isFree: true},
      down: {index: index+this.indexOffset, isFree: true},
      left: {index: index-1, isFree: true},
      right: {index: index + 1, isFree: true}
     }
     return neighbor;
  }

  checkIfIsAValidCellToSelect(index: number){
    if(this.item.neighborList.length==0){
      return true;
    }
    var upCell = this.item.neighborList.find( c => c.up.index === index);
    var downCell = this.item.neighborList.find( c => c.down.index === index);
    var leftCell = this.item.neighborList.find( c => c.left.index === index);
    var rightCell = this.item.neighborList.find( c => c.right.index === index);

    if (upCell!=undefined || downCell!=undefined || leftCell!=undefined || rightCell!=undefined) {
      return true;
      
    }

    console.log("troppo lontanto!: "+index);
    return false;
  }

  isDisabled(type:number){
    return this.disableAllItemButton || this.itemList.some(e=>e.type==type);
  }

  addToItemListAndResetItemObject(){
    this.itemList.push(this.item);
    this.item = {index: null,
                type: null,
                neighborList: []
                };
  }
}
