import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../base.service';
import { AuthService } from 'src/app/global/services/auth-service/auth.service';

@Injectable({
	providedIn: 'root'
})
export class FillerService extends BaseService {
	http_options = {
		headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' })
	};

	constructor(_auth: AuthService, _http: HttpClient) {
		super(_auth, _http);
	}

	add_filler_group(data: any) {
		const url = this.creators.api_new_filler_group;
		return this.postRequest(url, data);
	}

	get_filler_groups(page: number, key: string, pageSize) {
		let url = `${this.getters.api_get_filler_groups}?page=${page}&pageSize=${pageSize}`;

		if (key && key.trim().length > 0) {
			const search = encodeURIComponent(key);
			url += `&search=${search}`;
		}

		return this.getRequest(url);
	}

	get_filler_group_by_id(id: string) {
		let url = `${this.getters.api_get_filler_group_by_id}?id=${id}`;
		return this.getRequest(url);
	}

	update_filler_group_photo(data: any) {
		const url = this.updaters.api_update_filler_group_photo;
		return this.postRequest(url, data);
	}
}
