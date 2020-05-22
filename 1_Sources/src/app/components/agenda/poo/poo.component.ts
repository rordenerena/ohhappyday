import { TranslateService } from '@ngx-translate/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Poo } from '../../../services/database/db.entities';
import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';

@Component({
  selector: 'app-poo',
  templateUrl: './poo.component.html',
  styleUrls: ['./poo.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PooComponent),
      multi: true
    }
  ]
})
export class PooComponent implements OnInit, ControlValueAccessor {

  propagateChange = (_: any) => { };
  onTouch = () => { }
  @Input() disabled: Boolean = false;
  @Input() value: Poo = new Poo();
  @Input() viewer: boolean = false;
  @Output('onChange') onChange: EventEmitter<Poo> = new EventEmitter<Poo>();
  nonav: any;

  constructor(private translate: TranslateService) { }

  ngOnInit() { }

  setPooTimes($event) {
    this.value.times = $event.detail.value;
    this.update();
    if (this.nonav !== undefined) {
      clearTimeout(this.nonav);
    }
    window.localStorage.setItem('nonav', "true");
    this.nonav = setTimeout(() => {
      window.localStorage.setItem('nonav', "false");
    }, 500);
  }

  setPooType($event) {
    this.value.type = $event.detail.value;
    this.update();
  }

  update() {
    this.onTouch();
    this.propagateChange(this.value);
    this.onChange.emit(this.value);
  }

  writeValue(value: any): void {
    if (value !== undefined) {
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

  getValueType() {
    let type = (`${this.value.type}` !== "null" && `${this.value.type}` !== "" && `${this.value.type}` !== "0") ? this.value.type : '';
    return this.translate.instant(`poo.${type}`);
  }

  showPooViewer() {

    if (this.viewer) {
      if (this.value.times === 0 && this.getValueType() === "") {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

}
