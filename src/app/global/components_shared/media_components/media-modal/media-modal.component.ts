import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { ConfirmationModalComponent } from '../../page_components/confirmation-modal/confirmation-modal.component';
import { API_ADVERTISER, API_CONTENT, API_HOST, PAGING, UI_AUTOCOMPLETE, UI_AUTOCOMPLETE_DATA, UI_ROLE_DEFINITION } from 'src/app/global/models';
import { AdvertiserService, AuthService, ContentService, HostService } from 'src/app/global/services';
import { DealerService } from 'src/app/global/services/dealer-service/dealer.service';
@Component({
	selector: 'app-media-modal',
	templateUrl: './media-modal.component.html',
	styleUrls: ['./media-modal.component.scss']
})
export class MediaModalComponent implements OnInit, OnDestroy {
	advertisers: UI_AUTOCOMPLETE_DATA[] = [];
	advertiser_autocomplete: UI_AUTOCOMPLETE = {
		label: 'Assign to Advertiser',
		placeholder: 'Type advetiser business name',
		data: []
	};
	advertiser_data: any[] = [];
	advertiser_name = '';
	assign_data = { dealer: '', host: '', advertiser: '' };
	dealers: UI_AUTOCOMPLETE_DATA[] = [];
	dealer_autocomplete: UI_AUTOCOMPLETE;
	dealer_name = '';
	dealers_data: any = [];
	getting_host_advertiser = false;
	host_autocomplete: UI_AUTOCOMPLETE = {
		label: 'Assign to Host',
		placeholder: 'Type a host business name',
		data: []
	};
	host_name = '';
	hosts_data: any[] = [];
	hosts: UI_AUTOCOMPLETE_DATA[] = [];
	initial_load = false;
	initial_load_host = false;
	initial_load_advertiser = false;
	is_dealer = false;
	is_edit = false;
	is_floating = false;
	loading_data = true;
	loading_advertiser_data = false;
	loading_host_data = false;
	loading_form = false;
	loading_search = false;
	loading_search_advertiser = false;
	loading_search_host = false;
	no_advertiser_found = false;
	no_dealer = true;
	no_dealer_data: boolean;
	no_host_found = false;
	optimize_video_upload: boolean;
	paging: PAGING;
	paging_advertiser: PAGING;
	paging_host: PAGING;
	to_empty = false;

	private advertiserid: string;
	private content_data: API_CONTENT;
	private dealerid: string;
	private filter: any = [];
	private hostid: string;

	protected _unsubscribe = new Subject<void>();

	constructor(
		@Inject(MAT_DIALOG_DATA) public _dialog_data: { dealers: { id: string; value: string }[]; is_edit: boolean },
		private _advertiser: AdvertiserService,
		private _auth: AuthService,
		private _content: ContentService,
		private _dialog: MatDialog,
		private _host: HostService
	) {
		this.optimize_video_upload = localStorage.getItem('optimize_video') == 'false' ? false : true;
		this.dealers = [...this._dialog_data.dealers];
		this.no_dealer = this.dealers.length === 0;
	}

	ngOnInit() {
		if (this._dialog_data) this.is_edit = this._dialog_data.is_edit;
		else this.is_edit = false;

		const roleId = this._auth.current_user_value.role_id;
		const dealerRole = UI_ROLE_DEFINITION.dealer;
		const subDealerRole = UI_ROLE_DEFINITION['sub-dealer'];

		// Setup Role Views Here

		this.setupFormData();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	advertiserSelected(id: string) {
		this.assign_data.advertiser = id;
	}

	checkAssignedValues(): boolean {
		if (!this.assign_data.dealer && !this.assign_data.host && !this.assign_data.advertiser) {
			return false;
		}

		return true;
	}

	dealerSelected(id: string): void {
		this.assign_data.dealer = id;
		this.getHostsAndAdvertisersOfDealer(id);
		return;
	}

	hostSelected(id: string): void {
		this.assign_data.host = id;
	}

	setOptimizedVideoUploadValue(e) {
		localStorage.setItem('optimize_video', e.checked.toString());
	}

	setupFormData() {
		this.dealer_autocomplete = {
			label: 'Assign to Dealer',
			placeholder: 'Type a dealer business name',
			data: this.dealers
		};
	}

	updateData(): void {
		let filter = {};

		if (!this.is_floating) {
			filter = {
				contentid: this.content_data.contentId,
				dealerid: this.assign_data.dealer,
				hostid: this.assign_data.host,
				advertiserid: this.assign_data.advertiser
			};
		} else {
			filter = {
				contentid: this.content_data.contentId,
				dealerid: this.dealerid,
				hostid: this.hostid,
				advertiserid: this.advertiserid
			};
		}

		this.filter.push(filter);

		this._content
			.unassign_content(this.filter)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe(
				(response) => {
					if (!response) return;
					this.openConfirmationModal('success', 'Content assignment successfully edited.', 'Click OK to continue');
				},
				(error) => {
					console.error(error);
				}
			);
	}

	private getHostsAndAdvertisersOfDealer(dealerId: string) {
		// Reset Host and Advertiser Data
		this.advertiser_autocomplete.data = [];
		this.host_autocomplete.data = [];

		// Reset indicators
		this.getting_host_advertiser = true;
		this.no_advertiser_found = false;
		this.no_host_found = false;

		// Make both API calls and wait for their responses
		const hostRequest = this._host.export_host(dealerId).pipe(
			takeUntil(this._unsubscribe),
			catchError((error) => {
				// Log the error for the host request
				console.error('Error fetching hosts:', error);

				// Return an empty array in case of an error to not disrupt the forkJoin
				return of([]);
			})
		);

		const advertiserRequest = this._advertiser.export_advertiser(dealerId).pipe(
			takeUntil(this._unsubscribe),
			catchError((error) => {
				// Log the error for the advertiser request
				console.error('Error fetching advertisers:', error);

				// Return an empty array in case of an error to not disrupt the forkJoin
				return of([]);
			})
		);

		forkJoin([hostRequest, advertiserRequest]).subscribe({
			next: ([hostResponse, advertiserResponse]) => {
				// Process host response if it was successful
				if (hostResponse.hosts && hostResponse.hosts.length > 0) {
					this.hosts = hostResponse.hosts.map((host) => ({
						id: host.hostId,
						value: host.name
					}));

					this.host_autocomplete.data = this.hosts;
				} else {
					this.no_host_found = true;
				}

				// Process advertiser response if it was successful
				if (advertiserResponse.length > 0) {
					this.advertisers = advertiserResponse.map((advertiser) => ({
						id: advertiser.advertiserId,
						value: advertiser.name
					}));

					this.advertiser_autocomplete.data = this.advertisers;
				} else {
					this.no_advertiser_found = true;
				}

				this.getting_host_advertiser = false;
			},
			error: (error) => {
				// Handle error if both requests fail (unlikely due to error handling above)
				this.getting_host_advertiser = false;
				console.error('Error fetching hosts and advertisers:', error);
			}
		});
	}

	private openConfirmationModal(status: string, message: string, data: string) {
		const dialogRef = this._dialog.open(ConfirmationModalComponent, {
			width: '500px',
			height: '350px',
			data: { status, message, data }
		});

		dialogRef.afterClosed().subscribe((response) => {
			this._dialog.closeAll();
		});
	}
}
