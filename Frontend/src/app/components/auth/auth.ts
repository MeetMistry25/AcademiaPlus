import { Component, signal, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-auth',
    imports: [CommonModule, FormsModule],
    templateUrl: './auth.html',
    styleUrl: './auth.css',
})
export class Auth {
    private apiService = inject(ApiService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    mode = signal<'login' | 'signup'>('login');
    role = signal<'student' | 'faculty' | 'admin'>('student');

    showPassword = signal(false);
    isLoading = signal(false);
    errorMessage = signal('');

    // Form data
    formData = {
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        studentId: '',
        branch: '',
        bio: ''
    };

    constructor() {
        this.route.queryParams.subscribe(params => {
            if (params['mode'] === 'signup') {
                this.mode.set('signup');
            } else {
                this.mode.set('login');
            }
        });
    }

    toggleMode() {
        this.mode.update(m => m === 'login' ? 'signup' : 'login');
        this.errorMessage.set('');
    }

    onSubmit() {
        this.isLoading.set(true);
        this.errorMessage.set('');

        if (this.mode() === 'login') {
            this.apiService.login({
                email: this.formData.email,
                password: this.formData.password
            }, this.role()).subscribe({
                next: (token) => {
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', this.role());
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    this.errorMessage.set(typeof err.error === 'string' ? err.error : 'Login failed');
                    this.isLoading.set(false);
                }
            });
        } else {
            this.apiService.register({
                name: this.formData.name,
                uniEmail: this.formData.email,
                password: this.formData.password,
                phoneNumber: this.formData.phoneNumber,
                studentId: this.formData.studentId,
                branch: this.formData.branch,
                bio: this.formData.bio
            }).subscribe({
                next: () => {
                    this.mode.set('login');
                    this.errorMessage.set('Registration successful! Please login.');
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.errorMessage.set(typeof err.error === 'string' ? err.error : 'Registration failed');
                    this.isLoading.set(false);
                }
            });
        }
    }
}
