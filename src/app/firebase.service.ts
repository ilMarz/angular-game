import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface selectedCellListFirebaseInterface { 
  cellList: Object[]
}

export interface credentialListFirebaseInterface { 
  credentialList: Object[]
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {

  constructor(afs: AngularFirestore) {
    this.cellCollection = afs.collection<selectedCellListFirebaseInterface>('match');
    this.credential = afs.collection<credentialListFirebaseInterface>('user');
    this.setDocId(new Date().getTime().toString());
   }

  private cellCollection: AngularFirestoreCollection<selectedCellListFirebaseInterface>;
  private docId: string;
  private player: string = "player1";
  private credential: AngularFirestoreCollection<credentialListFirebaseInterface>;


  //public methods
  insertPlayerOneCellListAndReturnPromise(username: string, selectedCellListFirebase: selectedCellListFirebaseInterface){
      
    //var listener = this.getListenerObjectOnCollection("player2");    
    this.setMatchState("init");
    return this.cellCollection.doc(this.docId).collection(this.player).doc(username).set(selectedCellListFirebase);
  }

  insertPlayerTwoCellListAndReturnPromise(username: string, selectedCellListFirebase: selectedCellListFirebaseInterface){
    this.player = "player2";
    this.setMatchState("loading");
    return this.insertPlayerOneCellListAndReturnPromise(username, selectedCellListFirebase);
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

  checkIfDocExist(docId: string, username: string) {
    var docPath = docId+"/players/"+username;

    return new Promise<Object>(resolve => {

      this.cellCollection.doc(docPath).ref.get().then(data=>{
        console.log("exist from service");
        resolve(data)
      })
    });
  } 

  getAllMatchIDsByUser(username: string) {
    
    return new Promise<Object>(resolve => {

      this.cellCollection.get().forEach(data=>{
        data.forEach(match=>{
          this.cellCollection.doc(match.id+"/players/"+username).ref.get().then(data=>{
            //console.log("match exist");
            if(data.exists){
              resolve(match.id)
            }
          })
        })
        //resolve(data)
      })
    });
  } 

  checkCredential(username: string, password: string) {

    return new Promise<Object>(resolve => {

      this.credential.ref.where("credentialList", "array-contains", {username: username, password: password}).get().then(data=>{
        console.log("user exist");
        resolve(!data.empty)
      })
    });
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
