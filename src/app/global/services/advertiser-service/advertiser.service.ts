import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from '../base.service';
import { API_ADVERTISER, PAGING } from 'src/app/global/models';

@Injectable({ 
	providedIn: 'root'
})

export class AdvertiserService extends BaseService {
	get_advertisers() {
		return this.getRequest(`${this.getters.api_get_advertisers}`).map(data => data.advertisers);
	}
	
	get_advertisers_total() {
		return this.getRequest(`${this.getters.api_get_advertiser_total}`);
	}
	
	get_advertisers_total_by_dealer(id) {
		return this.getRequest(`${this.getters.api_get_advertiser_total_by_dealer}${id}`, );
	}

	get_advertisers_by_dealer_id(dealer_id: string, page: number, search: string, sortColumn = '', sortOrder = ''): Observable<{ advertisers?: API_ADVERTISER[], paging?: PAGING, message?: string }> {
		const base = `${this.getters.api_get_advertisers_by_dealer_id}`;
		const params = this.setUrlParams({ page, dealer_id, search, sortColumn, sortOrder });
		const url = `${base}${params}`;
		return this.getRequest(url);
	}
	
    get_advertisers_unassigned_to_user(id, page, key, column='', order='') {
		return this.getRequest(`${this.getters.api_get_advertisers_unassigned}${id}`+'&page='+`${page}`+'&search='+`${key}`+'&sortColumn='+`${column}`+'&sortOrder='+`${order}`, );
	}

	get_advertiser_by_id(id, page = ''): Observable<any | { advertiser: any, tags: any[]}> {
		const url = `${this.getters.api_get_advertisers_by_id}${id}`;
		const request = this.getRequest(url, );
		if (page !== 'single-advertiser') return request.map(data => data.advertiser);
		return request;
	}

	get_advertiser_report(data) {
		return this.postRequest(`${this.getters.api_get_advertiser_report}`, data, );
	}

	add_advertiser_profile(data) {
		return this.postRequest(`${this.creators.api_new_advertiser_profile}`, data, );
	}

	search_advertiser(keyword = '') {
		const url = `${this.baseUri}${this.getters.search_advertiser}${keyword}`;
		return this.getRequest(url, );
	}
	
	update_advertiser(data) {
		return this.postRequest(`${this.updaters.api_update_advertiser}`, data, );
	}

	remove_advertiser(id, force) {
		return this.postRequest(`${this.deleters.api_remove_advertiser}${id}&force=${force}`, null, );
	}

}
