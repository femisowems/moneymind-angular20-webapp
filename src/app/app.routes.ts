import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { PrivacyPolicyComponent } from './components/privacy-policy.component';
import { TermsOfServiceComponent } from './components/terms-of-service.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'MoneyMind Dashboard' },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Privacy Policy | MoneyMind' },
  { path: 'terms-of-service', component: TermsOfServiceComponent, title: 'Terms of Service | MoneyMind' },
  { path: '**', redirectTo: '' }
];
