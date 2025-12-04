import { Injectable } from '@angular/core';
import { HttpService } from '@shared/services/http.service';

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  constructor(private readonly httpService: HttpService) {}
}
