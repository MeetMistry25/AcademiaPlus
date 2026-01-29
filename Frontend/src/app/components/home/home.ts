import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Subject as SubjectModel } from '../../models/api.models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private apiService = inject(ApiService);
  featuredCourses = signal<SubjectModel[]>([]);
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  stats = [
    { label: 'Active Students', value: '1,000+' },
    { label: 'Expert Faculty', value: '25+' },
    { label: 'Available Courses', value: '50+' },
    // { label: 'Success Rate', value: '98%' }
  ];

  ngOnInit() {
    this.apiService.getSubjects().subscribe({
      next: (data) => {
        // Take first 3 as featured
        this.featuredCourses.set(data.slice(0, 3));
      },
      error: (err) => console.error('Error fetching featured courses:', err)
    });
  }
}

