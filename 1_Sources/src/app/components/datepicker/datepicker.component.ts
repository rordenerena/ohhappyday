import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import moment from 'moment';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    }
  ]
})
export class DatepickerComponent implements OnInit, ControlValueAccessor {

  propagateChange = (_: any) => {};
  onTouch = () => { }
  @Input() disabled: Boolean = false;
  @Input() value: string = moment().format("DD/MM/YYYY");
  @Input() arrows: boolean = true;
  @Input() align: string = "center";
  @Input() viewer: boolean = false;
  @Output() onChange : EventEmitter<string> = new EventEmitter<string>();


  months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  // https://www.logisticinfotech.com/blog/ionic4-datepicker-component/
  datePickerObj: any = {
    inputDate: this.value, // default new Date()
    fromDate: new Date(moment().add(-4, 'years').format("YYYY-MM-DD")),
    showTodayButton: false, // default true
    closeOnSelect: true, // default false
    mondayFirst: true, // default false
    monthsList: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    weeksList: ["D" ,"L", "M", "X", "J", "V", "S"],
    dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
    clearButton : false , // default true
    momentLocale: 'es-ES', // Default 'en-US'
    yearInAscending: true, // Default false
    isSundayHighlighted : { 
     fontColor: '#ee88bf' // Default null
    } // Default {}
  };

  constructor() { 
    
  }

  writeValue(value: any): void {
    if(value !== undefined) {
      this.value = value;
    }
  }

  changeDp(event) {
    this.value = event.detail.value;
    this.update();
  }

  update() {
    this.onTouch();
    this.propagateChange(this.value);
    this.onChange.emit(this.value);
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

  ngOnInit() {
    // console.log("Arrows: ", this.arrows);
  }

  add() {
    this.manipulate(1);
  }

  rest() {
    this.manipulate(-1);
  }

  manipulate(value: number) {
    let a = this.value.split("/");
    let f = moment(new Date(`${a[2]}/${a[1]}/${a[0]}`));
    f.add(value, 'days');
    this.value = f.format("DD/MM/YYYY");
  }

}
