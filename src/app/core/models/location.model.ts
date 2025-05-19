import { ItemModel } from "./item.model";

export interface LocationModel {
  id?: string;
  uid: string;
  name: string;
  address: string;
  createdAt: any;
  items?: ItemModel[];
}
