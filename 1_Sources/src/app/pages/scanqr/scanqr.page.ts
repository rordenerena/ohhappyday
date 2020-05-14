import { ChildInfoFollower } from '../../services/database/db.entities';
import { PairingService } from './../../services/comm/pairing.service';
import { PlatformService } from './../../services/platform.service';
import { ToastService } from './../../services/toast.service';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { PopoverController } from '@ionic/angular';
import { DbService } from '../../services/database/db.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-scanqr',
  templateUrl: './scanqr.page.html',
  styleUrls: ['./scanqr.page.scss'],
})
export class ScanqrPage implements OnInit {

  constructor(private router: Router,
    private db: DbService,
    public popoverController: PopoverController,
    private qrScanner: QRScanner,
    public toastService: ToastService,
    private pairingService: PairingService) { }

  ngOnInit() {
    this.scan();
  }
  
  /**
   * Configure and open the camera viewer
   */
  scan() {
    // this.router.navigate([data.op], { queryParams: { status: 'edit' } });
    console.log("Vamos a añadir un hijo por QR");
    // Optionally request the permission early
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // camera permission was granted
          console.log("persmission granted");
          this.qrScanner.show();

          // start scanning
          const scanSub = this.qrScanner.scan().subscribe((text: string) => {
            console.log("Código escaneado!");
            this.closeCamera();
            scanSub.unsubscribe(); // stop scanning
            this.manageQr(text);
          });

          this.qrScanner.show();

        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
          console.log("persmission denied");
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
          console.log("persmission denied at the moment");
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  /**
   * Manage the QR Code scanned:
   * - Validate it
   * - Save the information
   * - Navigate to the correct page
   * @param text 
   */
  async manageQr(text: string) {
    let child;

    try {
      let json = JSON.parse(text);
      console.log("JSON: ", json);
      child = await this.pairingService.registerChild(json);
      console.log("Hijo registrado", child);
      this.pairingService.response(await this.db.getFollower(), child);
      this.toastService.toast("Hijo registrado");
      this.goToStudents(child);
    } catch (err) {
      this.toastService.toast(err);
    }
  }

  /**
   * Auxiliary method for the UI in order to close 
   * camera viewer
   */
  closeCamera() {
    this.qrScanner.hide(); // hide camera preview
    // this.qrScanner.destroy();
  }

  /**
   * Navigate to the viewer for a specific child.
   * @param child 
   */
  goToStudents(child: ChildInfoFollower = null) {
    this.closeCamera();
    let qp = {};
    if(child) {
      qp = {queryParams: {child: child.index}};
    }
    this.router.navigate(['/viewer'], qp);
  }
}
