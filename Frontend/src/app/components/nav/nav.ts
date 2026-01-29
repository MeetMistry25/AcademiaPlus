import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  role = signal<'student' | 'faculty' | 'admin' | null>(localStorage.getItem('role') as any);
  currentTheme = signal<string>('academia');

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'academia' ? 'dark' : 'academia';
    this.currentTheme.set(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.role.set(null);
    window.location.reload(); // Quick way to reset all states
  }
}

