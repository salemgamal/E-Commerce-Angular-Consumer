import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ShopService } from './shop.service';
import { ICateogry } from '../shared/Models/Category';
import { IPagnation } from '../shared/Models/Pagnation';
import { IProduct } from '../shared/Models/Product';
import { ProductParam } from '../shared/Models/ProductParam';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit {
  constructor(private shopService: ShopService, private toast: ToastrService) {}

  ngOnInit(): void {
    this.initializeParams();
    this.getAllProduct();
    this.getCategory();
  }

  product: IProduct[] = [];
  Cateogry: ICateogry[] = [];
  TotatlCount: number = 0;
  ProductParam = new ProductParam();
  isLoading: boolean = false;

  initializeParams() {
    this.ProductParam = new ProductParam();
    this.ProductParam.CategoryId = 0; // Start with All products
    this.ProductParam.Sort = this.SortingOption[0].value;
    this.ProductParam.PageNumber = 1;
    this.ProductParam.PageSize = 10;
  }

  getAllProduct() {
    this.isLoading = true;
    console.log('Fetching products with params:', this.ProductParam);
    this.shopService.getProduct(this.ProductParam).subscribe({
      next: (value: IPagnation) => {
        console.log('Products received:', value);
        if (value && value.data) {
          this.product = value.data;
          this.TotatlCount = value.totalCount;
          this.ProductParam.PageNumber = value.pageNumber;
          this.ProductParam.PageSize = value.pageSize;
          if (this.product.length > 0) {
            this.toast.success('Products loaded successfully', 'SUCCESS');
          } else {
            this.toast.warning('No products found', 'WARNING');
          }
        } else {
          this.toast.error('Invalid response format from server', 'ERROR');
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toast.error('Failed to load products: ' + (error.error?.message || error.message || 'Unknown error'), 'ERROR');
        this.product = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  OnChangePage(event: any) {
    if (this.ProductParam.PageNumber !== event) {
      this.ProductParam.PageNumber = event;
      console.log('Page changed to:', event);
      this.getAllProduct();
    }
  }

  getCategory() {
    this.shopService.getCategory().subscribe({
      next: (value) => {
        console.log('Categories received:', value);
        if (value) {
          this.Cateogry = value;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toast.error('Failed to load categories: ' + (error.error?.message || error.message || 'Unknown error'), 'ERROR');
        this.Cateogry = [];
      }
    });
  }

  SelectedId(categoryid: number) {
    if (this.ProductParam.CategoryId === categoryid) return; // Don't reload if same category
    this.ProductParam.CategoryId = categoryid;
    this.ProductParam.PageNumber = 1;
    console.log('Category selected:', categoryid);
    this.getAllProduct();
  }

  SortingOption = [
    { name: 'Alphabetical', value: 'Name' },
    { name: 'Price: Low to High', value: 'PriceAsc' },
    { name: 'Price: High to Low', value: 'PriceDesc' }
  ];

  SortingByPrice(sort: Event) {
    this.ProductParam.Sort = (sort.target as HTMLSelectElement).value;
    console.log('Sort selected:', this.ProductParam.Sort);
    this.getAllProduct();
  }

  OnSearch(Search: string) {
    this.ProductParam.Search = Search;
    this.ProductParam.PageNumber = 1;
    console.log('Search term:', Search);
    this.getAllProduct();
  }

  @ViewChild('search') searchInput: ElementRef;
  @ViewChild('SortSelected') selected: ElementRef;

  ResetValue() {
    this.initializeParams();
    
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    
    if (this.selected) {
      this.selected.nativeElement.selectedIndex = 0;
    }

    console.log('Filters reset');
    this.getAllProduct();
  }
}
