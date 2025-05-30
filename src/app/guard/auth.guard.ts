import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const userId = authService.getUserIdFromToken();
    if (userId) {
      return true;
    }
  }
  
  router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
