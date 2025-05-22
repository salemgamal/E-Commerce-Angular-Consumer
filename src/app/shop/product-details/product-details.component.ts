import { Component, OnInit } from '@angular/core';
import { ShopService } from '../shop.service';
import { IProduct } from '../../shared/Models/Product';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IReview } from '../../shared/Models/review';
import { FavouritesService } from '../../shared/services/favourites.service';
import { OrdersService } from '../../shared/services/orders.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private favouritesService: FavouritesService,
    private ordersService: OrdersService,
    private authService: AuthService
  ) {}

  product: IProduct;
  reviews: IReview[] = [];
  loading: boolean = false;
  mainImage: string;
  quantity: number = 1;
  isInFavorites: boolean = false;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/shop']);
      return;
    }

    this.loading = true;
    this.shopService.getProductDetails(parseInt(id)).subscribe({
      next: (value: IProduct) => {
        this.product = value;
        if (value.photos && value.photos.length > 0) {
          this.mainImage = value.photos[0].imageName;
        }
        this.loading = false;
        if (this.authService.isAuthenticated()) {
          this.checkIfInFavorites();
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.toast.error('Failed to load product details');
        this.loading = false;
        this.router.navigate(['/shop']);
      }
    });
  }

  changeImage(imageName: string) {
    this.mainImage = imageName;
  }

  calculateDiscount(oldPrice: number, newPrice: number): number {
    return parseFloat(
      Math.round(((oldPrice - newPrice) / oldPrice) * 100).toFixed(1)
    );
  }

  incrementQuantity() {
    if (this.quantity < 10) {
      this.quantity++;
    } else {
      this.toast.warning('Maximum quantity is 10');
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  toggleFavorite() {
    if (!this.product) return;

    if (!this.authService.isAuthenticated()) {
      this.toast.warning('Please login to add items to favorites');
      // Optionally redirect to login page
      // this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    if (this.isInFavorites) {
      this.favouritesService.removeFromFavourites(this.product.id).subscribe({
        next: () => {
          this.isInFavorites = false;
          this.toast.success('Removed from favorites');
          this.loading = false;
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
          this.toast.error('Failed to remove from favorites');
          this.loading = false;
        }
      });
    } else {
      this.favouritesService.addToFavourites(this.product.id).subscribe({
        next: () => {
          this.isInFavorites = true;
          this.toast.success('Added to favorites');
          this.loading = false;
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
          this.toast.error('Failed to add to favorites');
          this.loading = false;
        }
      });
    }
  }

  placeOrder() {
    if (!this.product) return;

    console.log('Attempting to place order...');
    this.authService.debugTokenStorage(); // Debug token storage

    const isAuth = this.authService.isAuthenticated();
    console.log('Is authenticated:', isAuth);
    
    if (!isAuth) {
      console.log('Authentication check failed');
      this.toast.warning('Please login to place an order');
      // Optionally redirect to login page
      // this.router.navigate(['/login']);
      return;
    }

    const userId = this.authService.getUserId();
    console.log('User ID from token:', userId);

    this.loading = true;
    const order = {
      items: [{
        productId: this.product.id,
        quantity: this.quantity
      }]
    };

    console.log('Sending order:', order);

    this.ordersService.createOrder(order).subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        this.toast.success('Order placed successfully');
        this.loading = false;
        // Optionally navigate to order confirmation page
        // this.router.navigate(['/orders', response.id]);
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.toast.error('Failed to place order');
        this.loading = false;
      }
    });
  }

  private checkIfInFavorites() {
    if (!this.product) return;

    this.favouritesService.getFavourites().subscribe({
      next: (favorites) => {
        this.isInFavorites = favorites.some(f => f.productId === this.product.id);
      },
      error: (error) => {
        if (error.message === 'User not authenticated') {
          // Handle silently as user might not be logged in
          console.log('User not authenticated for favorites check');
        } else {
          console.error('Error checking favorites:', error);
        }
      }
    });
  }

  showReviews(id: number) {
    this.loading = true;
    this.shopService.getProductRating(id).subscribe({
      next: (res) => {
        this.reviews = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.toast.error('Failed to load reviews');
        this.loading = false;
      }
    });
  }

  goBackToShop() {
    this.router.navigate(['/shop']);
  }
}

