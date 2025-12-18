import { Injectable } from '@angular/core';
import { HttpService } from '@shared/services';

@Injectable({ providedIn: 'root' })
export class ClansService {
  constructor(private readonly httpService: HttpService) {}
}
