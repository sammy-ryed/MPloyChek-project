// core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate, CanActivateChild, CanLoad,
  Route, UrlSegment, Router, UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(private auth: AuthService, private router: Router) {}

  canLoad(_route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    return this.auth.isLoggedIn ? true : this.router.createUrlTree(['/auth/login']);
  }

  canActivate(): boolean | UrlTree {
    return this.auth.isLoggedIn ? true : this.router.createUrlTree(['/auth/login']);
  }

  canActivateChild(): boolean | UrlTree {
    return this.canActivate();
  }
}
