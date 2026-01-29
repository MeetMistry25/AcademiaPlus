import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Faculty, Subject, LoginRequest, RegisterRequest, AuthResponse } from '../models/api.models';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    login(credentials: LoginRequest, role: 'student' | 'faculty' | 'admin'): Observable<string> {
        const endpoint = role === 'faculty' ? 'Faculty/login' : 'User/login';
        // The APIs return token as plain string or in a response object? 
        // UserController returns Ok(token) which is a string. FacultyController too.
        return this.http.post(`${this.apiUrl}/${endpoint}`, credentials, { responseType: 'text' });
    }

    register(data: RegisterRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/User`, data);
    }

    getFaculties(): Observable<Faculty[]> {
        return this.http.get<Faculty[]>(`${this.apiUrl}/Faculty`).pipe(
            map(faculties => faculties.map(f => this.mapFaculty(f)))
        );
    }

    getFaculty(id: string): Observable<Faculty> {
        return this.http.get<Faculty>(`${this.apiUrl}/Faculty/${id}`).pipe(
            map(f => this.mapFaculty(f))
        );
    }

    getSubjects(): Observable<Subject[]> {
        return this.http.get<Subject[]>(`${this.apiUrl}/Subject`).pipe(
            map(subjects => subjects.map(s => this.mapSubject(s)))
        );
    }

    getSubject(id: number): Observable<Subject> {
        return this.http.get<Subject>(`${this.apiUrl}/Subject/${id}`).pipe(
            map(s => this.mapSubject(s))
        );
    }

    getUserProfile(email: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/User/email/${email}`);
    }

    getEnrollments(email: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/User/${email}/enrollments`);
    }

    enroll(email: string, courseId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/User/enroll`, { userEmail: email, courseId });
    }

    unenroll(email: string, courseId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/User/enroll?email=${encodeURIComponent(email)}&courseId=${courseId}`);
    }

    getAdminStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/User/admin/stats`);
    }

    // User Management
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/User`);
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/User/${id}`);
    }

    updateUser(id: string, user: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/User/${id}`, user);
    }

    // Subject Management
    addSubject(subject: Subject): Observable<Subject> {
        return this.http.post<Subject>(`${this.apiUrl}/Subject`, subject);
    }

    updateSubject(id: number, subject: Subject): Observable<any> {
        return this.http.put(`${this.apiUrl}/Subject/${id}`, subject);
    }

    deleteSubject(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Subject/${id}`);
    }

    // Faculty Management
    addFaculty(faculty: Faculty): Observable<Faculty> {
        return this.http.post<Faculty>(`${this.apiUrl}/Faculty`, faculty);
    }

    updateFaculty(id: string, faculty: Faculty): Observable<any> {
        return this.http.put(`${this.apiUrl}/Faculty/${id}`, faculty);
    }

    deleteFaculty(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Faculty/${id}`);
    }

    private mapFaculty(f: Faculty): Faculty {
        return {
            ...f,
            image: `https://i.pravatar.cc/150?u=${f.id}`,
            bio: `${f.designation} in the ${f.department} department with ${f.experience} years of experience.`
        };
    }

    private mapSubject(s: Subject): Subject {
        return {
            ...s,
            image: this.getCourseImage(s.coreFocus),
            rating: Math.floor(Math.random() * (50 - 40 + 1) + 40) / 10
        };
    }

    private getCourseImage(focus: string): string {
        const images: { [key: string]: string } = {
            'Technology': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop',
            'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
            'Arts': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop',
            'Science': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
            'Music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop',
            'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop'
        };

        for (const key in images) {
            if (focus.toLowerCase().includes(key.toLowerCase())) {
                return images[key];
            }
        }
        return 'https://images.unsplash.com/photo-1454165833762-02ad50c797e8?q=80&w=2070&auto=format&fit=crop';
    }
}
