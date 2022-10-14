import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BasicAuthInterceptor, ErrorInterceptor } from './helpers';
import { NgOtpInputModule } from 'ng-otp-input';
import { OtpScreenComponent } from './components/otp-screen/otp-screen.component';
import { SgnupComponent } from "./components/sgnup/sgnup.component";
import {NewPasswordComponent} from "./components/new-password/new-password.component";
import { SignupCompleteComponent } from './components/signup-complete/signup-complete.component';
import { OtpSignupComponent } from './components/otp-signup/otp-signup.component';
import { CfaIntegrationsComponent } from './components/cfa-integrations/cfa-integrations.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ContactComponent } from './components/contact/contact.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
// import { AthenaModule } from '@convirza/athena'
import { environment } from '../environments/environment';
import { AdministraterComponent } from './components/administrater/administrater.component';
import { BelletireComponent } from './components/belletire/belletire.component'
import { SharedModule } from './modules/shared/shared.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotPasswordComponent,
    NotFoundComponent,
    OtpScreenComponent,
    SgnupComponent,
    NewPasswordComponent,
    SignupCompleteComponent,
    OtpSignupComponent,
    CfaIntegrationsComponent,
    PrivacyPolicyComponent,
    ContactComponent,
    TermsAndConditionsComponent,
    AdministraterComponent,
    BelletireComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    // * MATERIAL IMPORTS
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    // * flex layout Import
    FlexLayoutModule,
    // * angular matrrial form for login
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    // * mat recording table
    HttpClientModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    NgOtpInputModule,
    FormsModule,
    MatTabsModule,
    SharedModule,
    MatSliderModule,
    // AthenaModule.forRoot({
    //   api_url: environment.cfaApiUrl,
    //   internal_key: environment.cfaInternalKey
    // })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
