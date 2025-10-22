import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder)
  private accountService = inject(AccountService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['task@test.com'],
    password: ['Pa$$w0rd']
  });

  onSubmit() {
    this.accountService.login(this.loginForm.value).subscribe({
      next:()=>{
        this.accountService.getUserInfo().subscribe();
        this.router.navigateByUrl('/')
      }
    });
  }
}
