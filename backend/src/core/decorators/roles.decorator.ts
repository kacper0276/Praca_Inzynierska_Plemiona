import { SetMetadata } from '@nestjs/common';

export const Roler = (...roles: string[]) => SetMetadata('roles', roles);
