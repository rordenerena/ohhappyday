import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Tomorrow } from '../../../services/database/db.entities';
import { Component, OnInit, forwardRef, Input } from '@angular/core';

@Component({
  selector: 'app-tomorrow',
  templateUrl: './tomorrow.component.html',
  styleUrls: ['./tomorrow.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TomorrowComponent),
      multi: true
    }
  ]
})
export class TomorrowComponent implements OnInit, ControlValueAccessor {

  propagateChange = (_: any) => {};
  onTouch = () => { }
  @Input() disabled: Boolean = false;
  @Input() value: Tomorrow = new Tomorrow();
  @Input() viewer: boolean = false;

  constructor() { }

  ngOnInit() {}

  tomorrowSel(val: number) {
    if(val===0) {
      this.value.nappy = !this.value.nappy;
    } else if (val === 1) {
      this.value.wipers = !this.value.wipers;
    } else if (val === 2) {
      this.value.clothes = !this.value.clothes;
    } else if (val === 3) {
      this.value.water = !this.value.water;
    }
    this.update();
  }

  tomorrowClass(val: number) {
    if(val===0) {
      return this.value.nappy ? "tomorrowSel": "";
    } else if (val === 1) {
      return this.value.wipers ? "tomorrowSel": "";
    } else if (val === 2) {
      return this.value.clothes ? "tomorrowSel": "";
    } else if (val === 3) {
      return this.value.water ? "tomorrowSel": "";
    }
  }

  update() {
    this.onTouch();
    this.propagateChange(this.value);
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
