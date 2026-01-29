import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Faculty as FacultyModel } from '../../models/api.models';

@Component({
  selector: 'app-faculty',
  imports: [RouterLink, CommonModule],
  templateUrl: './faculty.html',
  styleUrl: './faculty.css',
})
export class Faculty implements OnInit {
  private apiService = inject(ApiService);
  facultyMembers = signal<FacultyModel[]>([]);

  ngOnInit() {
    this.apiService.getFaculties().subscribe({
      next: (data) => {
        this.facultyMembers.set(data);
      },
      error: (err) => console.error('Error fetching faculties:', err)
    });
  }
}

