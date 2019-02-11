import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-match-dialog',
  templateUrl: './match-dialog.component.html',
  styleUrls: ['./match-dialog.component.scss']
})
export class MatchDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<MatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {username: string}) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
