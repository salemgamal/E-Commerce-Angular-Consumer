import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IOrder } from '../../shared/Models/Order';
import { OrdersService } from '../orders.service';
import { ToastrService } from 'ngx-toastr';
declare var bootstrap: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  orders: IOrder[] = [];
  selectedOrder: IOrder | null = null;
  private modalInstance: any;

  constructor(
    private _service: OrdersService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this._service.getAllOrderForUser().subscribe({
      next: (res) => {
        this.orders = res;
        console.log('Orders loaded:', res);
      },
      error: (err) => {
        console.log(err);
        if (err.message === 'User not authenticated') {
          this.toastr.warning('Please login to view your orders');
          this.router.navigate(['/account/login'], {
            queryParams: { returnUrl: '/orders' }
          });
        } else {
          this.toastr.error('Error loading orders');
        }
      },
    });
  }

  viewOrderDetails(order: IOrder) {
    this.selectedOrder = order;
    const modalEl = document.getElementById('orderDetailsModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.selectedOrder = null;
    }
  }
}
