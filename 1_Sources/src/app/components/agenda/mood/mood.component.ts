import { MoodStatus } from '../../../services/database/db.entities';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Component, OnInit, Input, forwardRef } from '@angular/core';

@Component({
  selector: 'app-mood',
  templateUrl: './mood.component.html',
  styleUrls: ['./mood.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoodComponent),
      multi: true
    }
  ]
})
export class MoodComponent implements OnInit, ControlValueAccessor {

  propagateChange = (_: any) => {};
  onTouch = () => { }
  @Input() value: MoodStatus = null;
  @Input() disabled: Boolean = false;
  @Input() viewer: boolean = false;

  constructor() { }

  ngOnInit() {}

  update() {
    this.onTouch();
    this.propagateChange(this.value);
  }

  moodSelect(value: any) {
    if(this.value === value) {
      this.value = null;
    } else {
      this.value = value;
    }
    
    this.update();
  }

  getMoodViewerClass(value: any) {
    if(value) {
      let cl = value.replace('@', "o");
      console.log(`Class '${cl}' for mood ${value}`);
      return cl;
    } else {
      return "";
    }
  }

  getMoodClass(value: any) {
    if(this.value === value) {
      let cl = value.replace('@', "o");
      console.log(`Class '${cl}' for mood ${value}`);
      return `mood-selected ${cl}`;
    } else {
      return "";
    }
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

  showViewer() {
    if(this.viewer) {
      return `${this.value}` !== 'null' && `${this.value}` !== '';
    } else {
      return false;
    }
  }

}
