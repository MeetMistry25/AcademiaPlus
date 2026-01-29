import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private apiService = inject(ApiService);
  public themeService = inject(ThemeService);

  // -- Signals for State --
  activeTab = signal<string>('general');

  // Notifications
  notifications = signal({
    email: true,
    push: false,
    marketing: false
  });

  // Security
  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };
  currentUser: any = null;

  constructor() { }

  ngOnInit() {
    // 1. Load Settings
    const savedNotifs = localStorage.getItem('notifications');
    if (savedNotifs) this.notifications.set(JSON.parse(savedNotifs));

    // 2. Load User for Security Context
    this.loadUser();
  }

  loadUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

        this.apiService.getUserProfile(email).subscribe({
          next: (u) => this.currentUser = u,
          error: () => console.warn('Could not load user profile for settings')
        });
      } catch (e) {
        console.error('Token decode error', e);
      }
    }
  }

  // Proxies to Theme Service
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  updateNotifs() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications()));
    this.showToast('Notification preferences saved');
  }

  updateAccessibility(type: 'font' | 'motion', value: any) {
    if (type === 'font') {
      this.themeService.setFontSize(value);
    } else {
      this.themeService.toggleMotion(value);
    }
    this.showToast('Accessibility settings updated');
  }

  changePassword() {
    if (this.passwordData.new !== this.passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (!this.passwordData.current) {
      alert('Please enter your current password');
      return;
    }
    console.log('Password change requested for user:', this.currentUser?.id);
    this.passwordData = { current: '', new: '', confirm: '' };
    this.showToast('Password updated successfully (Simulation)');
  }

  clearData() {
    if (confirm('Are you sure? This will clear all local preferences and log you out.')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  showToast(message: string) {
    console.log('Toast:', message);
  }
}
