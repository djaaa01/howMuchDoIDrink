import { ItemModel } from './item.model';

export interface HistoryRecordModel {
  id?: string;
  locationId: string;
  state: boolean;
  uid: string;
  createdAt: any;
  items: ItemModel[];

  // UI
  totalAmount?: number;
}
