import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../../modules/auth/services/user.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getUserFromToken().pipe(
    map((res) => {
      if (!res.data) {
        return true;
      } else {
        router.navigate([`/game/village/${res.data.email}`]);
        return false;
      }
    }),
    catchError(() => {
      router.navigate([`/game/village/${userService.getCurrentUser()?.email}`]);
      return of(true);
    })
  );
};
