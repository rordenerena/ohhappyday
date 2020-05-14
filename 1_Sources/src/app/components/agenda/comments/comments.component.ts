import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommentsComponent),
      multi: true
    }
  ]
})
export class CommentsComponent implements OnInit, ControlValueAccessor {

  propagateChange = (_: any) => {};
  onTouch = () => { }
  @Input() disabled: Boolean = false;
  @Input() value: string = "";
  @Input() viewer: boolean = false;
  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {}

  update() {
    this.onTouch();
    this.propagateChange(this.value);
  }

  setValue(event) {
    this.value = event.detail.value;
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

}
