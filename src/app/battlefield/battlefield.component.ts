import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UtilService, SelectedCellList, Item, Neighbor } from '../util.service';

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

  disableAllItemButton = false;
  isConfirmed=false;
  isExistingMatch = false;
  errorMessage=null;
  matchReady = false;
  matchState=null;
  listener = null;
  oppositeCellList = [];

  item: Item;
  itemList: Item[];
  selectedCellList: SelectedCellList[]; 
  selectedCellListFirebase: selectedCellListFirebaseInterface = { cellList: [] };

  selectedType = 1;

  completed = false;

  constructor(private afs: AngularFirestore, private utilService: UtilService) {
    this.cellCollection = afs.collection<selectedCellListFirebaseInterface>('match');
    this.cellCollectionObs = this.cellCollection.valueChanges();
   }

  ngOnInit() {}

  addToSelectedCellList(index: number){
    if(this.isConfirmed || this.itemList.length>=6){      
      return
    }
    this.disableAllItemButton=true;
    this.createItem(index);
  }

  checkIfCellIsSelectedByIndexAndSetColourByType(index: number, type: number){
    return this.utilService.checkIfCellIsSelectedByIndexAndSetColourByType(this.selectedCellList,index,type);
  }

  createItem(index: number){
    
    if(this.isCellSelectedByIndex(index)){
      console.log("già selezionato: "+index);
      return;
    }

    if(this.isItemComplete()){
      console.log("item completato: "+this.item.type);
      this.addToItemListAndResetItemObject();
      this.disableAllItemButton=false;
      this.setNewSelectedType();
      return;
    }
      
    if(this.utilService.checkIfIsAValidCellToSelect(this.item, index)){
      var neighbor = this.utilService.getNeighborhoodFromIndex(index);
      this.item = this.utilService.createItemObject(index,this.selectedType,neighbor);

      this.selectedCellList.push({index: index, type: this.selectedType, hit: false});
      this.selectedCellListFirebase.cellList.push({index: index, type: this.selectedType, hit: false});
    }      
         
  }

  setType(type: number){
    this.selectedType = type;
  }

  isDisabled(type:number){
    return this.disableAllItemButton || this.itemList.some(e=>e.type==type);
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

  launchAttack(index: number){
    var attackedCell = this.oppositeCellList.find(e=>e.index==index);
    if(attackedCell!=undefined){
      console.log("colpito")
      attackedCell.hit=true;
    }
    else {
      console.log("vuoto")
    }
  }

  checkIfCellIsHit(index: number, type: number){
    var cellByIndex = this.oppositeCellList.find(cell => cell.index === index && cell.hit === true);
    return cellByIndex!=undefined ? cellByIndex.type==type : false;
  }

  //private
  private isItemComplete(){
    return this.item.neighborList.length>=this.selectedType;
  }

  private isCellSelectedByIndex(index: number){
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
    this.item = {index: null,
      type: null,
      neighborList: []
    }
  }

  //FIREBASE

  insertOnFirebase(){
    var player = "player1";
    var docId = new Date().getTime().toString();

    if(this.isExistingMatch){
      player = "player2";
      this.listener = this.cellCollection.doc(docId).collection("player1").valueChanges();
      docId = this.matchId;
      var resset = this.cellCollection.doc(docId).set({date: new Date(), status: "ready"});
      console.log(resset);
    }
    else {
      this.listener = this.cellCollection.doc(docId).collection("player2").valueChanges();
      var resset = this.cellCollection.doc(docId).set({date: new Date(), status: "init"});
      console.log(resset);
    }
    
    this.cellCollection.doc(docId).collection(player).add(this.selectedCellListFirebase)
    .then((data) => {
      console.log("result: ",data);
      this.isConfirmed=true;
      if(player=="player2"){
        this.matchReady = true;
        this.matchState = "FIGHT!"
      }
      this.listener.subscribe((q)=>{
        console.log("changed", q);
        if(q.length>0){
          this.matchReady = true;
          this.matchState = "FIGHT!";
          this.isExistingMatch = true;
          this.matchId = docId;
          this.oppositeCellList = q[0].cellList;
        }
      })
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
            this.matchState="Match loading...";
            this.selectedCellList = [];
            this.isConfirmed=false;
            this.disableAllItemButton = false;
            this.resetItemObject();
            this.itemList = new Array();
            this.cellCollection.doc(this.matchId).set({date: new Date(), status: "complete"});
            
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
