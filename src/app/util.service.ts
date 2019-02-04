import { Injectable } from '@angular/core';
import {FirebaseService} from './firebase.service';


export interface SelectedCell { 
  index: number, type: number, hit: boolean
}

export interface Item { 
  type: number, neighborList: Neighbor[]
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

  constructor(private fs: FirebaseService) { }

  private colNumber = 11;

  private indexOffset = this.colNumber;
  private cellNumber = this.colNumber*this.colNumber;
  private range = Array.from(Array(this.cellNumber).keys());

  checkIfCellIsSelectedByIndexAndSetColourByType(arrayToCheck: SelectedCell[], index: number, type: number){
    var cellByIndex = this.getCellByIndex(arrayToCheck,index);
    return cellByIndex!=undefined ? cellByIndex.type==type : false;
  }

  isSelectedCellTooFarFromItem(index: number, item: Item){
    if(item.neighborList.length==0){
      return false;
    }
    var upCell = item.neighborList.find( c => c.up.index === index);
    var downCell = item.neighborList.find( c => c.down.index === index);
    var leftCell = item.neighborList.find( c => c.left.index === index);
    var rightCell = item.neighborList.find( c => c.right.index === index);

    if (upCell!=undefined || downCell!=undefined || leftCell!=undefined || rightCell!=undefined) {
      return false;      
    }
    console.log("too far!: "+index);
    return true;
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

  getColNumber(){
    return this.colNumber;
  }

  setHitCellInOppositeCellList(index: number, documentId: string, username: string, oppositeCellList: SelectedCell[]){
    var isPresent = false;

    oppositeCellList.forEach(oppositeCell=>{
      if(isPresent){
        return
      }
      if(!oppositeCell.hit && oppositeCell.index==index){
        oppositeCell.hit=true;
        isPresent=true;
      }      
    })

    if(!isPresent){
        oppositeCellList.push({index: index, type: 999, hit:true})
    }

    this.fs.insertCellList(documentId,username,oppositeCellList)
  }

  getHitCellType(index: number, type: number, oppositeCellList: SelectedCell[]){
    var cellByIndex = oppositeCellList.find(cell => cell.index === index && cell.hit === true);
    return cellByIndex!=undefined ? cellByIndex.type==type : false;
  }

  checkIfCellIsHitOnEnemyField(index: number, cellList: SelectedCell[]){
    return this.checkIfCellIsHit(index, cellList,true)
  }

  checkIfCellIsHitOnField(index: number, cellList: SelectedCell[]){
    return this.checkIfCellIsHit(index, cellList,false) 
  }

  //private

  private checkIfCellIsHit(index: number, cellList: SelectedCell[], isOpponentField: boolean){
    let selectedCell=cellList.find(cell=>cell.index==index)
    if(selectedCell==undefined || (!selectedCell.hit && isOpponentField)){
      return
    }

    if(selectedCell.hit){
      if(selectedCell.type==999){
        return "isMissed"
      }
      return isOpponentField ? "type"+selectedCell.type+"selected" : "isHit"
    }
    
    return "type"+selectedCell.type+"selected"
  }
  
  private getCellByIndex(arrayToCheck: SelectedCell[], index:number){
    return arrayToCheck.find(cell => cell.index === index);
  }
}
