import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable, Subject, forkJoin } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { API_LICENSE, API_LICENSE_PROPS, PAGING } from 'src/app/global/models';

import { LicenseService } from 'src/app/global/services';
@Component({
	selector: 'app-assign-license-modal',
	templateUrl: './assign-license-modal.component.html',
	styleUrls: ['./assign-license-modal.component.scss']
})
export class AssignLicenseModalComponent implements OnInit, OnDestroy {
	assign_status: boolean = false;
	assign_success: boolean = false;
	assigned_licenses = [];
	available_licenses = [];
	finish_fetching: boolean = false;
	is_submitted: boolean = false;
	license_handler: any;
	license_page_count: number = 1;
	licenses: any[] = [];
	loading_data: boolean = true;
	no_available_licenses: boolean = false;
	timeOutDuration = 1000;

	protected _unsubscribe = new Subject<void>();

	constructor(private _license: LicenseService, @Inject(MAT_DIALOG_DATA) public _dialog_data: any) {}

	ngOnInit() {
		this.getAvailableLicenses();
	}

	ngOnDestroy() {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	assignLicenses(): void {
		this.is_submitted = true;

		const license_host_data = {
			host: { hostid: this._dialog_data.host_id },

			licenses: this.assigned_licenses.map((id) => {
				return { licenseid: id };
			})
		};

		this._license
			.assign_licenses_to_host(license_host_data)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe(
				() => (this.assign_success = true),
				(error) => {
					throw new Error(error);
				}
			);
	}

	licenseAssigned(license: string, e: { checked: boolean }): void {
		if (e.checked === false) {
			this.assigned_licenses.splice(this.assigned_licenses.indexOf(license), 1);
		} else {
			if (!this.assigned_licenses.includes(license)) {
				this.assigned_licenses.push(license);
			}
		}
	}

	private async getAvailableLicenses() {
		const dealerId = this._dialog_data.dealer_id;
		let totalRequests: number;
		let firstPageResult: { paging?: PAGING; message?: string };
		let getLicenseRequests = [];
		let merged = [];

		try {
			const firstPageRequest = this._license
				.get_license_by_dealer_id(dealerId, 1, '', 'online', 15, '')
				.map((response) => {
					response.paging.entities = response.paging.entities.filter(
						(license: API_LICENSE_PROPS) => !license.hostId || (license.hostId && license.hostId.length <= 0)
					);
					return response;
				})
				.toPromise();

			firstPageResult = await firstPageRequest;
		} catch (error) {
			throw new Error(error);
		}

		if ('message' in firstPageResult) {
			this.no_available_licenses = true;
			return;
		}

		merged = merged.concat(
			(firstPageResult.paging.entities as API_LICENSE_PROPS[]).filter(
				(license) => !license.hostId || (license.hostId && license.hostId.length <= 0)
			)
		);
		totalRequests = Math.round(firstPageResult.paging.totalEntities / 15);

		for (let i = 1; i < totalRequests; i++) {
			const page = i + 1;
			getLicenseRequests.push(this._license.get_license_by_dealer_id(dealerId, page, '', 'online', 15, ''));
		}

		forkJoin(getLicenseRequests)
			.pipe(takeUntil(this._unsubscribe), debounceTime(1000))
			.subscribe(
				(response: { paging: PAGING }[]) => {
					response.forEach((getLicenseResponse) => {
						const licenses = getLicenseResponse.paging.entities as API_LICENSE_PROPS[];
						merged = merged.concat(licenses.filter((license) => !license.hostId || (license.hostId && license.hostId.length <= 0)));
					});

					this.licenses = [...merged];
					this.loading_data = false;
				},
				(error) => {
					throw new Error(error);
				}
			);
	}
}
