import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Firestore,
  doc,
  docData,
  DocumentReference,
  updateDoc,
} from '@angular/fire/firestore';
import { LocationModel } from 'src/app/core/models/location.model';
import { take } from 'rxjs';
import {
  IonRippleEffect,
  ModalController,
  LoadingController,
} from '@ionic/angular/standalone';
import { AddItemComponent } from 'src/app/components/add-item/add-item.component';
import { ItemModel } from 'src/app/core/models/item.model';
import { CollectionEnum } from 'src/app/core/enums/collection.enum';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  standalone: true,
  imports: [TranslatePipe, IonRippleEffect],
})
export class LocationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);

  location: WritableSignal<LocationModel | null> = signal(null);
  locationId!: string;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    this.locationId = id || '';

    if (id) {
      const loading = await this.loadingController.create();
      await loading.present();
      const docRef = doc(
        this.firestore,
        `${CollectionEnum.LOCATIONS}/${id}`
      ) as DocumentReference<LocationModel>;

      docData(docRef)
        .pipe(take(1))
        .subscribe((data) => {
          this.location.set(data as LocationModel);
        })
        .add(() => loading.dismiss());
    }
  }

  async onAddItem() {
    (document.activeElement as HTMLElement)?.blur();
    const modal = await this.modalController.create({
      component: AddItemComponent,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.addItem(data);
    }
  }

  async addItem(item: ItemModel): Promise<void> {
    const current = this.location();

    if (!current || !this.locationId) return;

    const updatedItems = [...(current.items || []), { ...item, counter: 0 }];

    const docRef = doc(
      this.firestore,
      `${CollectionEnum.LOCATIONS}/${this.locationId}`
    ) as DocumentReference<LocationModel>;

    const loading = await this.loadingController.create();
    await loading.present();

    updateDoc(docRef, { items: updatedItems })
      .then(() => {
        this.location.set({
          ...current,
          items: updatedItems,
        });
      })
      .catch((error) => {
        console.error('Eroare la actualizarea locației:', error);
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async onPlusCounter(item: ItemModel): Promise<void> {
    const current = this.location();
    if (!current || !this.locationId || !current.items) return;

    const updatedItems = current.items.map((i) => {
      if (i.name === item.name) {
        return { ...i, counter: (i.counter || 0) + 1 };
      }
      return i;
    });

    const docRef = doc(
      this.firestore,
      `${CollectionEnum.LOCATIONS}/${this.locationId}`
    ) as DocumentReference<LocationModel>;

    updateDoc(docRef, { items: updatedItems })
      .then(() => {
        this.location.set({
          ...current,
          items: updatedItems,
        });
      })
      .catch((error) => {
        console.error('Eroare la incrementare:', error);
      });
  }

  async onMinusCounter(item: ItemModel): Promise<void> {
    const current = this.location();
    if (!current || !this.locationId || !current.items) return;

    const updatedItems = current.items.map((i) => {
      if (i.name === item.name && (i.counter || 0) > 0) {
        return { ...i, counter: (i.counter || 0) - 1 };
      }
      return i;
    });

    const docRef = doc(
      this.firestore,
      `${CollectionEnum.LOCATIONS}/${this.locationId}`
    ) as DocumentReference<LocationModel>;

    updateDoc(docRef, { items: updatedItems })
      .then(() => {
        this.location.set({
          ...current,
          items: updatedItems,
        });
      })
      .catch((error) => {
        console.error('Eroare la decrementare:', error);
      });
  }
}
