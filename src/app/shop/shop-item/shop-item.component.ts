import { Component, Input, OnInit } from '@angular/core';
import { IProduct } from '../../shared/Models/Product';
import { BasketService } from '../../basket/basket.service';
import { FavouritesService } from '../../shared/services/favourites.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, take } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-shop-item',
  templateUrl: './shop-item.component.html',
  styleUrl: './shop-item.component.scss',
})
export class ShopItemComponent implements OnInit {
  constructor(
    private _service: BasketService,
    private favouritesService: FavouritesService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  @Input() Product: IProduct;
  isInFavorites: boolean = false;
  isLoading: boolean = false;

  ngOnInit() {
    console.log('ShopItemComponent initialized for product:', this.Product.id);
    if (this.authService.isAuthenticated()) {
      this.checkIfInFavorites();
    }
  }

  SetBasketValue() {
    this._service.addItemToBasket(this.Product);
  }

  getArrayofRating(rateOfnumber: number): number[] {
    return Array(rateOfnumber).fill(0).map((x,i)=>i);
  }

  toggleFavorite() {
    if (!this.authService.isAuthenticated()) {
      this.toastr.warning('Please login to add items to favorites');
      return;
    }

    if (this.isLoading) {
      console.log('Already processing a request...');
      return;
    }

    console.log('Toggling favorite for product:', this.Product.id, 'Current state:', this.isInFavorites);
    this.isLoading = true;

    const operation = this.isInFavorites
      ? this.favouritesService.removeFromFavourites(this.Product.id)
      : this.favouritesService.addToFavourites(this.Product.id);

    operation
      .pipe(
        take(1),
        catchError(error => {
          console.error('Error in toggleFavorite:', error);
          this.toastr.error(this.isInFavorites ? 'Failed to remove from favorites' : 'Failed to add to favorites');
          return of(null);
        }),
        finalize(() => {
          console.log('Request completed. Resetting loading state...');
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Toggle favorite response:', response);
          // Update state even if response is just a message
          this.isInFavorites = !this.isInFavorites;
          if (response) {
            this.toastr.success(response);
          } else {
            this.toastr.success(
              this.isInFavorites ? 'Added to favorites' : 'Removed from favorites'
            );
          }
        },
        error: (error) => {
          console.error('Subscription error:', error);
        }
      });
  }

  private checkIfInFavorites() {
    console.log('Checking if product is in favorites:', this.Product.id);
    this.isLoading = true;

    this.favouritesService.getFavourites()
      .pipe(
        take(1),
        catchError(error => {
          console.error('Error checking favorites:', error);
          return of([]);
        }),
        finalize(() => {
          console.log('Favorites check completed');
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (favorites) => {
          console.log('Current favorites:', favorites);
          this.isInFavorites = favorites.some(f => f.productId === this.Product.id);
          console.log('Is product in favorites?', this.isInFavorites);
        },
        error: (error) => {
          console.error('Subscription error:', error);
        }
      });
  }
}
