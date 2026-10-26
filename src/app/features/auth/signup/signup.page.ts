import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex min-h-full items-center justify-center bg-slate-50 px-6 py-10">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mining App</p>
          <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">Create your account</h1>
          <p class="mt-2 text-sm text-slate-500">Start managing material intake, sales, and operations securely.</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="space-y-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-900">Full name</label>
              <input
                [(ngModel)]="fullName"
                type="text"
                placeholder="Your full name"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-900">Email</label>
              <input
                [(ngModel)]="email"
                type="email"
                placeholder="you@example.com"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-900">Password</label>
              <input
                [(ngModel)]="password"
                type="password"
                placeholder="At least 6 characters"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            @if (error()) {
              <p class="text-sm text-red-600">{{ error() }}</p>
            }

            <button
              type="button"
              (click)="signup()"
              [disabled]="loading()"
              class="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading() ? 'Creating account...' : 'Create account' }}
            </button>

            <div class="text-center">
              <p class="text-sm text-slate-600">
                Already have an account?
                <a routerLink="/login" class="font-semibold text-slate-950 underline underline-offset-4 transition hover:text-slate-700">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SignupPage {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  private readonly ownerEmails = ['josbreed@gmail.com'];

  async signup() {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      this.error.set('Please complete all fields before creating your account.');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters long.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const cred = await createUserWithEmailAndPassword(this.auth, this.email.trim(), this.password);
      const role = this.ownerEmails.includes(this.email.trim().toLowerCase()) ? 'owner' : 'staff';

      await setDoc(doc(this.firestore, `users/${cred.user.uid}`), {
        fullName: this.fullName.trim(),
        email: this.email.trim().toLowerCase(),
        role,
        createdAt: serverTimestamp(),
      });

      this.router.navigate(['/login']);
    } catch (e: any) {
      this.error.set(e.message || 'Unable to create account. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}