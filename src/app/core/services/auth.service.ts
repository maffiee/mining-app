import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly auth = inject(Auth);
  readonly user = toSignal(authState(this.auth), {initialValue: null});

  readonly isAuthenticated = () => this.user() !== null;

  async login(email:string, password:string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}

