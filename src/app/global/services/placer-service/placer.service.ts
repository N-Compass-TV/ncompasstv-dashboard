import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
    providedIn: 'root',
})
export class PlacerService extends BaseService {
    get_all_placer() {
        const url = this.getters.api_get_placer;
        return this.getRequest(url);
    }
}
