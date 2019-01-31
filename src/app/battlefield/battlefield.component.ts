import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UtilService, SelectedCell, Item, Neighbor } from '../util.service';
import { FirebaseService } from '../firebase.service';

export interface selectedCellListFirebaseInterface { 
                                                      cellList: Object[]
                                                  }

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.scss']
})
export class BattlefieldComponent implements OnInit {

  private cellCollection: AngularFirestoreCollection<selectedCellListFirebaseInterface>;
  cellCollectionObs: Observable<selectedCellListFirebaseInterface[]>;

  @Input('matchId')
  matchId: string = null;
  
  range = this.utilService.getRange();
  colNumber = this.utilService.getColNumber();

  disableAllItemButton = false;
  isConfirmed=false;
  isExistingMatch = false;
  errorMessage=null;
  matchReady = false;
  matchState=null;
  listener = null;
  oppositeCellList: SelectedCell[] = new Array();

  item: Item = {type: null, neighborList: new Array()};
  itemList: Item[] = new Array();
  selectedCellList: SelectedCell[] = new Array(); 
  selectedCellListFirebase: selectedCellListFirebaseInterface = { cellList: [] };

  selectedType = 1;

  completed = false;

  constructor(private afs: AngularFirestore, private utilService: UtilService, private firebaseService: FirebaseService) {
    this.cellCollection = afs.collection<selectedCellListFirebaseInterface>('match');
    this.cellCollectionObs = this.cellCollection.valueChanges();
   }

  ngOnInit() {}

  clickedCellHandler(index: number){
    if(this.isConfirmed || this.itemList.length>=6){      
      return
    }
    this.disableAllItemButton=true;
    this.createItem(index);
  }

  checkIfCellIsSelectedByIndexAndSetColourByType(index: number, type: number){
    return this.utilService.checkIfCellIsSelectedByIndexAndSetColourByType(this.selectedCellList,index,type);
  }

  setType(type: number){
    this.selectedType = type;
  }

  isDisabled(type:number){
    return this.disableAllItemButton || this.itemList.some(e=>e.type==type);
  }

  removeItem(type:number){
    this.completed = false;
    console.log("remove");
    this.removeSelectedItemAndAllCellsByType(type);
    this.setNewSelectedType();
  }

  confirm(){
    console.log("confirm");
    console.log(this.selectedCellList);
    this.insertCellListOnFirebase();
  }

  launchAttack(index: number){
   // var isHit = this.utilService.isOppositeCellHit(index,this.oppositeCellList);
   this.firebaseService.attack();
  }

  checkIfCellIsHit(index: number, type: number){
    return this.utilService.getHitCellType(index,type,this.oppositeCellList);
  }

  //private
  private isItemComplete(){
    return this.item.neighborList.length>=this.selectedType;
  }

  private isCellAlreadySelected(index: number){
    return this.selectedCellList.some(c => c.index === index);
  }

  private addToItemListAndResetItemObject(){
    this.itemList.push(this.item);
    this.resetItemObject();

    if(this.itemList.length==6){
      console.log("completo");
      this.completed = true;
    }
    
  }

  private resetItemObject(){
    this.item = {
      type: null,
      neighborList: []
    }
  }

  private setNewSelectedType(){
    if(this.selectedCellList.some(e => e.type==this.selectedType) && this.itemList.length<6){
      this.selectedType = this.selectedType == 6 ? 1 : this.selectedType+1;
      this.setNewSelectedType();
    }
  }

  private removeSelectedItemAndAllCellsByType(type: number){
    this.itemList = this.itemList.filter(e => e.type!=type);
    this.selectedCellList = this.selectedCellList.filter(e=>e.type!=type); 

  }

  private addCellToSelectedCellList(cell: SelectedCell){
    this.selectedCellList.push(cell);
    this.selectedCellListFirebase.cellList.push(cell);
  }

  private createItem(index: number){
    
    if(this.isCellAlreadySelected(index)){
      console.log("già selezionato: "+index);
      return;
    }

    if(this.utilService.isSelectedCellTooFarFromItem(index, this.item)){
      console.log("too far!!");
      return
    } 
    
    var neighbor = this.utilService.getNeighborhoodFromIndex(index);
    this.item.type = this.selectedType;
    this.item.neighborList.push(neighbor);    
    this.addCellToSelectedCellList({index: index, type: this.selectedType, hit: false}); 

    if(this.isItemComplete()){
      console.log("item completato: "+this.item.type);
      this.addToItemListAndResetItemObject();
      this.setNewSelectedType();
      this.disableAllItemButton=false;
    }
         
  }

  //FIREBASE

  insertCellListOnFirebase(){
    var obj = {player: 1, username: "user", cellList: this.selectedCellList};
    var docId = new Date().getTime().toString();
    this.cellCollection.doc(docId+"/players/"+"username").set(obj);
  }

  async searchMatch(){
    var res = await this.firebaseService.checkIfDocExist("1548787570824","username");
    var r = await this.firebaseService.getAllMatchIDsByUser("username");
    console.log("match from battlefield", r)
  }

  
}
