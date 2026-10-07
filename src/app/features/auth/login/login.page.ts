import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,  ReactiveFormsModule]
})
export class LoginPage  {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
    private router = inject(Router);


  loading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
     this.loading = true;
     this.errorMessage = '';

     const { email, password } = this.loginForm.getRawValue();

     try{
      await this.authService.login(email, password);
      console.log('Login successful');
     } catch (error) {
      this.errorMessage = 'Login failed. Please check your credentials and try again.';
     } finally {
      this.loading = false;
     }
     await this.router.navigateByUrl('/app/dashboard');
  }
  

}
