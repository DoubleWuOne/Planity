import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // simple client-only auth signal for now
  private _isAuthenticated = signal(false);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  login(): void {
    // placeholder: in future call API and set token
    this._isAuthenticated.set(true);
  }

  logout(): void {
    this._isAuthenticated.set(false);
  }
}
