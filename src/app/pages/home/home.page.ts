import { Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IonRippleEffect, ModalController } from '@ionic/angular/standalone';
import { AddLocationComponent } from 'src/app/components/add-location/add-location.component';
import {
  Firestore,
  collection,
  collectionData,
  CollectionReference,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { from, of, switchMap, take } from 'rxjs';
import { LocationModel } from 'src/app/core/models/location.model';
import { CollectionEnum } from 'src/app/core/enums/collection.enum';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [TranslatePipe, IonRippleEffect],
})
export class HomePage {
  private modalController = inject(ModalController);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  locations: WritableSignal<LocationModel[]> = signal([]);

  ngOnInit(): void {
    from(user(this.auth).pipe(take(1)))
      .pipe(
        switchMap((currentUser) => {
          if (!currentUser) return of([]);

          const uid = currentUser.uid;
          const locationsRef = collection(
            this.firestore,
            CollectionEnum.LOCATIONS
          ) as CollectionReference<LocationModel>;

          const filteredQuery = query(locationsRef, where('uid', '==', uid));

          return collectionData(filteredQuery, { idField: 'uid' });
        })
      )
      .subscribe((locations) => this.locations.set(locations));
  }

  async onAddLocation() {
    const modal = await this.modalController.create({
      component: AddLocationComponent,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log('Returned from modal:', data, role);
  }
}
