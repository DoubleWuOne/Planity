import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  private fb = inject(FormBuilder);

  profileForm = this.fb.group({
    avatar: [null as any],
    firstName: [''],
    lastName: [''],
    email: [{ value: '', disabled: true }],
    currentPassword: [''],
    newPassword: [''],
    confirmNewPassword: ['']
  });

  generalForm = this.fb.group({
    theme: ['light']
  });

  avatarPreview: string | null = null;
  profileSaved = false;
  generalSaved = false;

  onAvatarChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result as string;
    reader.readAsDataURL(file);
    this.profileForm.patchValue({ avatar: file });
  }

  saveProfile() {
    // for now, pretend to save and show success
    console.log('Saving profile', this.profileForm.value);
    this.profileSaved = true;
    setTimeout(() => this.profileSaved = false, 2500);
  }

  saveGeneral() {
    console.log('Saving general settings', this.generalForm.value);
    this.generalSaved = true;
    setTimeout(() => this.generalSaved = false, 2000);
  }
}
