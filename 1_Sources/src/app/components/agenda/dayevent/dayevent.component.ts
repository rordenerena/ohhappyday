import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Component, OnInit, Input, EventEmitter, Output, forwardRef } from '@angular/core';
import { EventDay } from 'src/app/services/database/db.entities';

@Component({
  selector: 'app-dayevent',
  templateUrl: './dayevent.component.html',
  styleUrls: ['./dayevent.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DayeventComponent),
      multi: true
    }
  ]
})
export class DayeventComponent implements OnInit, ControlValueAccessor {

  propagateChange = (_: any) => {};
  onTouch = () => { }
  @Input() disabled: Boolean = false;
  @Input() value: EventDay = new EventDay();
  @Input() viewer: boolean = false;

  constructor() { }

  ngOnInit() {}

  setTitle(event) {
    this.value.title = event.detail.value;
    this.update();
  }
  
  setDescription(event) {
    this.value.description = event.detail.value;
    this.update();
  }

  writeValue(value: any): void {
    if(value !== undefined) {
      this.value = value;
    }
  }
  
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  update() {
    this.onTouch();
    this.propagateChange(this.value);
  }

  showViewer() {
    if(this.viewer) {
      if(this.value.title === "" && this.value.description === "") {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }


}
