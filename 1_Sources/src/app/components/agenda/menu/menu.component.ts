import { PopoverController, NavParams } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  items = [];

  constructor(private pop: PopoverController, navParams: NavParams) { 
    let keys = Object.keys(navParams.data);

    keys.forEach(element => {
      if(element!=='popover') {
        this.items.push({
          key: element,
          value: navParams.get(element)
        })
      }
      
    });

    console.log(this.items);
  }

  ngOnInit() {}

  close(option: string) {
    this.pop.dismiss({op: option});
  }

}