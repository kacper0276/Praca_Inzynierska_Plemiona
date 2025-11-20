import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../../modules/auth/services/user.service';
import { catchError, map, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getUserFromToken().pipe(
    map((res) => {
      if (res.data && res.data.role === 'admin') {
        return true;
      } else {
        router.navigate([`/game/village/${res.data.email}`]);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
