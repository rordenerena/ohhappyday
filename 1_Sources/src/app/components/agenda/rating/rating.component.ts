import { RatingVal } from './../../../services/database/db.entities';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {

  @Input() value: RatingVal = null;
  @Input() viewer: boolean = false;
  @Output() onChange: EventEmitter<RatingVal> = new EventEmitter<RatingVal>();
  maxRatings = [];

  constructor() { }

  getClass(item: any) {
    return (item == this.value) ? `selected-${item}` : "unselected";
  }

  setRate(item: any) {
    if (item != null) {
      if (this.value === item) {
        this.value = null;
      } else {
        this.value = item;
      }
      this.onChange.emit(this.value);
    }
  }

  show(val: any) {
    if (this.viewer) {
      return this.value == val;
    } else {
      return true;
    }
  }

  ngOnInit() { }

}
