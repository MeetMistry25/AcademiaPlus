import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    theme = signal<'light' | 'dark'>('light');

    // Accessibility State
    accessibility = signal({
        fontSize: 'normal', // normal (100%), large (110%), x-large (125%)
        reduceMotion: false
    });

    constructor() {
        this.initializePreferences();

        // 1. Theme Effect
        effect(() => {
            document.documentElement.setAttribute('data-theme', this.theme());
            localStorage.setItem('theme', this.theme());
        });

        // 2. Font Size Effect
        effect(() => {
            const size = this.accessibility().fontSize;
            let scale = '100%';
            if (size === 'large') scale = '110%';
            if (size === 'x-large') scale = '125%';

            document.documentElement.style.fontSize = scale;
            localStorage.setItem('fontSize', size);
        });

        // 3. Reduce Motion Effect
        effect(() => {
            const reduce = this.accessibility().reduceMotion;
            if (reduce) {
                document.documentElement.classList.add('reduce-motion');
                document.documentElement.style.scrollBehavior = 'auto';
            } else {
                document.documentElement.classList.remove('reduce-motion');
                document.documentElement.style.scrollBehavior = 'smooth';
            }
            localStorage.setItem('reduceMotion', String(reduce));
        });
    }

    private initializePreferences() {
        // Theme
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) {
            this.theme.set(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme.set('dark');
        }

        // Accessibility
        const savedFontSize = localStorage.getItem('fontSize');
        const savedMotion = localStorage.getItem('reduceMotion');

        this.accessibility.update(current => ({
            ...current,
            fontSize: savedFontSize || 'normal',
            reduceMotion: savedMotion === 'true'
        }));
    }

    toggleTheme() {
        this.theme.update(current => current === 'light' ? 'dark' : 'light');
    }

    setFontSize(size: string) {
        this.accessibility.update(curr => ({ ...curr, fontSize: size }));
    }

    toggleMotion(reduce: boolean) {
        this.accessibility.update(curr => ({ ...curr, reduceMotion: reduce }));
    }

    setTheme(t: 'light' | 'dark') {
        this.theme.set(t);
    }
}
