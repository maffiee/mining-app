import { CanActivate, CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";

export const ownerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // wait for userProfile to load
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.isOwner()) {
    return true;
  }

  // staff trying to access owner page
  router.navigate(['/company-expense']);
  return false;
};