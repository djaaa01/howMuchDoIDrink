import { Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  IonRippleEffect,
  ModalController,
  LoadingController,
} from '@ionic/angular/standalone';
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
import { Router } from '@angular/router';

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
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  locations: WritableSignal<LocationModel[]> = signal([]);

  ngOnInit(): void {
    from(this.loadingController.create())
      .pipe(
        switchMap((loading) => {
          loading.present();

          return from(user(this.auth).pipe(take(1))).pipe(
            switchMap((currentUser) => {
              if (!currentUser) {
                loading.dismiss();
                return of([]);
              }
              const uid = currentUser.uid;
              const locationsRef = collection(
                this.firestore,
                CollectionEnum.LOCATIONS
              ) as CollectionReference<LocationModel>;

              const filteredQuery = query(
                locationsRef,
                where('uid', '==', uid)
              );

              return collectionData(filteredQuery, { idField: 'id' }).pipe(
                switchMap((locations) => {
                  const sorted = [...locations].sort(
                    (a, b) =>
                      b.createdAt.toDate().getTime() -
                      a.createdAt.toDate().getTime()
                  );
                  this.locations.set(sorted);
                  return from(loading.dismiss());
                })
              );
            })
          );
        })
      )
      .subscribe();
  }

  onLocation(item: LocationModel): void {
    const route = `app/home/${item.id}`;
    this.router.navigate([route]);
  }

  async onAddLocation() {
    const modal = await this.modalController.create({
      component: AddLocationComponent,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
  }
}
