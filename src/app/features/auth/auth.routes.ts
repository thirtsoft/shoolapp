import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login-component/login-component';
import { ResetPasswordComponent } from './pages/reset-password-component/reset-password-component';
import { ForgotPasswordComponent } from './pages/forgot-password-component/forgot-password-component';
import { LoginV2Component } from './pages/login-v2-component/login-v2-component';
import { SuccessPasswordHandlerComponent } from './pages/success-password-handler-component/success-password-handler-component';


export const AUTH_ROUTES: Routes = [

  {
    path: '',
    redirectTo: 'login/v2',
    pathMatch: 'full',
  },


  {
    path: 'login/v2',
    component: LoginV2Component
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },

  {
    path: 'mot-de-passe-oublie',
    component: ForgotPasswordComponent
  },

  {
    path: 'success-password/:temporalPassword',
    component: SuccessPasswordHandlerComponent
  },

];
