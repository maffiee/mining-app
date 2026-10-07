import { Component, inject } from '@angular/core';
import { IonMenuButton } from '@ionic/angular/standalone';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [IonMenuButton],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {

  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
}
