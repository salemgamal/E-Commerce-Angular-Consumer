import { Component, OnInit } from '@angular/core';
import { FavouritesService, IFavourite } from '../shared/services/favourites.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: IFavourite[] = [];
  loading = false;

  constructor(
    private favouritesService: FavouritesService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.favouritesService.getFavourites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.toastr.error('Error loading favorites');
        this.loading = false;
      }
    });
  }

  removeFromFavorites(productId: number) {
    this.favouritesService.removeFromFavourites(productId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(p => p.productId !== productId);
        this.toastr.success('Product removed from favorites');
      },
      error: (error) => {
        console.error('Error removing from favorites:', error);
        this.toastr.error('Error removing from favorites');
      }
    });
  }

  viewProductDetails(productId: number) {
    this.router.navigate(['/shop/product-details', productId]);
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return '';
    return `https://localhost:7182/${imageName}`;
  }
} 