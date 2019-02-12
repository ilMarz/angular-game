import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import {SelectedCell} from '../_service/util.service'

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
  updateOppositeCellListAfterAttack(documentID: string, oppositeUsername: string, cellList: SelectedCell[], changeTurn: boolean){

     var oppositePlayer = 1;
      this.cellCollection.doc(documentID).ref.get().then(data=>{
        var matchDate = data.data().date;
        var player1Username = data.data().usernames.player1;
        var player2Username = data.data().usernames.player2;
        var playerOnTurn = data.data().onTurn;
        
        if(changeTurn){
          if(oppositeUsername==player1Username){
            playerOnTurn=player1Username
          }
          else {
            playerOnTurn=player2Username
            oppositePlayer=2
          }
        }

        this.cellCollection.doc(documentID).set({date: matchDate, usernames: {player1: player1Username, player2: player2Username}, status: "ready", onTurn:playerOnTurn});
        this.cellCollection.doc(documentID).collection("players").doc(oppositeUsername).set({cellList: cellList, player: oppositePlayer, username: oppositeUsername});
      })
   
   return documentID;  
  }

  insertCellList(documentID: string, username: string, cellList: SelectedCell[]){

    if(this.isNewMatch(documentID)){
       var returnedDocumentID = this.insertCellListInNewMatch(documentID,username,cellList)
       return returnedDocumentID
    }
    else {
      var oppositePlayer = 1;
       this.cellCollection.doc(documentID).ref.get().then(data=>{
         var matchDate = data.data().date;
         var player1Username = data.data().usernames.player1;
         var player2Username = data.data().usernames.player2;
         var playerOnTurn = data.data().onTurn;

         if(username!=player1Username){
           player2Username=username;
         }
         else {return}
         
         playerOnTurn=player1Username
         oppositePlayer=2
 
         this.cellCollection.doc(documentID).set({date: matchDate, usernames: {player1: player1Username, player2: username}, status: "ready", onTurn:playerOnTurn});
         this.cellCollection.doc(documentID).collection("players").doc(username).set({cellList: cellList, player: oppositePlayer, username: username});
       })
    }    
    return documentID;  
   }

   endMatch(documentID: string){

    this.cellCollection.doc(documentID).delete();  
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
  private insertCellListInNewMatch(documentID: string, username: string, cellList: SelectedCell[]){
    var date = new Date();
    documentID = date.getTime().toString();
    this.cellCollection.doc(documentID).set({date: date, usernames: {player1: username, player2: null}, status: "init", onTurn:null})
    this.cellCollection.doc(documentID).collection("players").doc(username).set({cellList: cellList, player: 1, username: username})
    return documentID
   }

   private isNewMatch(documentID: string){
     return documentID==null
   }

 /* subscribeToListener(listener: Observable<DocumentData[]>){
    listener.subscribe((q)=>{

      if(q.length>0){
        //this.oppositeCellList = q[0].cellList;
      }
    })
  }*/
}
