import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonRippleEffect,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ItemModel } from 'src/app/core/models/item.model';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
  imports: [IonRippleEffect, TranslatePipe, FormsModule],
})
export class AddItemComponent {
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private translateService = inject(TranslateService);
  name = '';
  price!: number;

  onDismiss(): void {
    this.modalController.dismiss();
  }

  onDone(): void {
    if (!this.name || !this.price) {
      this.presentToast(
        this.translateService.instant('ERROR.COMPLETE_FIELD'),
        'danger'
      );
      return;
    }
    const item: ItemModel = { name: this.name, price: this.price };
    this.modalController.dismiss(item);
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}
