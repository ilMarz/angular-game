import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface selectedCellListFirebaseInterface { 
  cellList: Object[]
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {

  constructor(afs: AngularFirestore) {
    this.cellCollection = afs.collection<selectedCellListFirebaseInterface>('match');
    this.setDocId(new Date().getTime().toString());
   }

  private cellCollection: AngularFirestoreCollection<selectedCellListFirebaseInterface>;
  private docId: string;
  private player: string = "player1";


  //public methods
  insertPlayerOneCellListAndReturnPromise(selectedCellListFirebase: selectedCellListFirebaseInterface){
      
    //var listener = this.getListenerObjectOnCollection("player2");    
    this.setMatchState("init");
    return this.cellCollection.doc(this.docId).collection(this.player).add(selectedCellListFirebase);
  }

  insertPlayerTwoCellListAndReturnPromise(selectedCellListFirebase: selectedCellListFirebaseInterface){
    this.player = "player2";
    this.setMatchState("loading");
    return this.insertPlayerOneCellListAndReturnPromise(selectedCellListFirebase);
  }


  setDocId(docId: string){
    this.docId = docId;
  }

  getListenerObjectOnCollection(collectionName: string){
    if(this.docId==null){
      return null
    }
    return this.cellCollection.doc(this.docId).collection(collectionName).valueChanges();
  }

  //private methods  

  private setMatchState(state: string){
    if(this.docId==null){
      return null
    }
    this.cellCollection.doc(this.docId).set({date: new Date(), status: "init"});
  }

 /* subscribeToListener(listener: Observable<DocumentData[]>){
    listener.subscribe((q)=>{

      if(q.length>0){
        //this.oppositeCellList = q[0].cellList;
      }
    })
  }*/
}
