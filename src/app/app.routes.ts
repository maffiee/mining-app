import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then( m => m.LoginPage),
  },

  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),

    children: [
        {
          path: '',
          redirectTo: 'dashboard',
          pathMatch: 'full'
        },
        {
          path: 'dashboard',
          loadComponent: () => import('./features/dashboard/dashboard.page').then( m => m.DashboardPage)
        },
        {
          path: 'customers',
          loadComponent: () => import('./features/customers/customers.page').then(m => m.CustomersPage),
        },
        {
          path: 'customer-details',
          loadComponent: () => import('./features/customers/customer-details/customer-details.page').then( m => m.CustomerDetailsPage)
        },
        {
          path: 'material-intake',
          loadComponent: () => import('./features/material-intake/material-intake.page').then(m => m.MaterialIntakePage),
        },
        {
          path: 'mineral-processing',
          loadComponent: () => import('./features/mineral-processing/mineral-processing.page').then( m => m.MineralProcessingPage)
        },
        {
          path: 'customer-settlement',
          loadComponent: () => import('./features/customer-settlement/customer-settlement.page').then( m => m.CustomerSettlementPage)
        },
        {
          path: 'customer-payment',
          loadComponent: () => import('./features/customer-payment/customer-payment.page').then( m => m.CustomerPaymentPage)
        },
        {
          path: 'mineral-inventory',
          loadComponent: () => import('./features/mineral-inventory/mineral-inventory.page').then( m => m.MineralInventoryPage)
        },
         {
          path: 'mineral-inventory',
          loadComponent: () => import('./features/mineral-inventory/mineral-inventory.page').then( m => m.MineralInventoryPage)
        },
        {
          path: 'mineral-sales',
          loadComponent: () => import('./features/mineral-sales/mineral-sales.page').then( m => m.MineralSalesPage)
        },
        {
          path: 'company-revenue',
          loadComponent: () => import('./features/company-revenue/company-revenue.page').then( m => m.CompanyRevenuePage)
        },
        {
          path: 'company-expense',
          loadComponent: () => import('./features/company-expense/company-expense.page').then( m => m.CompanyExpensePage)
        },
        {
          path: 'company-profit',
          loadComponent: () => import('./features/company-profit/company-profit.page').then( m => m.CompanyProfitPage)
        },
        {
    path: 'staff',
    loadComponent: () => import('./features/staff/staff.page').then( m => m.StaffPage)
  },
  {
    path: 'staff-payment',
    loadComponent: () => import('./features/staff-payment/staff-payment.page').then( m => m.StaffPaymentPage)
  },



  
],
  },
  
  
  
  
  
  
  
  
  
  
];
