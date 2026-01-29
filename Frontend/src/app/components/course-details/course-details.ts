import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Subject as SubjectModel } from '../../models/api.models';

@Component({
  selector: 'app-course-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  course = signal<SubjectModel | null>(null);
  role = signal<'student' | 'faculty' | 'admin' | null>(localStorage.getItem('role') as any);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getSubject(Number(id)).subscribe({
        next: (data) => this.course.set(data),
        error: (err) => console.error('Error fetching course details:', err)
      });
    }
  }

  enroll() {
    const course = this.course();
    if (course) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

          this.apiService.enroll(email, course.id).subscribe({
            next: () => {
              alert('Enrollment successful!');
            },
            error: (err) => {
              alert('Enrollment failed: ' + (typeof err.error === 'string' ? err.error : 'Unknown error'));
            }
          });
        } catch (e) {
          console.error("Token decode error", e);
        }
      }
    }
  }
}

