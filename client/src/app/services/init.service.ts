import { inject, Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccountService);
  init(){

    // getUserInfo may return 404 when there is no authenticated user.
    // Wrap it so init() doesn't fail the whole app initializer — return null instead.
    return forkJoin({
      user: this.accountService.getUserInfo().pipe(catchError(() => of(null)))
    })
  }
}
