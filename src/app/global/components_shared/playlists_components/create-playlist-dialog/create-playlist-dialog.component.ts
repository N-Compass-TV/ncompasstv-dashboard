import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, startWith, takeUntil } from 'rxjs/internal/operators';
import { forkJoin, Observable, Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material';

import { DealerService, PlaylistService } from 'src/app/global/services';
import { API_DEALER, PAGING } from 'src/app/global/models';

@Component({
	selector: 'app-create-playlist-dialog',
	templateUrl: './create-playlist-dialog.component.html',
	styleUrls: ['./create-playlist-dialog.component.scss']
})
export class CreatePlaylistDialogComponent implements OnInit, OnDestroy {
	createPlaylistForm: FormGroup;
	dealers: API_DEALER[] = [];
	dealerSearchControl = new FormControl('');
	dealersDataPaging: PAGING;
	filteredDealers: Observable<API_DEALER[]>;
	formFields = this._fields;
	hasLoadedDealers = false;
	hasSelectedDealer = false;
	isFormReady = false;
	isLoadingDealers = false;
	isSearchingDealers = false;
	selectedDealerId: string = null;
	title = 'Create Playlist';

	protected _unsubscribe = new Subject<void>();

	constructor(
		private _dealer: DealerService,
		private _dialogRef: MatDialogRef<CreatePlaylistDialogComponent>,
		private _playlist: PlaylistService
	) {}

	ngOnInit() {
		this.getDealers();
		this.initializeForm();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	clearDealerSelection() {
		this.dealerSearchControl.setValue('');
		this.createPlaylistForm.get('dealerId').setValue(null);
		this.dealerSearchControl.enable();
	}

	createPlaylist() {
		const formValue = this.createPlaylistForm.value;
		const newPlaylistData = { type: 'unset', assets: [], ...formValue };
		this._dialogRef.close(newPlaylistData);

		// return this._playlist
		// 	.create_playlist(newPlaylistData)
		// 	.pipe(takeUntil(this._unsubscribe))
		// 	.subscribe({
		// 		next: () => {
		// 			this._dialogRef.close('success');
		// 		},
		// 		error: (e) => {
		// 			console.error('Error creating playlist', e);
		// 			this._dialogRef.close('error');
		// 		}
		// 	});
	}

	dealerSelected(dealerId: string) {
		this.selectedDealerId = dealerId;
		this.hasSelectedDealer = true;
		this.createPlaylistForm.get('dealerId').setValue(dealerId);
		this.dealerSearchControl.disable();
	}

	private closeCreatePlaylistDialog() {
		this._dialogRef.close();
	}

	private getDealers(page = 1) {
		this.isLoadingDealers = true;
		const pageSize = 50;

		this._dealer
			.get_dealers_with_page_minified(page, '', pageSize)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe({
				next: (data) => {
					if (data.message) {
						this.isLoadingDealers = false;
						return;
					}

					const dealers = data.paging.entities as API_DEALER[];
					this.dealers = [...dealers];

					let remainingRequests: Observable<{ paging?: PAGING; message?: string }>[] = [];
					const currentPage = data.paging.page;
					const lastPage = data.paging.pages;

					if (currentPage < lastPage) {
						for (let i = currentPage; i < lastPage; i++) {
							remainingRequests.push(this._dealer.get_dealers_with_page_minified(i + 1, '', pageSize));
						}
					}

					forkJoin(remainingRequests)
						.pipe(takeUntil(this._unsubscribe))
						.subscribe({
							next: (response) => {
								response.forEach((r) => {
									this.dealers = this.dealers.concat(r.paging.entities);
								});

								this.subscribeToDealerSearch();
								this.isLoadingDealers = false;
								this.hasLoadedDealers = true;
							}
						});
				},
				error: (e) => {
					console.error('Could not load dealers', e);
				}
			});
	}

	private initializeForm() {
		const configs = {};

		this._fields.forEach((field) => {
			configs[field.name] = new FormControl(field.value);
			if (field.is_required) (configs[field.name] as FormControl).setValidators(Validators.required);
			if (typeof field.max_length !== 'undefined') (configs[field.name] as FormControl).setValidators(Validators.maxLength(field.max_length));
		});

		this.createPlaylistForm = new FormGroup(configs);
		this.isFormReady = true;
	}

	private subscribeToDealerSearch() {
		this.filteredDealers = this.dealerSearchControl.valueChanges.pipe(
			startWith(''),
			debounceTime(300),
			takeUntil(this._unsubscribe),
			map((keyword: string) => (keyword ? this._filterDealers(keyword) : this.dealers.slice()))
		);
	}

	private _filterDealers(value: string): API_DEALER[] {
		const keyword = value.toLowerCase();
		return this.dealers.filter((dealer) => dealer.businessName.toLowerCase().includes(keyword));
	}

	protected get _fields() {
		return [
			{ name: 'playlistName', label: 'Name', type: 'text', value: null, is_required: true, is_hidden: false, max_length: 50 },
			{ name: 'playlistDescription', label: 'Description', type: 'text', value: null, is_required: true, is_hidden: false, max_length: 100 },
			{ name: 'dealerId', label: 'Dealer', type: 'autocomplete', value: null }
		];
	}
}
