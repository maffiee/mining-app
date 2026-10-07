import { Component } from '@angular/core';
import { IonMenu, IonRouterOutlet, IonSplitPane } from '@ionic/angular/standalone';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    IonMenu,
    IonRouterOutlet,
    RouterOutlet,
    IonSplitPane,
    SidebarComponent,
    TopbarComponent,
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {}
