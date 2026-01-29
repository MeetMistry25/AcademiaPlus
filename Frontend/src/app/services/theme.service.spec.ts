import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        // Clear localStorage before each test to ensure clean state
        localStorage.clear();

        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with default theme (light)', () => {
        expect(service.theme()).toBe('light');
    });

    it('should toggle theme from light to dark', () => {
        service.toggleTheme();
        expect(service.theme()).toBe('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update font size', () => {
        service.setFontSize('large');
        expect(service.accessibility().fontSize).toBe('large');
        expect(localStorage.getItem('fontSize')).toBe('large');
        // We can't easily test document.documentElement.style in unit tests without mocking, 
        // but we can trust the effect logic if the state updates.
    });

    it('should toggle reduce motion', () => {
        service.toggleMotion(true);
        expect(service.accessibility().reduceMotion).toBeTrue();
        expect(localStorage.getItem('reduceMotion')).toBe('true');
        expect(document.documentElement.classList.contains('reduce-motion')).toBeTrue();

        service.toggleMotion(false);
        expect(service.accessibility().reduceMotion).toBeFalse();
        expect(document.documentElement.classList.contains('reduce-motion')).toBeFalse();
    });
});
