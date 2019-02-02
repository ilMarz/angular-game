import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import {SelectedCell} from './util.service'

export interface credentialListFirebaseInterface { 
  credentialList: Object[]
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {

  constructor(private afs: AngularFirestore) {
    this.cellCollection = afs.collection('match');
    this.credential = afs.collection<credentialListFirebaseInterface>('user');
   }

  private cellCollection: AngularFirestoreCollection;
  private credential: AngularFirestoreCollection<credentialListFirebaseInterface>;

  getCellCollection():AngularFirestoreCollection{
    return this.cellCollection;
  }


  //public methods
  insertCellList(documentID: string, username: string, cellList: SelectedCell[]){
   var player = 1;
   var date = new Date();

   if(documentID==null){
      documentID = date.getTime().toString();
      this.cellCollection.doc(documentID).set({date: date, player: [username, null], status: "init"})
      this.cellCollection.doc(documentID).collection("players").doc(username).set({cellList: cellList, player: player, username: username})
   }
   else {
      player = 2;
      this.cellCollection.doc(documentID).ref.get().then(data=>{
        var matchDate = data.data().date;
        var player1Username = data.data().player[0];
        var playerArray = [player1Username,username];

        this.cellCollection.doc(documentID).set({date: matchDate, player: playerArray, status: "ready"});
        this.cellCollection.doc(documentID).collection("players").doc(username).set({cellList: cellList, player: player, username: username});
      })
   }    
   return documentID;  
  }

  getCellListByUsername(docId: string, username: string) {
    var docPath = docId+"/players/"+username;

    return new Promise<Object>((resolve,reject) => {

      this.cellCollection.doc(docPath).ref.get().then(data=>{
        resolve(data)
      })
      .catch(error=>{
        reject(error)
      })
    });
  }  

  checkCredential(username: string, password: string) {

    return new Promise<Object>(resolve => {

      this.credential.ref.where("credentialList", "array-contains", {username: username, password: password}).get().then(data=>{
        resolve(!data.empty)
      })
    });
  } 

  insertUser(username: string, password: string){
    return new Promise<Object>(resolve => {

      this.credential.doc("credentials").ref.get().then(data=>{
        console.log(data.data())
        var credentialList = data.data().credentialList;
        var obj = {credentialList: []};
        credentialList.push({username: username, password: password});
        obj.credentialList = credentialList;
        this.credential.doc("credentials").set(obj);
        resolve();
      })
    });
  }

  //private methods  

 /* subscribeToListener(listener: Observable<DocumentData[]>){
    listener.subscribe((q)=>{

      if(q.length>0){
        //this.oppositeCellList = q[0].cellList;
      }
    })
  }*/
}
