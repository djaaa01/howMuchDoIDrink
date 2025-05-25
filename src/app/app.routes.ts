import { Routes } from '@angular/router';

import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['auth/login']);
const redirectLoggedInToProjects = () => redirectLoggedInTo(['app/home']);

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToProjects },
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'app',
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'home/:id',
        data: {
          prevRoute: 'home',
        },
        loadComponent: () =>
          import('./pages/location/location.component').then(
            (m) => m.LocationComponent
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '',
    redirectTo: 'app/home',
    pathMatch: 'full',
  },
];
