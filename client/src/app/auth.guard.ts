import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      // Add the next route to the query params
      this.router.navigate(['/login'], { queryParams: { next: state.url } });
      return false;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class UserRoleResolver implements Resolve<string> {
  constructor(private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<string> | Promise<string> | string {
    const role = this.authService.getRole();
    return role || '';
  }
}
