import { Injectable, inject, runInInjectionContext, EnvironmentInjector, computed } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, from } from 'rxjs';
import { map } from 'rxjs/operators';

export type UserRole = 'owner' | 'manager' | 'staff';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);

  // authState() itself needs injection context
  readonly user = toSignal(
    runInInjectionContext(this.injector, () => authState(this.auth)),
    { initialValue: null }
  );

  private readonly userDoc$ = runInInjectionContext(this.injector, () =>
    authState(this.auth).pipe(
      switchMap((u) => {
        if (!u) return of(null);

        // doc() + getDoc() also need injection context, and switchMap loses it
        // so wrap again inside the callback
        return runInInjectionContext(this.injector, () => {
          const ref = doc(this.firestore, `users/${u.uid}`);
          return from(getDoc(ref)).pipe(
            map((snapshot) => {
              if (!snapshot.exists()) return null;
              return { id: snapshot.id, ...snapshot.data() };
            })
          );
        });
      })
    )
  );

  readonly userProfile = toSignal(this.userDoc$, { initialValue: null });

  readonly role = computed<UserRole>(() => {
    const p = this.userProfile() as any;
    return p?.role ?? 'staff';
  });

  readonly isOwner = computed(() => this.role() === 'owner' || this.role() === 'manager');
  readonly isAuthenticated = computed(() => this.user() !== null);

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}