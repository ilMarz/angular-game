import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

export interface selectedCellListFirebaseInterface { 
  cellList: Object[]
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {

  constructor(afs: AngularFirestore) {
    this.cellCollection = afs.collection<selectedCellListFirebaseInterface>('match');
   }

  private cellCollection: AngularFirestoreCollection<selectedCellListFirebaseInterface>;
  private docId: string;




  //public methods
  insertPlayerOneCellList(selectedCellListFirebase: selectedCellListFirebaseInterface){
    var player = "player1";
    this.docId = new Date().getTime().toString();
      
    var listener = this.getListenerObjectByIdAndCollection(docId,"player2");
    this.cellCollection.doc(docId).set({date: new Date(), status: "init"});
    
    this.cellCollection.doc(docId).collection(player).add(selectedCellListFirebase)
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



  //private methods

  getListenerObjectByIdAndCollection(id: string, collectionName: string){
    return this.cellCollection.doc(id).collection(collectionName).valueChanges();
  }

  setMatchState(state: string){
    this.cellCollection.doc(docId).set({date: new Date(), status: "init"});
  }
}
