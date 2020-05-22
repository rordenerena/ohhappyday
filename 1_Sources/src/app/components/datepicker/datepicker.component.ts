import { TranslateService } from '@ngx-translate/core';
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

  constructor(private translate: TranslateService) { 
      let lang = this.translate.getBrowserLang();
      this.datePickerObj.momentLocale = lang;
      this.datePickerObj.monthsList = [
        this.translate.instant('dp.january'),
        this.translate.instant('dp.february'),
        this.translate.instant('dp.march'),
        this.translate.instant('dp.april'),
        this.translate.instant('dp.may'),
        this.translate.instant('dp.june'),
        this.translate.instant('dp.july'),
        this.translate.instant('dp.august'),
        this.translate.instant('dp.september'),
        this.translate.instant('dp.october'),
        this.translate.instant('dp.november'),
        this.translate.instant('dp.december')
      ]
      this.datePickerObj.weekList = [
        this.translate.instant('dp.monday'),
        this.translate.instant('dp.tuesday'),
        this.translate.instant('dp.wednesday'),
        this.translate.instant('dp.thursday'),
        this.translate.instant('dp.friday'),
        this.translate.instant('dp.saturday'),
        this.translate.instant('dp.sunday')
      ]
      this.datePickerObj.closeLabel = this.translate.instant('dialogs.close');
      this.datePickerObj.mondayFirst = this.translate.instant('dp.monday-first') === "true";
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
