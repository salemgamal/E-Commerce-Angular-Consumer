import { IBasket } from './../shared/Models/Basket';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Basket, IBasketItem, IBasketTotal } from '../shared/Models/Basket';
import { IProduct } from '../shared/Models/Product';
import { Delivery } from '../shared/Models/Delivery';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  constructor(private http: HttpClient) {}
  BaseURL = environment.baseURL;
  private basketSource = new BehaviorSubject<IBasket>(null);
  basket$ = this.basketSource.asObservable();
  private basketSourceTotal = new BehaviorSubject<IBasketTotal>(null);
  basketTotal$ = this.basketSourceTotal.asObservable();
  shipPrice: number = 0;
  SetShippingPrice(delivery: Delivery) {
    this.shipPrice = delivery.price;
    this.clacualteTotal();
  }
  CreatePaymentIntent(deliveryMethodId: number = 3) {
    console.log(this.GetCurrentValue().id);

    return this.http
      .post(
        this.BaseURL +
          `Payments/Create?basketId=${
            this.GetCurrentValue().id
          }&deliveryId=${deliveryMethodId}`,
        {}
      )
      .pipe(
        map((value: IBasket) => {
          this.basketSource.next(value);
          console.log('test:', value);
        })
      );
  }
  deleteBasket() {
    var basket: IBasket;
    this.basketSource.next(basket);
    this.basketSourceTotal.next(null);
    localStorage.removeItem('basketId');
  }
  clacualteTotal() {
    const basket = this.GetCurrentValue();
    const shipping = this.shipPrice;
    const subtotal = basket.basketItems.reduce((a, c) => {
      return c.price * c.qunatity + a;
    }, 0);
    const total = shipping + subtotal;
    this.basketSourceTotal.next({ shipping, subtotal, total });
  }

  GetBasket(id: string) {
    return this.http.get(this.BaseURL + 'Baskets/get-basket-item/' + id).pipe(
      map((value: IBasket) => {
        this.basketSource.next(value);
        this.clacualteTotal();
        return value;
      })
    );
  }
  SetBasket(basket: IBasket) {
    return this.http
      .post(this.BaseURL + 'Baskets/update-basket', basket)
      .subscribe({
        next: (value: IBasket) => {
          this.basketSource.next(value);
          this.clacualteTotal();
          console.log(value);
        },
        error(err) {
          console.log(err);
        },
      });
  }
  GetCurrentValue() {
    return this.basketSource.value;
  }

  addItemToBasket(product: IProduct, quantity: number = 1) {
    const itemToAdd: IBasketItem = this.MapProductToBasketItem(
      product,
      quantity
    );
    let basket = this.GetCurrentValue();
    if (basket.id == null) {
      basket = this.CreateBasket();
    }

    basket.basketItems = this.AddOrUpdate(
      basket.basketItems,
      itemToAdd,
      quantity
    );
    return this.SetBasket(basket);
  }
  private AddOrUpdate(
    basketItems: IBasketItem[],
    itemToAdd: IBasketItem,
    quantity: number
  ): IBasketItem[] {
    const index = basketItems.findIndex((i) => i.id === itemToAdd.id);
    if (index == -1) {
      itemToAdd.qunatity = quantity;
      basketItems.push(itemToAdd);
    } else {
      basketItems[index].qunatity += quantity;
    }
    return basketItems;
  }
  private CreateBasket(): IBasket {
    const basket = new Basket();
    localStorage.setItem('basketId', basket.id);
    return basket;
  }
  private MapProductToBasketItem(
    product: IProduct,
    quantity: number
  ): IBasketItem {
    return {
      id: product.id,
      category: product.categoryName,
      image: product.photos[0].imageName,
      name: product.name,
      price: product.newPrice,
      qunatity: quantity,
      description: product.description,
    };
  }

  incrementBasketItemQuantity(item: IBasketItem) {
    const basket = this.GetCurrentValue();
    const itemIndex = basket.basketItems.findIndex((i) => i.id === item.id);
    basket.basketItems[itemIndex].qunatity++;
    this.SetBasket(basket);
  }

  DecrementBasketItemQuantity(item: IBasketItem) {
    const basket = this.GetCurrentValue();
    const itemIndex = basket.basketItems.findIndex((i) => i.id === item.id);
    if (basket.basketItems[itemIndex].qunatity > 1) {
      basket.basketItems[itemIndex].qunatity--;
      this.SetBasket(basket);
    } else {
      this.removeItemFormBasket(item);
    }
  }
  removeItemFormBasket(item: IBasketItem) {
    const basket = this.GetCurrentValue();
    if (basket.basketItems.some((i) => i.id === item.id)) {
      basket.basketItems = basket.basketItems.filter((i) => i.id !== item.id);
      if (basket.basketItems.length > 0) {
        this.SetBasket(basket);
      } else {
        this.DeleteBaskeItem(basket);
      }
    }
  }
  DeleteBaskeItem(basket: IBasket) {
    return this.http
      .delete(this.BaseURL + '/Baskets/delete-basket-item/' + basket.id)
      .subscribe({
        next: (value) => {
          this.basketSource.next(null);
          localStorage.removeItem('basketId');
        },
        error(err) {
          console.log(err);
        },
      });
  }
}
