import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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
  
  colNumber = 11;
  cellNumber = this.colNumber*this.colNumber;
  range = Array.from(Array(this.cellNumber).keys());
  indexOffset = this.colNumber;
  disableAllItemButton = false;
  isConfirmed=false;
  isExistingMatch = false;
  errorMessage=null;

  item = {index: null,
          type: null,
          neighborList: []
        };
  itemList = new Array();
  selectedCellList = new Array();
  selectedCellListFirebase: selectedCellListFirebaseInterface = { cellList: []
                                                                };

  selectedType = 1;

  completed = false;

  afs: AngularFirestore;

  constructor(afs: AngularFirestore) {
    this.cellCollection = afs.collection<selectedCellListFirebaseInterface>('match');
    this.cellCollectionObs = this.cellCollection.valueChanges();
    this.afs = afs;
   }

  ngOnInit() {
    
  }

  addToSelectedCellList(index: number){
    if(this.isConfirmed || this.itemList.length>=6){      
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
      this.selectedCellList.push({index: index, type: this.selectedType, hit: false});
      this.selectedCellListFirebase.cellList.push({index: index, type: this.selectedType, hit: false});
    }      

    if(this.item.neighborList.length>=this.selectedType){
      console.log("item completato: "+this.item.type);
      this.addToItemListAndResetItemObject();
      this.disableAllItemButton=false;
      this.setNewSelectedType();
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
    if(this.itemList.length==6){
      console.log("completo");
      this.completed = true;
    }
    
  }

  setNewSelectedType(){
    if(this.selectedCellList.some(e => e.type==this.selectedType) && this.itemList.length<6){
      this.selectedType = this.selectedType == 6 ? 1 : this.selectedType+1;
      this.setNewSelectedType();
    }
  }

  removeItem(type:number){
    this.completed = false;
    console.log("remove")
    this.itemList = this.itemList.filter(e => e.type!=type);
    this.selectedCellList = this.selectedCellList.filter(e=>e.type!=type); 
    this.setNewSelectedType();
  }

  confirm(){
    console.log("confirm");
    console.log(this.selectedCellList);
    this.insertOnFirebase();
  }

  //FIREBASE

  insertOnFirebase(){
    /*var resFromFB = this.cellCollection.add(this.selectedCellListFirebase);
    resFromFB.then((data) => {
      console.log("result: ",data);
      this.isConfirmed=true;
    }).catch(error=>{
      console.log("error on insert on fb: ", error)
    })*/

    this.cellCollection.doc("TKyWnu8oWXltvCRpT3AX").ref.collection("player1").add(this.selectedCellListFirebase)
    .then((data) => {
      console.log("result: ",data);
      this.isConfirmed=true;
    })
    .catch((error) => {
      console.log("error on insert on fb: ", error)
    })
  }

  searchMatch(){
      this.cellCollection.doc(this.matchId).ref.get().then((doc) => {
        if (doc.exists) {
            //this.selectedCellList = doc.data().player.cellList;
            //this.isConfirmed = true;
            this.isExistingMatch = true;
            this.errorMessage=null;
        } else {
            console.log("No such document!");
            this.errorMessage="Match not found!";
        }
      }).catch(function(error) {
          console.log("Error getting document:", error);
          this.errorMessage="Connection error!";
      });


  }
}
