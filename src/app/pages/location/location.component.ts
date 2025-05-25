import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Firestore,
  doc,
  docData,
  DocumentReference,
  updateDoc,
  collection,
  addDoc,
  CollectionReference,
  query,
  where,
  collectionData,
} from '@angular/fire/firestore';
import { LocationModel, StateModel } from 'src/app/core/models/location.model';
import { lastValueFrom, take } from 'rxjs';
import {
  IonRippleEffect,
  ModalController,
  LoadingController,
} from '@ionic/angular/standalone';
import { AddItemComponent } from 'src/app/components/add-item/add-item.component';
import { ItemModel } from 'src/app/core/models/item.model';
import { CollectionEnum } from 'src/app/core/enums/collection.enum';
import { TabMenuEnum } from 'src/app/core/enums/tab-menu.enum';
import { Auth } from '@angular/fire/auth';
import { HistoryRecordModel } from 'src/app/core/models/history-record.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  standalone: true,
  imports: [TranslatePipe, IonRippleEffect, DatePipe],
})
export class LocationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  location: WritableSignal<LocationModel | null> = signal(null);
  history: WritableSignal<HistoryRecordModel[]> = signal([]);
  currentTab: WritableSignal<string> = signal(TabMenuEnum.MENU);
  TabMenuEnum = TabMenuEnum;
  locationId!: string;
  uid!: string;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    this.uid = this.auth.currentUser?.uid || 'no-uid';
    this.locationId = id || '';

    if (id) {
      const loading = await this.loadingController.create();
      await loading.present();

      try {
        await this.loadData();
      } catch (error) {
        console.error('Eroare la încărcare:', error);
      } finally {
        await loading.dismiss();
      }
    }
  }

  async loadData(): Promise<void> {
    const docRef = doc(
      this.firestore,
      `${CollectionEnum.LOCATIONS}/${this.locationId}`
    ) as DocumentReference<LocationModel>;

    const historyRef = collection(
      this.firestore,
      CollectionEnum.HISTORY
    ) as CollectionReference<HistoryRecordModel>;

    const filteredQuery = query(
      historyRef,
      where('locationId', '==', this.locationId)
    );

    const locationPromise = lastValueFrom(docData(docRef).pipe(take(1)));
    const historyPromise = lastValueFrom(
      collectionData(filteredQuery, { idField: 'id' }).pipe(take(1))
    );

    const [locationData, historyData] = await Promise.all([
      locationPromise,
      historyPromise,
    ]);

    this.location.set(locationData as LocationModel);

    const historyWithTotal = (historyData as HistoryRecordModel[]).map(
      (record) => {
        const totalAmount = (record.items || []).reduce(
          (sum, item) => sum + item.price * (item.counter || 0),
          0
        );
        return { ...record, totalAmount };
      }
    );

    console.log(historyWithTotal);

    const sorted = historyWithTotal.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.history.set(sorted);
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

  onBack(): void {
    (document.activeElement as HTMLElement)?.blur();
    const prevRoute = this.route.snapshot.data['prevRoute'];
    this.router.navigate([`/app/${prevRoute}`]);
  }

  onTab(tab: TabMenuEnum): void {
    if (tab === this.currentTab()) {
      return;
    }

    this.currentTab.set(tab);
  }

  async onState(currentState: boolean): Promise<void> {
    const current = this.location();
    if (!current || !this.locationId) return;

    const docRef = doc(
      this.firestore,
      `${CollectionEnum.LOCATIONS}/${this.locationId}`
    ) as DocumentReference<LocationModel>;

    if (!currentState) {
      const updatedState: StateModel = {
        isPlay: true,
        createdAt: new Date().toISOString(),
      };

      const updatedData: LocationModel = {
        ...current,
        state: updatedState,
      };

      try {
        await updateDoc(docRef, { state: updatedState });
        this.location.set(updatedData);
      } catch (error) {
        console.error('Eroare la pornire:', error);
      }
    } else {
      const statesCollection = collection(
        this.firestore,
        CollectionEnum.HISTORY
      );

      const itemsWithResetCounter = (current.items || []).map((item) => ({
        ...item,
        counter: 0,
      }));

      const filteredItems = (current.items || []).filter(
        (item) => item.counter && item.counter > 0
      );

      if (filteredItems.length > 0) {
        const historyRecord: HistoryRecordModel = {
          locationId: this.locationId,
          state: current.state?.isPlay || false,
          uid: this.uid,
          createdAt: current.state?.createdAt,
          items: filteredItems,
        };

        try {
          await addDoc(statesCollection, historyRecord);
        } catch (error) {
          console.error('Eroare la salvarea în history:', error);
        }
      }

      const updatedState: StateModel = {
        isPlay: false,
        createdAt: null,
      };

      const updatedData: LocationModel = {
        ...current,
        state: updatedState,
        items: itemsWithResetCounter,
      };

      try {
        await updateDoc(docRef, {
          state: updatedState,
          items: itemsWithResetCounter,
        });
        this.location.set(updatedData);
        await this.loadData();
      } catch (error) {
        console.error('Eroare la resetare:', error);
      }
    }
  }
}
