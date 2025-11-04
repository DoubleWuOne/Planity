import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AccountService } from '../services/account.service';

/**
 * Simple guard that prevents access when there is no current user.
 * Redirects to /login and preserves the attempted URL in query params.
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  const account = inject(AccountService);
  const router = inject(Router);
  const user = account.currentUser();
  if (user) return true;
  // not logged in -> redirect to login and provide returnUrl + message
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url, message: 'login-required' } });
};

export default AuthGuard;
