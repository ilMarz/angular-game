import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UtilService, SelectedCell, Item, Neighbor } from '../util.service';
import { FirebaseService } from '../firebase.service';
import { AuthService} from '../auth.service';
import { firestore } from 'firebase';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.scss']
})
export class BattlefieldComponent implements OnInit {

  private cellCollection: AngularFirestoreCollection;
  //private cellCollectionObs: Observable<selectedCellListFirebaseInterface[]>;

  @Input('matchId')
  matchId: string = null;
  
  range = this.utilService.getRange();
  colNumber = this.utilService.getColNumber();

  disableAllItemButton = false;
  isConfirmed=false;
  matchReady = false;
  matchLog = new Array();
  completed = false;

  item: Item = {type: null, neighborList: new Array()};
  itemList: Item[] = new Array();
  selectedCellList: SelectedCell[] = new Array(); 
  oppositeCellList: SelectedCell[] = new Array();

  openedMatchList = new Array();

  selectedType = 1;

  credentialMap = this.authService.getCredentialMapFromLocalStorage();
  username = this.credentialMap.username;
  oppositeUsername = null;
  documentId: string = null;

  constructor(private utilService: UtilService, 
    private firebaseService: FirebaseService,
    private authService : AuthService) {
    this.cellCollection = firebaseService.getCellCollection();
    //this.cellCollectionObs = this.cellCollection.valueChanges();
   }

  ngOnInit() {
    this.matchLog.push("No match init");
    this.searchMatch()
  }

  clickedCellHandler(index: number){
    if(this.isConfirmed || this.itemList.length>=6 || this.matchReady){      
      return
    }
    this.disableAllItemButton=true;
    this.createItem(index);
  }
  

  setType(type: number){
    this.selectedType = type;
  }

  isDisabled(type:number){
    return this.disableAllItemButton || this.itemList.some(e=>e.type==type);
  }

  confirm(){
    console.log("confirm");
    this.insertCellListOnFirebase();
  }

  launchAttack(index: number){
    this.utilService.setHitCellInOppositeCellList(index,this.documentId,this.oppositeUsername,this.oppositeCellList);
  }

  checkIfCellIsHit(index: number){
    return this.utilService.checkIfCellIsHitOnField(index,this.selectedCellList)
  }

  checkIfCellIsHitOnEnemyField(index: number, type: number){
    return this.utilService.checkIfCellIsHitOnEnemyField(index,this.oppositeCellList)
  }

  selectMatch(documentId: string){
    this.resetItemObject();
    this.documentId = documentId;
    this.checkMatchStatus();

    this.cellCollection.doc(documentId).collection("players").snapshotChanges().forEach(docList=>{
      var myDoc = docList.find(doc=> doc.payload.doc.data().username==this.username);
      var oppositeDoc = docList.find(doc=> doc.payload.doc.data().username!=this.username);
      if(myDoc!=undefined){
        this.selectedCellList = myDoc.payload.doc.data().cellList;
      }
      this.oppositeCellList = oppositeDoc.payload.doc.data().cellList;
      this.oppositeUsername = oppositeDoc.payload.doc.data().username;
      console.log(this.oppositeCellList)
      //console.log(docList)
      //this.selectedCellList = docList.payload.data().cellList;
    })

  }

  insertCellListOnFirebase(){
    this.documentId = this.firebaseService.insertCellList(this.documentId, this.username, this.selectedCellList);
    this.matchLog.push("Match " + this.documentId + " INIT");
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

  private addCellToSelectedCellList(cell: SelectedCell){
    this.selectedCellList.push(cell);
   // this.selectedCellListFirebase.cellList.push(cell);
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

  private checkMatchStatus(){
    if(this.documentId==null){
      return
    }
    var matchById = this.openedMatchList.find(m=> {return m.payload.doc.id==this.documentId});
    this.matchReady = matchById.payload.doc.data().status=="ready";
    if(this.matchReady){
      this.matchLog.push("match " + this.documentId + " " + matchById.payload.doc.data().status)
      this.matchLog.push(" player1: " + matchById.payload.doc.data().player[0] + " -- player2: " + matchById.payload.doc.data().player[1])
    }
  }

  private searchMatch(){

    this.cellCollection.snapshotChanges().forEach(docList=>{
      this.openedMatchList = docList;
      this.checkMatchStatus();
    })
  } 

  //FIREBASE
    /*
    use valueChanges() to get data and snapshotChanges() whenever you might need metadata, eg. deleting or updating document.
    
    this.cellCollectionObs.forEach(e=>{
    console.log(e)
  })*/
}
