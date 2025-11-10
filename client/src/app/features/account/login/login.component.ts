import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder)
  private accountService = inject(AccountService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = this.fb.group({
    email: ['kubaduba@mail.com'],
    password: ['Pa$$w0rd']
  });

  // optional message from guard and returnUrl
  infoMessage: string | null = null;
  returnUrl: string | null = null;
  toastVisible = false;

  closeToast() {
    this.toastVisible = false;
  }

  constructor(){
    const qp = this.route.snapshot.queryParamMap;
    const msg = qp.get('message');
    const r = qp.get('returnUrl');
    if(msg === 'login-required') {
      // Polish message
      this.infoMessage = 'Musisz się zalogować, aby uzyskać dostęp do tej strony.';
      this.toastVisible = true;
      // auto-hide after 4s
      setTimeout(() => this.toastVisible = false, 4000);
    }
    if(r) this.returnUrl = r;
  }

  onSubmit() {
    this.accountService.login(this.loginForm.value).subscribe({
      next:()=>{
        this.accountService.getUserInfo().subscribe({ next: ()=>{
          // after successful login, navigate to returnUrl if present
          if(this.returnUrl) this.router.navigateByUrl(this.returnUrl);
          else this.router.navigateByUrl('/');
        }});
      }
    });
  }
}
