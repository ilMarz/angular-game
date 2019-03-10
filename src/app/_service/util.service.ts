import { Injectable } from '@angular/core';
import {FirebaseService} from '../_firebase/firebase.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';


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

  constructor(private fs: FirebaseService,
    private ngxLoader : NgxUiLoaderService) {
   }

  private colNumber = 11;

  private indexOffset = this.colNumber;
  private cellNumber = this.colNumber*this.colNumber;
  private range = Array.from(Array(this.cellNumber).keys());

  checkIfCellIsSelectedByIndexAndSetColourByType(arrayToCheck: SelectedCell[], index: number, type: number){
    var cellByIndex = this.getCellByIndex(arrayToCheck,index);
    return cellByIndex!=undefined ? cellByIndex.type==type : false;
  }

  isSelectedCellTooFarFromItem(index: number, item: Item){

    if (item.neighborList.length==0 || 
      this.findNeighborFromPosition(item, 'up', index) || 
        this.findNeighborFromPosition(item, 'down', index) || 
        this.findNeighborFromPosition(item, 'left', index) || 
        this.findNeighborFromPosition(item, 'right', index)) {
      return false;      
    }
    console.log("too far!: "+index);
    return true;
  }

  getNeighborhoodFromIndex(index: number){
    var neighbor:Neighbor = {
      up: {index: index-this.indexOffset, isFree: true},
      down: {index: index+this.indexOffset, isFree: true},
      left: {index: this.isLeftBound(index) ? 999 : index-1, isFree: true},
      right: {index: this.isRightBound(index) ? 999 : index + 1, isFree: true}
     }
     return neighbor;
  }

  getRange(){
    return this.range;
  }

  getColNumber(){
    return this.colNumber;
  }

  setHitCellInOppositeCellList(index: number, documentId: string, oppositeUsername: string, oppositeCellList: SelectedCell[]){
    var isPresent = false;
    var isAlreadyHit = false;

    oppositeCellList.forEach(oppositeCell=>{
      if(isPresent){
        return
      }
      if(oppositeCell.index==index){
        if(!oppositeCell.hit){
          oppositeCell.hit=true;
          isPresent=true;
        }
        else {
          isAlreadyHit = true
          return
        }
      }      
    })

    if(isAlreadyHit){
      return
    }

    if(!isPresent){
        oppositeCellList.push({index: index, type: 999, hit:true})
    }

    this.fs.updateOppositeCellListAfterAttack(documentId,oppositeUsername,oppositeCellList, !isPresent)
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

  toggleLoader(show: boolean){
    try{
      if(show){
        this.ngxLoader.startLoader('loader-01')
        return
      }
      this.ngxLoader.stopLoader('loader-01')
    }
    catch(e) {
      console.log("NO LOADER", e)
    }
  }

  endMatch(documentID: string){

    this.fs.endMatch(documentID)
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

  private findNeighborFromPosition(item: Item, pos: string, index: number){
    return item.neighborList.find( c => c[pos] ? c[pos].index === index : false)!=undefined;
  }

  private isLeftBound(index: number){
    return (index % this.colNumber) === 0;
  }

  private isRightBound(index: number){
    return (index % this.colNumber) === this.colNumber - 1;
  }
}
