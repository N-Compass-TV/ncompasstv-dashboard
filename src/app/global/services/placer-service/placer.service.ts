import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
    providedIn: 'root',
})
export class PlacerService extends BaseService {
    get_all_placer(page: number, keyword: string, sortColumn: string, sortOrder: string, filter: string, month: string, pageSize: number) {
        const url = `${this.getters.api_get_placer}?page=${page}&search=${keyword}&sortColumn=${sortColumn}&sortOrder=${sortOrder}&filter=${filter}&month=${month}&pageSize=${pageSize}`;
        return this.getRequest(url);
    }
}
