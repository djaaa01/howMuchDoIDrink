import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonRippleEffect,
  ModalController,
  ToastController,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ItemModel } from 'src/app/core/models/item.model';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
  imports: [IonRippleEffect, TranslatePipe, FormsModule, IonCheckbox],
})
export class AddItemComponent implements OnInit {
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private translateService = inject(TranslateService);
  @Input() item?: ItemModel;
  name = '';
  price!: number;
  isRemove = false;

  async ngOnInit(): Promise<void> {
    if (this.item) {
      this.name = this.item.name;
      this.price = this.item.price;
    }
  }

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
    const item: ItemModel = {
      name: this.name,
      price: this.price,
      isRemove: this.isRemove,
    };
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
