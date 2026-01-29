export interface Faculty {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    department: string;
    designation: string;
    experience: number;
    image?: string; // Optional field for UI
    bio?: string;   // Optional field for UI
}

export interface Subject {
    id: number;
    name: string;
    location: string;
    coreFocus: string;
    prerequisites: string;
    duration: number;
    targetAudience: string;
    skillType: string;
    facultyName: string;
    image?: string; // Optional field for UI
    rating?: number; // Optional field for UI
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    uniEmail: string;
    password: string;
    phoneNumber: string;
    studentId: string;
    branch: string;
    bio: string;
}

export interface AuthResponse {
    token: string;
}
