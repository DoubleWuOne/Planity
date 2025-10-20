import { Component, AfterViewInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  constructor(public auth: AuthService) {}

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
