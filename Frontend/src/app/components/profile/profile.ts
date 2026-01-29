import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private apiService = inject(ApiService);

  isEditing = signal<boolean>(false);
  originalUser: any = null;
  editData: any = {};

  student = signal<any>({
    id: '',
    name: 'Loading...',
    email: 'Loading...',
    joined: 'Sep 2024',
    major: '...',
    phone: '',
    studentId: '',
    bio: '',
    credits: 0,
    avatar: 'https://i.pravatar.cc/150?u=academia'
  });

  enrolledCourses = signal<any[]>([]);

  notifications = [
    { title: 'Assignment Due', message: 'Robotics Project Phase 1 is due in 2 days.', type: 'alert' },
    { title: 'New Material', message: 'Dr. Sarah posted a new reading in AI.', type: 'info' }
  ];

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

        this.apiService.getUserProfile(email).subscribe(user => {
          this.originalUser = user;
          this.student.set({
            id: user.id,
            name: user.name,
            email: user.uniEmail,
            joined: 'Sep 2024',
            major: user.branch,
            phone: user.phoneNumber,
            studentId: user.studentId,
            bio: user.bio,
            credits: 0,
            avatar: 'https://i.pravatar.cc/150?u=academia'
          });
        });

        this.apiService.getEnrollments(email).subscribe(courses => {
          this.enrolledCourses.set(courses);
        });
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }
  }

  toggleEdit() {
    if (!this.isEditing()) {
      // Start editing: copy current student data to editData
      this.editData = { ...this.student() };
    }
    this.isEditing.update(v => !v);
  }

  saveProfile() {
    if (!this.originalUser) return;

    // Construct the user object to send back which matches Backend.Models.User structure
    const updatedUser = {
      ...this.originalUser,
      name: this.editData.name,
      uniEmail: this.editData.email, // email is read-only
      phoneNumber: this.editData.phone,
      studentId: this.editData.studentId,
      branch: this.editData.major,
      bio: this.editData.bio
    };

    this.apiService.updateUser(updatedUser.id, updatedUser).subscribe({
      next: () => {
        // Update local student signal
        this.student.set({
          ...this.editData,
          joined: this.student().joined, // Preserve fields not in editData
          credits: this.student().credits,
          avatar: this.student().avatar
        });

        this.isEditing.set(false);
        this.originalUser = updatedUser;
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        alert('Failed to update profile.');
      }
    });
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  unenroll(courseId: number) {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;

    const email = this.student().email;
    this.apiService.unenroll(email, courseId).subscribe({
      next: () => {
        this.enrolledCourses.update(courses => courses.filter(c => c.courseId !== courseId));
        alert('Unenrolled successfully.');
      },
      error: (err) => {
        console.error('Failed to unenroll', err);
        alert('Failed to unenroll.');
      }
    });
  }
}

