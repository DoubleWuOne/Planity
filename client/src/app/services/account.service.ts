import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = 'http://localhost:5202/api/';
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  login(values: any) {
    let params = new HttpParams();
    params =params.append('useCookies', true);
    return this.http.post<User>(this.baseUrl + 'account/login', values, {params});
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values);
  }

  getUserInfo(){
    return this.http.get<User>(this.baseUrl + 'account/user').pipe(
      map(user =>{
        this.currentUser.set(user);
        return user;
      })
    );
  }

  logout(){
    return this.http.post(this.baseUrl + 'account/logout', {});
  }
}
