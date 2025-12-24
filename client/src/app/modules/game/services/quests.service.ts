import { Injectable } from '@angular/core';
import { HttpService } from '@shared/services';

@Injectable({ providedIn: 'root' })
export class QuestsService {
  constructor(private readonly httpService: HttpService) {}
}
