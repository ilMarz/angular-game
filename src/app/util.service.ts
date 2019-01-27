import { Injectable } from '@angular/core';


export interface SelectedCellList { 
  index: number, type: number, hit: boolean
}

export interface Item { 
  index: number, type: number, neighborList: Neighbor[]
}

export interface Neighbor { 
  up: {index: number, isFree: boolean},
  down: {index: number, isFree: boolean},
  left: {index: number, isFree: boolean},
  right: {index: number, isFree: boolean}
}

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  private colNumber = 11;

  private indexOffset = this.colNumber;
  private cellNumber = this.colNumber*this.colNumber;
  private range = Array.from(Array(this.cellNumber).keys());

  checkIfCellIsSelectedByIndexAndSetColourByType(arrayToCheck: SelectedCellList[], index: number, type: number){
    var cellByIndex = this.getCellByIndex(arrayToCheck,index);
    return cellByIndex!=undefined ? cellByIndex.type==type : false;
  }

  checkIfIsAValidCellToSelect(item: Item, index: number){
    if(item.neighborList.length==0){
      return true;
    }
    var upCell = item.neighborList.find( c => c.up.index === index);
    var downCell = item.neighborList.find( c => c.down.index === index);
    var leftCell = item.neighborList.find( c => c.left.index === index);
    var rightCell = item.neighborList.find( c => c.right.index === index);

    if (upCell!=undefined || downCell!=undefined || leftCell!=undefined || rightCell!=undefined) {
      return true;      
    }
    console.log("too far!: "+index);
    return false;
  }

  getNeighborhoodFromIndex(index: number){
    var neighbor:Neighbor = {
      up: {index: index-this.indexOffset, isFree: true},
      down: {index: index+this.indexOffset, isFree: true},
      left: {index: index-1, isFree: true},
      right: {index: index + 1, isFree: true}
     }
     return neighbor;
  }

  getRange(){
    return this.range;
  }

  createItemObject(index:number,selectedType: number, neighbor: Neighbor){
    var item:Item;
    item.type = selectedType;
    item.index = index;
    item.neighborList.push(neighbor);
    
    return item;
  }



  //private
  
  private getCellByIndex(arrayToCheck: SelectedCellList[], index:number){
    return arrayToCheck.find(cell => cell.index === index);
  }
}
