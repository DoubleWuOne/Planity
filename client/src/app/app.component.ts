import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AccountService } from './services/account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'client';
  baseUrl = 'http://localhost:5202/api/';
  accountService = inject(AccountService);
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {}
  ngOnInit(): void {
  }
  

  onLogout(): void {
   this.accountService.logout().subscribe({
    next: () => {
      this.accountService.currentUser.set(null);
      this.router.navigateByUrl('/');
    }
   });
  }

  get currentYear(): number { return new Date().getFullYear(); }
  contactSent = false;

  onContact(e: Event): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      message: data.get('message')
    };
    // For now just log and show confirmation. In future, post to backend.
    console.log('Contact payload', payload);
    this.contactSent = true;
    form.reset();
    setTimeout(() => this.contactSent = false, 5000);
  }
}
