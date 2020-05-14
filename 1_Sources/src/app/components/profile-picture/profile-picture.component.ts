import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Plugins, CameraResultType, CameraSource, CameraDirection } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';

const { Camera } = Plugins;

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProfilePictureComponent),
      multi: true
    }
  ]
})
export class ProfilePictureComponent implements OnInit, ControlValueAccessor {

  // Custom formControl: https://blog.thoughtram.io/angular/2016/07/27/custom-form-controls-in-angular-2.html

  propagateChange = (_: any) => {};
  onTouch = () => { }
  @Input() disabled: Boolean = false;
  @Input() value: any = "assets/default-picture.svg";
  isBase64: Boolean = false;
  
  constructor(public actionSheetController: ActionSheetController, public san: DomSanitizer) { 
  }

  ngOnInit() {
    
  }

  async pickImage(sourceType: CameraSource) {
    // Argument options: https://capacitor.ionicframework.com/docs/apis/camera#type-304
    // Result: https://capacitor.ionicframework.com/docs/apis/camera#type-322
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: this.isBase64 ? CameraResultType.Base64 : CameraResultType.Uri,
      source: sourceType,
      direction: CameraDirection.Front,
      width: 600
    });

    console.log('image: ', image);

    if(this.isBase64) {
      this.value = `data:image/${image.format};base64, ${image.base64String}`;
    } else {
      this.value = image.webPath;
    }
    
    this.onTouch();
    this.propagateChange(this.value);
  }

  async selectImage() {
    if(!this.disabled) {
      const actionSheet = await this.actionSheetController.create({
        header: "Usar imagen desde",
        mode: "ios",
        buttons: [{
          text: 'Galería',
          handler: () => {
            this.pickImage(CameraSource.Photos);
          }
        },
        {
          text: 'Cámara',
          handler: () => {
            this.pickImage(CameraSource.Camera);
          }
        },
        {
          text: 'Cancelar',
          role: 'destructive'
        }
        ]
      });
      await actionSheet.present();
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
}
