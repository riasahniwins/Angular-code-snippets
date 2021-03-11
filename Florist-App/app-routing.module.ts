/*** Angular core modules ***/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/*** Components ***/
import { HomeComponent } from './Home/Home.Componenet';
import { LoginComponent } from './CoreModule/Components/Login/Login.Component';
import { AuthResponseComponent } from './CoreModule/Components/AuthResponse/AuthResponse.component';

import { RedirectingComponent } from './CoreModule/Components/Redirecting/Redirecting.component';
import { ForgotPasswordComponent } from './CoreModule/Components/ForgotPassword/ForgotPassword.Component';

/*** Services ***/ 
import { AuthGuardService } from './Home/AuthGuard.service';
import { PermissionResolverService } from './SharedModules/Resolver/PermissionResolver.service';
import { PermissionRouteResolver } from './RouteResolvers/PermissionRouteResolver';
// import { LoginGuardService } from './SharedModules/Guard/Login.Guard';

/*** Router ***/
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'forgetpassword', component: ForgotPasswordComponent},
  { path: 'login', component: LoginComponent},
  { path: 'redirecting', component: RedirectingComponent},
  { path: 'authrsp', component: AuthResponseComponent, resolve:{data:PermissionRouteResolver}},
  { path: '', component: HomeComponent, children: [
      { path: 'crm', canActivate:[AuthGuardService], loadChildren: () => import('./FeatureModules/CRM/Crm.module').then(m => m.CRMModule) },
      { path: 'dashboard',  canActivate:[AuthGuardService], loadChildren: () => import('./FeatureModules/Dashboard/Dashboard.Module').then(m => m.DashboardModule) },
      { path: 'admin', canActivate:[AuthGuardService], resolve: {permission: PermissionResolverService}, loadChildren: () => import('./FeatureModules/Admin/Admin.Module').then(m => m.AdminModule) },
      { path: 'accounting', canActivate:[AuthGuardService], loadChildren: () => import('./FeatureModules/accounting/Accounting.Module').then(m => m.AccountingModule) },
      { path: 'reporting', canActivate:[AuthGuardService], loadChildren: () => import('./FeatureModules/reporting/Reporting.Module').then(m => m.ReportingModule) },
      { path: '', canActivate:[AuthGuardService], redirectTo: 'dashboard', pathMatch: 'full'},
      { path: '**', canActivate:[AuthGuardService], redirectTo: 'admin', pathMatch: 'full'},
    ]
  },  
  {path: '**', redirectTo: 'login', pathMatch: 'full'},
];

@NgModule({
  imports: [    
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
