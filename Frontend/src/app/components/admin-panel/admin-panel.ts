import { Component, signal, inject, OnInit, computed } from '@angular/core';
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

    // Data Signals
    private allSubjects = signal<any[]>([]);
    private allFaculties = signal<any[]>([]);
    private allUsers = signal<any[]>([]);

    // Search
    searchQuery = signal('');

    // Computed Filtered Signals
    subjects = computed(() => {
        const q = this.searchQuery().toLowerCase();
        return this.allSubjects().filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.coreFocus.toLowerCase().includes(q) ||
            s.facultyName.toLowerCase().includes(q)
        );
    });

    faculties = computed(() => {
        const q = this.searchQuery().toLowerCase();
        return this.allFaculties().filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.department.toLowerCase().includes(q) ||
            f.email.toLowerCase().includes(q)
        );
    });

    users = computed(() => {
        const q = this.searchQuery().toLowerCase();
        return this.allUsers().filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.uniEmail.toLowerCase().includes(q) ||
            (u.studentId && u.studentId.toLowerCase().includes(q))
        );
    });

    // Modal State
    modalMode = signal<'add' | 'edit'>('add');

    // Subject Modal
    isSubjectModalOpen = signal(false);
    currentSubject: any = {
        name: '', coreFocus: '', targetAudience: '',
        duration: 0, prerequisites: '', skillType: '',
        location: 'On Campus', facultyName: ''
    };

    // Faculty Modal
    isFacultyModalOpen = signal(false);
    currentFaculty: any = {
        name: '', email: '', phoneNumber: '',
        department: '', designation: '', experience: 0
    };

    // User Modal
    isUserModalOpen = signal(false);
    currentUser: any = {
        name: '', uniEmail: '', role: '', studentId: ''
    };

    ngOnInit() {
        this.loadDashboard();
    }

    setTab(tab: 'dashboard' | 'subjects' | 'faculty' | 'users') {
        this.activeTab.set(tab);
        this.searchQuery.set(''); // Reset search on tab change
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
                ]);
                this.recentEnrollments.set(data.recentEnrollments);
            },
            error: (err) => console.error('Failed to load admin stats', err)
        });
    }

    loadSubjects() {
        this.apiService.getSubjects().subscribe(data => this.allSubjects.set(data));
    }
    loadFaculty() {
        this.apiService.getFaculties().subscribe(data => this.allFaculties.set(data));
    }
    loadUsers() {
        this.apiService.getUsers().subscribe(data => this.allUsers.set(data));
    }

    downloadReport() {
        const data = this.activeTab() === 'users' ? this.allUsers() :
            this.activeTab() === 'faculty' ? this.allFaculties() :
                this.activeTab() === 'subjects' ? this.allSubjects() :
                    this.recentEnrollments();

        if (!data || data.length === 0) {
            alert('No data available to download.');
            return;
        }

        const replacer = (key: any, value: any) => value === null ? '' : value;
        const header = Object.keys(data[0]);
        let csv = data.map((row: any) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        let csvArray = csv.join('\r\n');

        const blob = new Blob([csvArray], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${this.activeTab()}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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
    openFacultyModal(mode: 'add' | 'edit', faculty: any = null) {
        this.modalMode.set(mode);
        this.currentFaculty = mode === 'edit' && faculty ? { ...faculty } : {
            name: '', email: '', phoneNumber: '',
            department: '', designation: '', experience: 0
        };
        this.isFacultyModalOpen.set(true);
    }

    closeFacultyModal() {
        this.isFacultyModalOpen.set(false);
    }

    saveFaculty() {
        if (this.modalMode() === 'add') {
            this.apiService.addFaculty(this.currentFaculty).subscribe(() => {
                this.loadFaculty();
                this.closeFacultyModal();
            });
        } else {
            this.apiService.updateFaculty(this.currentFaculty.id, this.currentFaculty).subscribe(() => {
                this.loadFaculty();
                this.closeFacultyModal();
            });
        }
    }

    deleteFaculty(id: string) {
        if (confirm('Delete this faculty member?')) {
            this.apiService.deleteFaculty(id).subscribe(() => this.loadFaculty());
        }
    }

    // User Actions
    openUserModal(user: any) {
        this.currentUser = { ...user };
        this.isUserModalOpen.set(true);
    }

    closeUserModal() {
        this.isUserModalOpen.set(false);
    }

    saveUser() {
        this.apiService.updateUser(this.currentUser.id, this.currentUser).subscribe(() => {
            this.loadUsers();
            this.closeUserModal();
        });
    }

    deleteUser(id: string) {
        if (confirm('Delete this user?')) {
            this.apiService.deleteUser(id).subscribe(() => this.loadUsers());
        }
    }
}
