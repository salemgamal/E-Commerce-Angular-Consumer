export interface ICreateOrder {
  deliveryMethodId: number;
  basketId: string;
  shipAddress: IShippingAddress;
}
export interface IShippingAddress {
  firstName: string;
  lastName: string;
  city: string;
  zipCode: string;
  street: string;
  state: string;
}
export interface IOrder {
  id: number;
  createdAt: Date;
  items: IOrderItem[];
  totalAmount: number;
}
export interface IOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}
