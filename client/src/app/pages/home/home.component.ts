import { Component, AfterViewInit, inject } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  constructor() {}
  accountService = inject(AccountService);

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const els = Array.from(document.querySelectorAll('.testimonial')) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('in-view');
        }
      });
    }, { threshold: 0.25 });

    // Only add the pre-animate state if observer is available.
    els.forEach(el => {
      el.classList.add('pre-animate');
      obs.observe(el);
    });
  }
}
