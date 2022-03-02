import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from '../base.service';
import { API_HOST, API_TIMEZONE, CustomFieldGroup, HOST_S3_FILE, PAGING } from 'src/app/global/models';

@Injectable({
	providedIn: 'root'
})

export class HostService extends BaseService {

	onUpdateBusinessHours = new EventEmitter<boolean>();

	add_host(data: any) {
		const url = this.creators.api_new_host;
		return this.postRequest(url, data);
	}

	add_host_place(data: any) {
		const url = this.creators.api_new_host_place;
		return this.postRequest(url, data);
	}

	create_field_group(data: CustomFieldGroup) {
		const url = `${this.creators.api_create_field_group}`;
		return this.postRequest(url, data);
	}

	create_field_group_value(data: any) {
		const url = `${this.creators.api_fieldgroup_value_create}`;
		return this.postRequest(url, data);
	}

	delete_host(hostIds: string[], forceDelete: boolean) {
		const data = { hostIds, forceDelete };
		const url = this.deleters.host;
		return this.postRequest(url, data);
	}

	delete_file(s3FileName: string) {
		const url = `${this.deleters.host_file_amazon_s3}?filename=${s3FileName}`;
		const body = {};
		return this.postRequest(url, body);
	}

	export_host(id: string) {
		const url = `${this.getters.export_hosts}${id}`;
		return this.getRequest(url);
	}
	
    get_licenses_per_state() {
		const url = this.getters.api_get_host_licenses_by_state;
		return this.getRequest(url);
	}
    
    get_licenses_per_state_details(state: string) {
		const url = `${this.getters.api_get_host_licenses_by_state_details}${state}`;
		return this.getRequest(url).map(data => data.dealerState);
	}

	/**
	 * @description Get all the contents assigned to a host
	 * @param hostId 
	 * @returns Observable<{ contents?: API_CONTENT[], paging?: PAGING, message?: string }>
	 */
	get_contents(hostId: string, page = 1) {
		const url = `${this.getters.contents_by_host}?hostId=${hostId}&page=${page}`;
		return this.getRequest(url);
	}

	get_content_by_host_id(id: string) {
		const url = `${this.getters.content_by_host_id}?hostId=${id}`;
		return this.getRequest(url);
	}

	/**
	 * @description Get all files of a host by type. Type 1 is images and 2 is for documents.
	 * @param hostId: string 
	 * @param type: number = 1 (images) | 2 (documents)
	 * @param page: number
	 * @returns PAGING
	 */
	get_files_by_type(hostId: string, type = 1, page = 1): Observable<PAGING> {
		const base = `${this.getters.host_files}`;
		const params = this.setUrlParams({ hostId, type, page })
		const url = `${base}${params}`;
		return this.getRequest(url);
	}

	get_host(): Observable<API_HOST> {
		const url = `${this.getters.api_get_hosts}`;
		return this.getRequest(url).map(data => data.host);
	}

    get_host_statistics(dealerId?: string, startDate?: string, endDate?: string) {
		const url = `${this.getters.api_get_hosts_statistics}?dealerid=${dealerId}&startdate=${startDate}&enddate=${endDate}`;
		return this.getRequest(url);
	}
	
	get_host_search(key: string) {
		const url = `${this.getters.api_get_hosts}`+'?search='+`${key}`;
		return this.getRequest(url);
	}

	get_host_categories(page: number, key: string, dealerId: string, pageSize= 15) {
		const url = `${this.getters.api_get_hosts_categories}?search=${key}&page=${page}&pageSize=${pageSize}&dealerId=${dealerId}`;
		return this.getRequest(url);
	}

	get_host_states(page: number, key: string, dealerId: string, pageSize = 15) {
		const url = `${this.getters.api_get_hosts_states}?search=${key}&page=${page}&pageSize=${pageSize}&dealerId=${dealerId}`;
		return this.getRequest(url);
	}
	
	get_host_by_page(page: number, search: string, sortColumn = '', sortOrder = '', pageSize = 15): Observable<{ host?: API_HOST[], paging?: PAGING, message?: string }> {
        const base = `${this.getters.api_get_hosts}`;
		const params = this.setUrlParams({ page, search, sortColumn, sortOrder, pageSize }, false, true);
		const url = `${base}${params}`;
		return this.getRequest(url);
	}

	get_host_by_dealer_id(id: any, page: number, key: string, pageSize = 15): Observable<{ paging?: PAGING, message?: string }> {

		let url = `${this.getters.api_get_host_by_dealer}${id}&page=${page}&pageSize=${pageSize}`;
		
		if (key && key.trim().length > 0) {
			const search = encodeURIComponent(key);
			url += `&search=${search}`
		}

		return this.getRequest(url);
		
	}

    get_host_by_dealer_id_with_sort(dealerId: string, page: number, search: string, sortColumn: string, sortOrder: string, pageSize = 15) {
		const base = `${this.getters.api_get_host_by_id_optimized}`;
		const params = this.setUrlParams({ dealerId, page, search, sortColumn, sortOrder, pageSize });
		const url = `${base}${params}`;
		return this.getRequest(url);
	}
	
	get_host_for_dealer_id(id: string): Observable<API_HOST[]> {
		const url = `${this.getters.api_get_host_for_dealer}${id}`;
		return this.getRequest(url);
	}

	get_host_by_id(id: string) {
		const url = `${this.getters.api_get_host_by_id}${id}`;
		return this.getRequest(url);
	}

	get_host_report(data: any) {
		const url = `${this.getters.api_get_host_report}`;
		return this.postRequest(url, data);
	}

	update_single_host(data: any) {
		const url = `${this.updaters.api_update_host}`;
		return this.postRequest(url, data);
	}
	
	get_time_zones(): Observable<API_TIMEZONE[]> {
		const url = `${this.getters.api_get_timezone}`;
		return this.getRequest(url);
	}

	get_host_place_images(placeId: string): Observable<{ images: string[] }> {
		const url = `${this.getters.host_place_images}?placeId=${placeId}`;
		return this.getRequest(url);
	}

	get_host_total() {
		const url = `${this.getters.api_get_host_total}`;
		return this.getRequest(url);
	}

	get_host_total_per_dealer(id: string) {
		const url = `${this.getters.api_get_host_total_per_dealer}${id}`;
		return this.getRequest(url);
	}

	get_fields() {
		const url = `${this.getters.api_get_host_fields}`;
		return this.getRequest(url);
	}

	get_field_by_id(id: string) {
		const url = `${this.getters.api_get_host_field_by_id}${id}`;
		return this.getRequest(url);
	}

	update_file_alias(id: string, alias: string) {
		const url = this.updaters.host_file_alias;
		const body = { id, alias };
		return this.postRequest(url, body);
	}

	upload_s3_files(body: HOST_S3_FILE) {
		const url = this.creators.host_s3_files;
		return this.postRequest(url, body);
	}

}
