import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  ToastController,
  IonRippleEffect,
  LoadingController,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { from, of, switchMap, catchError, take } from 'rxjs';
import { LocationModel } from 'src/app/core/models/location.model';
import { CollectionEnum } from 'src/app/core/enums/collection.enum';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss'],
  standalone: true,
  imports: [TranslatePipe, IonRippleEffect, FormsModule],
})
export class AddLocationComponent {
  private modalController = inject(ModalController);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private translateService = inject(TranslateService);

  location: string = '';
  address: string = '';

  onDismiss(): void {
    this.modalController.dismiss();
  }

  onDone(): void {
    from(this.loadingController.create())
      .pipe(
        switchMap((loading) => {
          loading.present();

          return user(this.auth).pipe(
            take(1),
            switchMap((currentUser) => {
              if (!currentUser) {
                loading.dismiss();
                return of(null);
              }

              const locationData: LocationModel = {
                uid: currentUser.uid,
                location: this.location.trim(),
                address: this.address.trim(),
                createdAt: new Date(),
              };

              const collectionRef = collection(
                this.firestore,
                CollectionEnum.LOCATIONS
              );
              return from(addDoc(collectionRef, locationData)).pipe(
                switchMap(() => {
                  this.presentToast(
                    this.translateService.instant('SUCCESS.LOCATION'),
                    'success'
                  );
                  this.modalController.dismiss(locationData);
                  return from(loading.dismiss());
                })
              );
            }),
            catchError((error) => {
              this.presentToast(error.message, 'danger');
              return from(loading.dismiss());
            })
          );
        })
      )
      .subscribe();
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
