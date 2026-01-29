import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-admin-panel',
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-panel.html',
    styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
    private apiService = inject(ApiService);

    activeTab = signal<'dashboard' | 'subjects' | 'faculty' | 'users'>('dashboard');

    stats = signal<any[]>([]);
    recentEnrollments = signal<any[]>([]);

    subjects = signal<any[]>([]);
    faculties = signal<any[]>([]);
    users = signal<any[]>([]);

    // Modal State
    isSubjectModalOpen = signal(false);
    modalMode = signal<'add' | 'edit'>('add');
    currentSubject: any = {
        name: '', coreFocus: '', targetAudience: '',
        duration: 0, prerequisites: '', skillType: '',
        location: 'On Campus', facultyName: ''
    };

    ngOnInit() {
        this.loadDashboard();
    }

    setTab(tab: 'dashboard' | 'subjects' | 'faculty' | 'users') {
        this.activeTab.set(tab);
        if (tab === 'dashboard') this.loadDashboard();
        if (tab === 'subjects') this.loadSubjects();
        if (tab === 'faculty') this.loadFaculty();
        if (tab === 'users') this.loadUsers();
    }

    loadDashboard() {
        this.apiService.getAdminStats().subscribe({
            next: (data) => {
                this.stats.set([
                    { label: 'Total Students', value: data.totalStudents, trend: '+0%', icon: 'users' },
                    { label: 'Active Courses', value: data.totalCourses, trend: '+0%', icon: 'book' },
                    { label: 'Faculty Members', value: data.totalFaculty, trend: '+0%', icon: 'briefcase' },
                    // { label: 'Monthly Revenue', value: `$${data.monthlyRevenue}`, trend: '+0%', icon: 'dollar' }
                ]);
                this.recentEnrollments.set(data.recentEnrollments);
            },
            error: (err) => console.error('Failed to load admin stats', err)
        });
    }

    loadSubjects() {
        this.apiService.getSubjects().subscribe(data => this.subjects.set(data));
    }
    loadFaculty() {
        this.apiService.getFaculties().subscribe(data => this.faculties.set(data));
    }
    loadUsers() {
        this.apiService.getUsers().subscribe(data => this.users.set(data));
    }

    // Subject Actions
    openSubjectModal(mode: 'add' | 'edit', subject: any = null) {
        this.modalMode.set(mode);
        if (mode === 'edit' && subject) {
            this.currentSubject = { ...subject };
        } else {
            this.currentSubject = {
                name: '', coreFocus: '', targetAudience: '',
                duration: 0, prerequisites: '', skillType: '',
                location: 'On Campus', facultyName: ''
            };
        }
        this.isSubjectModalOpen.set(true);
    }

    closeSubjectModal() {
        this.isSubjectModalOpen.set(false);
    }

    saveSubject() {
        if (this.modalMode() === 'add') {
            this.apiService.addSubject(this.currentSubject).subscribe(() => {
                this.loadSubjects();
                this.closeSubjectModal();
            });
        } else {
            this.apiService.updateSubject(this.currentSubject.id, this.currentSubject).subscribe(() => {
                this.loadSubjects();
                this.closeSubjectModal();
            });
        }
    }

    deleteSubject(id: number) {
        if (confirm('Delete this subject?')) {
            this.apiService.deleteSubject(id).subscribe(() => this.loadSubjects());
        }
    }

    // Faculty Actions
    deleteFaculty(id: string) {
        if (confirm('Delete this faculty member?')) {
            this.apiService.deleteFaculty(id).subscribe(() => this.loadFaculty());
        }
    }

    // User Actions
    deleteUser(id: string) {
        if (confirm('Delete this user?')) {
            this.apiService.deleteUser(id).subscribe(() => this.loadUsers());
        }
    }
}
