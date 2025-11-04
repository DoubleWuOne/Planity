import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth-required',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-required.component.html',
  styleUrls: ['./auth-required.component.scss']
})
export class AuthRequiredComponent {
  returnUrl: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(m => this.returnUrl = m.get('returnUrl'));
  }

  goLogin() {
    const extras: any = {};
    if (this.returnUrl) extras.queryParams = { returnUrl: this.returnUrl };
    this.router.navigate(['/login'], extras);
  }
}
