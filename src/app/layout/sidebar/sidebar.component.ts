import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'bi bi-speedometer2',
    route: '/app/dashboard',
  },
  {
    label: 'Customers',
    icon: 'bi bi-people-fill',
    route: '/app/customers',
  },
  {
    label: 'Material Intake',
    icon: 'bi bi-box-arrow-in-down',
    route: '/app/material-intake',
  },
  {
    label: 'Mineral Processing',
    icon: 'bi bi-gear-fill',
    route: '/app/mineral-processing',
  },
  {
    label: 'Customer Settlement',
    icon: 'bi bi-wallet2',
    route: '/app/customer-settlement',
  },
  {
    label: 'Customer Payment',
    icon: 'bi bi-cash-stack',
    route: '/app/customer-payment',
  },
  {
    label: 'Mineral Inventory',
    icon: 'bi bi-box-seam',
    route: '/app/mineral-inventory',
  },
  {
    label: 'Mineral Sales',
    icon: 'bi bi-cart-check-fill',
    route: '/app/mineral-sales',
  },
  {
    label: 'Company Revenue',
    icon: 'bi bi-graph-up-arrow',
    route: '/app/company-revenue',
  },
  {
    label: 'Company Expense',
    icon: 'bi bi-receipt',
    route: '/app/company-expense',
  },
  {
    label: 'Company Profit',
    icon: 'bi bi-bar-chart-fill',
    route: '/app/company-profit',
  },
  {
    label: 'Staff',
    icon: 'bi bi-person-badge-fill',
    route: '/app/staff',
  },
  {
    label: 'Staff Payment',
    icon: 'bi bi-person-check-fill',
    route: '/app/staff-payment',
  },
];

  async logout(): Promise<void> {
    await this.authService.logout();

    await this.router.navigate(['/login']);
  }
}