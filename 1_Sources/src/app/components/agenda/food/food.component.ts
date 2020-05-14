import { ToastService } from './../../../services/toast.service';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Food } from '../../../services/database/db.entities';
import { Component, OnInit, Input, forwardRef } from '@angular/core';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FoodComponent),
      multi: true
    }
  ]
})
export class FoodComponent implements OnInit, ControlValueAccessor {

  propagateChange = (_: any) => {};
  onTouch = () => { }
  @Input() disabled: Boolean = false;
  @Input() value: Food = new Food();
  @Input() viewer: boolean = false;

  constructor(public toastService: ToastService) { }

  ngOnInit() {}

  async toast(msg: string) {
    this.toastService.toast(msg);
  }

  update() {
    this.onTouch();
    this.propagateChange(this.value);
  }

  setDesayuno(event) {
    this.value.breakfast = event;
    this.update();
  }

  setComida(event) {
    this.value.meal = event;
    this.update();
  }

  setIngesta(event) {
    this.value.ingest = event;
    this.update();
  }

  writeValue(value: Food): void {
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

  show(qty: any): boolean {
    return qty!=null;
  }

}
