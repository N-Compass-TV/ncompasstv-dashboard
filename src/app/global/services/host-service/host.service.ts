import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth-service/auth.service';
import { environment } from '../../../../environments/environment';
import { API_HOST } from '../../models/api_host.model';
import { CustomFieldGroup } from '../../models/host-custom-field-group';
import { API_CONTENT, API_FILTERS, API_HOST_CONTENT, PAGING } from '../../models';

@Injectable({
	providedIn: 'root'
})

export class HostService {

	title: string = "Hosts";
	token = JSON.parse(localStorage.getItem('tokens'));
	onUpdateBusinessHours = new EventEmitter<boolean>();

	httpOptions = {
		headers: new HttpHeaders(
			{ 'Authorization': `Bearer ${this._auth.current_user_value.jwt.token}`}
		)
	};

	constructor(
		private _http: HttpClient,
		private _auth: AuthService
	) { }

	add_host(data) {
		return this._http.post<any>(`${environment.base_uri}${environment.create.api_new_host}`, data, this.httpOptions);
	}

	add_host_place(data) {
		return this._http.post<any>(`${environment.base_uri}${environment.create.api_new_host_place}`, data, this.httpOptions);
	}

	delete_host(hostIds: string[], forceDelete: boolean) {
		const data = { hostIds, forceDelete };
		return this._http.post(`${environment.base_uri}${environment.delete.host}`, data, this.httpOptions);
	}

	delete_file(s3FileName: string) {
		return this._http.post(`${environment.base_uri}${environment.delete.host_file_amazon_s3}?filename=${s3FileName}`, {}, this.httpOptions);
	}

	export_host(id) {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.export_hosts}${id}`, this.httpOptions);
	}
	
    get_licenses_per_state() {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_host_licenses_by_state}`, this.httpOptions);
	}
    
    get_licenses_per_state_details(state) {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_host_licenses_by_state_details}${state}`, this.httpOptions).map(data => data.dealerState);
	}

	/**
	 * @description Get all the contents assigned to a host
	 * @param hostId 
	 * @returns Observable<{ contents?: API_CONTENT[], paging?: PAGING, message?: string }>
	 */
	get_contents(hostId: string, page = 1) {
		const url = `${environment.base_uri}${environment.getters.contents_by_host}?hostId=${hostId}&page=${page}`;
		return this._http.get<{ contents?: API_HOST_CONTENT[], paging?: PAGING, message?: string }>(url);
	}

	get_content_by_host_id(id: string) {
		return this._http.get(`${environment.base_uri}${environment.getters.content_by_host_id}?hostId=${id}`, this.httpOptions);
	}

	/**
	 * @description Get all files of a host by type. Type 1 is images and 2 is for documents.
	 * @param hostId: string 
	 * @param type: number = 1 (images) | 2 (documents)
	 * @param page: number
	 * @returns PAGING
	 */
	get_files_by_type(hostId: string, type = 1, page = 1) {
		const base = `${environment.base_uri}${environment.getters.host_files}`;
		const params = this.setUrlParams({ hostId, type, page })
		const url = `${base}${params}`;
		return this._http.get<PAGING>(url);
	}

	get_host() {
		return this._http.get<API_HOST>(`${environment.base_uri}${environment.getters.api_get_hosts}`, this.httpOptions).map(data => data.host);
	}

    get_host_statistics(dealer?, startDate?, endDate?) {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_hosts_statistics}`+'?dealerid='+`${dealer}`+'&startdate='+`${startDate}`+'&enddate='+`${endDate}`, this.httpOptions);
	}
	
	get_host_search(key) {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_hosts}`+'?search='+`${key}`, this.httpOptions);
	}
	
	get_host_by_page(page: number, search: string, sortColumn?, sortOrder?, pageSize = 15) {
		const base = `${environment.base_uri}${environment.getters.api_get_hosts}`;
		const params = this.setUrlParams({ page, search, sortColumn, sortOrder, pageSize });
		const url = `${base}${params}`;
		return this._http.get<{  host?: API_HOST[], paging?: PAGING, message?: string }>(url , this.httpOptions);
	}

	get_host_by_dealer_id(id: any, page: number, key: string, pageSize = 15) {
		return this._http.get<{ paging?: PAGING, message?: string }>(`${environment.base_uri}${environment.getters.api_get_host_by_dealer}${id}`+'&page='+`${page}`+'&search='+`${key}`+'&pageSize='+`${pageSize}`, this.httpOptions);
	}

    get_host_by_dealer_id_with_sort(dealerId: string, page: number, search: string, sortColumn: string, sortOrder: string, pageSize = 15) {
		const base = `${environment.base_uri}${environment.getters.api_get_host_by_id_optimized}`;
		const params = this.setUrlParams({ dealerId, page, search, sortColumn, sortOrder, pageSize });
		const url = `${base}${params}`;
		return this._http.get<any>(url, this.httpOptions);
	}
	
	get_host_for_dealer_id(id) {
		return this._http.get<API_HOST[]>(`${environment.base_uri}${environment.getters.api_get_host_for_dealer}${id}`, this.httpOptions);
	}

	get_host_by_id(id) {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_host_by_id}${id}`, this.httpOptions);
	}

	get_host_report(data) {
		return this._http.post<any>(`${environment.base_uri}${environment.getters.api_get_host_report}`, data, this.httpOptions);
	}

	update_single_host(data) {
		return this._http.post<any>(`${environment.base_uri}${environment.update.api_update_host}`, data, this.httpOptions);
	}
	
	get_time_zones() {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_timezone}`, this.httpOptions)
	}

	get_host_place_images(placeId: string) {
		const url = `${environment.base_uri}${environment.getters.host_place_images}?placeId=${placeId}`;
		return this._http.get<{ images: string[] }>(url);
	}

	get_host_total() {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_host_total}`, this.httpOptions)
	}

	get_host_total_per_dealer(id) {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_host_total_per_dealer}${id}`, this.httpOptions)
	}

	get_fields() {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_host_fields}`, this.httpOptions);
	}

	get_field_by_id(data: string) {
		return this._http.get<any>(`${environment.base_uri}${environment.getters.api_get_host_field_by_id}${data}`, this.httpOptions);
	}

	create_field_group(data: CustomFieldGroup) {
		return this._http.post<any>(`${environment.base_uri}${environment.create.api_create_field_group}`, data, this.httpOptions);
	}

	create_field_group_value(data: any) {
		return this._http.post<any>(`${environment.base_uri}${environment.create.api_fieldgroup_value_create}`, data, this.httpOptions);
	}

	private setUrlParams(filters: API_FILTERS, enforceTagSearchKey = false) {

		let result = '';
		
		Object.keys(filters).forEach(
			key => {

				if (typeof filters[key] === 'undefined') return;
				
				if (!result.includes('?')) result += `?${key}=`;
				else result += `&${key}=`;

				if (enforceTagSearchKey && key === 'search' && filters['search'] && filters['search'].trim().length > 1 && !filters['search'].startsWith('#')) filters['search'] = `#${filters['search']}`;
				if (typeof filters[key] === 'string' && filters[key].includes('#')) result += encodeURIComponent(filters[key]); 
				else result += filters[key];

			}
		);

		return result

	}
}
