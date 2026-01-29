import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Auth } from './components/auth/auth';
import { Courses } from './components/courses/courses';
import { Faculty } from './components/faculty/faculty';
import { Profile } from './components/profile/profile';
import { CourseDetails } from './components/course-details/course-details';
import { FacultyDetails } from './components/faculty-details/faculty-details';
import { AdminPanel } from './components/admin-panel/admin-panel';
import { Mylearning } from './components/mylearning/mylearning';
import { Settings } from './components/settings/settings';
import { Errorp } from './components/errorp/errorp';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Auth },
    { path: 'signup', component: Auth },
    { path: 'courses', component: Courses },
    { path: 'courses/:id', component: CourseDetails },
    { path: 'faculty', component: Faculty },
    { path: 'faculty/:id', component: FacultyDetails },
    { path: 'profile', component: Profile },
    { path: 'admin', component: AdminPanel },
    {path:'mylearning', component:Mylearning},
    {path:'settings', component:Settings},
    {path:'**', component: Errorp}
];
