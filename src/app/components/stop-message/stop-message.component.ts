import { Component, inject, Input, OnInit } from '@angular/core';
import { ItemModel } from 'src/app/core/models/item.model';
import { TranslatePipe } from '@ngx-translate/core';
import { IonRippleEffect, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-stop-message',
  templateUrl: './stop-message.component.html',
  styleUrls: ['./stop-message.component.scss'],
  imports: [TranslatePipe, IonRippleEffect],
})
export class StopMessageComponent {
  private modalController = inject(ModalController);

  @Input() totalCounter!: number;
  @Input() totalPrice!: number;
  @Input() consumedItems: ItemModel[] = [];

  onDismiss(): void {
    this.modalController.dismiss();
  }
}
