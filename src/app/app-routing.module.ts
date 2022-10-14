import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { OtpScreenComponent } from './components/otp-screen/otp-screen.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { SgnupComponent } from "./components/sgnup/sgnup.component";
import { SignupCompleteComponent } from "./components/signup-complete/signup-complete.component"
import { OtpSignupComponent } from "./components/otp-signup/otp-signup.component"
import { CfaIntegrationsComponent } from './components/cfa-integrations/cfa-integrations.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ContactComponent } from './components/contact/contact.component';
import { AdministraterComponent } from './components/administrater/administrater.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { BelletireComponent } from './components/belletire/belletire.component'
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  // { path: 'otp', component: OtpScreenComponent },
  { path: 'resetpassword', component: NewPasswordComponent },
  // { path: 'sign-up', component: SgnupComponent },
  // { path: 'last-signup', component : SignupCompleteComponent },
  // { path: 'otpsignup', component : OtpSignupComponent},
  { path: 'integrating-zoom-with-cfa', component : CfaIntegrationsComponent},
  { path: 'privacy-policy', component : PrivacyPolicyComponent},
  { path: 'contact', component : ContactComponent},
  { path: 'administrator', canActivate: [AdminGuard], component : AdministraterComponent},
  { path: 'terms-and-conditions', component : TermsAndConditionsComponent},
  { path: 'reviewrecording', component : BelletireComponent},
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', useHash : true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
