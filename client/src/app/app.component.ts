import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';

  constructor(public auth: AuthService) {}

  onLogout(): void {
    this.auth.logout();
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
