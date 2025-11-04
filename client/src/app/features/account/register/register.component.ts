
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  registerForm!: FormGroup;

  constructor(){
    // build form with confirmPassword and group-level matcher
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  get f() { return this.registerForm.controls; }

  private strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const v = control.value as string || '';
    // at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
    const re = /(?=^.{8,}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*/;
    return re.test(v) ? null : { strong: true };
  }

  // Form-level validator: ensure password and confirmPassword match
  private passwordsMatch = (group: AbstractControl): ValidationErrors | null => {
    const pw = group.get('password')?.value as string | undefined;
    const cpw = group.get('confirmPassword')?.value as string | undefined;
    if (pw === undefined || cpw === undefined) return null;
    return pw === cpw ? null : { mismatch: true };
  }

  // realtime password strength helpers
  get pwValue() { return (this.registerForm.get('password')?.value || '') as string; }
  get pwHasMin() { return this.pwValue.length >= 8; }
  get pwHasUpper() { return /[A-Z]/.test(this.pwValue); }
  get pwHasLower() { return /[a-z]/.test(this.pwValue); }
  get pwHasNumber() { return /\d/.test(this.pwValue); }
  get pwHasSpecial() { return /\W/.test(this.pwValue); }

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };
    this.accountService.register(payload).subscribe({
      next: () => {
        this.successMessage = 'Registration successful. Redirecting to login...';
        // small delay to show message
        setTimeout(() => this.router.navigateByUrl('/login'), 1100);
      },
      error: (err) => {
        console.error('Registration failed', err);
        // try to map server validation errors to form controls (ModelState/ValidationProblem -> { errors: { key: [msg] } })
        if (err && err.status === 400 && err.error && err.error.errors) {
          this.mapServerErrors(err.error.errors);
        } else {
          this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        }
        this.submitting = false;
      },
      complete: () => { this.submitting = false; }
    });
  }

  private mapServerErrors(errorsObj: { [key: string]: string[] }){
    // Clear previous server errors
    Object.keys(this.registerForm.controls).forEach(k => {
      const c = this.registerForm.get(k);
      if (c) {
        const current = c.errors || {};
        if (current['server']) {
          delete current['server'];
          c.setErrors(Object.keys(current).length ? current : null);
        }
      }
    });

    // Map known keys to controls; fallback to global errorMessage
    let globalMessages: string[] = [];
    for (const [key, msgs] of Object.entries(errorsObj)){
      const message = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
      const lk = key.toLowerCase();
      let controlName: string | null = null;
      if (lk.includes('email')) controlName = 'email';
      else if (lk.includes('password')) controlName = 'password';
      else if (lk.includes('first') || lk.includes('firstname') || lk.includes('givenname')) controlName = 'firstName';
      else if (lk.includes('last') || lk.includes('lastname') || lk.includes('surname')) controlName = 'lastName';

      if (controlName && this.registerForm.contains(controlName)){
        const ctrl = this.registerForm.get(controlName)!;
        // attach server error under key 'server'
        const errs = ctrl.errors || {};
        errs['server'] = message;
        ctrl.setErrors(errs);
        ctrl.markAsTouched();
      } else {
        globalMessages.push(message);
      }
    }

    if (globalMessages.length) this.errorMessage = globalMessages.join(' ');
  }

}
