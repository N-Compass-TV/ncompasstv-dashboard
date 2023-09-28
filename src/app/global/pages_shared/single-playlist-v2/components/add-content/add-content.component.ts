import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { API_CONTENT_V2, API_HOST, API_LICENSE } from 'src/app/global/models';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { AddPlaylistContent } from '../../class/AddPlaylistContent';
import { FormControl } from '@angular/forms';
import { CONTENT_TYPE } from '../../constants/ContentType';
import { ButtonGroup } from '../../type/ButtonGroup';

@Component({
	selector: 'app-add-content',
	templateUrl: './add-content.component.html',
	styleUrls: ['./add-content.component.scss']
})
export class AddContentComponent implements OnInit, OnDestroy {
	activeEdits: boolean;
	assets: API_CONTENT_V2[] = [];
	contentTypes: ButtonGroup[] = CONTENT_TYPE;
	currentPage: number = 1;
	gridCount = 8;
	hasImageAndFeed: boolean;
	markedContent: API_CONTENT_V2;
	newContentsSettings: AddPlaylistContent = new AddPlaylistContent();
	noData: boolean = false;
	pageLimit: number = 0;
	paginating: boolean = false;
	playlistHostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[] = [];
	searchInput: FormControl = new FormControl('');
	searching: boolean = false;
	selectedContents: API_CONTENT_V2[] = [];
	selectedContentType: ButtonGroup = this.contentTypes[0];
	toggleAll = new Subject<void>();
	protected _unsubscribe = new Subject<void>();

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public _dialog_data: {
			assets: API_CONTENT_V2[];
			dealerId: string;
			isDealer: boolean;
			hostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[];
			playlistContentId: string;
			playlistId: string;
		},
		private _playlist: SinglePlaylistService
	) {}

	ngOnInit() {
		this.assets = [...this._dialog_data.assets];
		this.playlistHostLicenses = this._dialog_data.hostLicenses ? [...this._dialog_data.hostLicenses] : [];
		this.newContentsSettings.playlistId = this._dialog_data.playlistId;

		/** Watch Contents Readiness */
		this._playlist.contentLoaded$.subscribe({
			next: (res: API_CONTENT_V2[]) => {
				if (!this.assets.length) this.assets = res;
			}
		});

		/** Watch Hosts Data Readiness */
		this._playlist.hostLoaded$.subscribe({
			next: (res: { host: API_HOST; licenses: API_LICENSE[] }[]) => {
				if (!this.playlistHostLicenses.length && res.length) this.playlistHostLicenses = res;
			}
		});

		this.subscribeToContentScheduleFormChanges();
		this.searchInit();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	public applyContentSettings(settingsData: any) {
		this.newContentsSettings.playlistContentsLicenses = this.newContentsSettings.playlistContentsLicenses.map((c, index) => {
			return {
				...c,
				...settingsData,
				seq: index
			};
		});
	}

	public contentSelected(content: API_CONTENT_V2, e?: any) {
		if (!e.target.checked) this.selectedContents = this.selectedContents.filter((i) => i !== content);
		else this.selectedContents.push(content);

		const schedule = { type: 1 };

		this.newContentsSettings.playlistContentsLicenses = this.selectedContents.map((c, index) => {
			return {
				contentId: c.contentId,
				duration: c.fileType !== 'webm' ? c.duration || 20 : c.duration,
				isFullScreen: 0,
				licenseIds: [],
				seq: index,
				...schedule
			};
		});

		this.hasImageAndFeed = this.selectedContents.filter((p) => p.fileType !== 'webm').length > 0;
	}

	private getContents(floating: boolean = false, page: number = 1, pageSize: number = 60, searchKey?: string) {
		this.noData = false;
		const dealerId = floating ? null : this._dialog_data.dealerId;

		this._playlist
			.contentFetch({
				dealerId,
				floating,
				page,
				pageSize,
				searchKey
			})
			.subscribe({
				next: (response: { contents: API_CONTENT_V2[]; paging: any }) => {
					/** Search result empty */
					if (!response.contents || !response.contents.length) {
						this.noData = true;
						return;
					}

					/** Set paging limit */
					if (response.paging) {
						this.pageLimit = response.paging.pages;
					}

					/** Paginating */
					if (page > 1 && page <= this.pageLimit) {
						this.assets = [...this.assets, ...response.contents];
						this.paginating = false;
						return true;
					}

					/** Search results available */
					this.assets = [...response.contents];
					this.searching = false;
				}
			});
	}

	public licenseIdToggled(licenseIds: string[]) {
		this.newContentsSettings.playlistContentsLicenses = this.newContentsSettings.playlistContentsLicenses.map((c) => {
			if (!c.licenseIds) c.licenseIds = [];

			return {
				...c,
				licenseIds: licenseIds
			};
		});
	}

	public markContent(content: API_CONTENT_V2) {
		if (!this._dialog_data.playlistContentId) return;
		this.markedContent = content;
	}

	public onScroll(e: any): void {
		if (this.paginating) return;

		if (e.target.scrollTop + e.target.clientHeight + 1 >= e.target.scrollHeight) {
			this.paginating = true;
			this.currentPage += 1;
			this.getContents(false, this.currentPage, 60);
		}
	}

	private searchInit() {
		this.searchInput.valueChanges.pipe(takeUntil(this._unsubscribe), debounceTime(1000)).subscribe({
			next: (searchKey) => {
				if (searchKey.length) {
					this.searching = true;
					this.getContents(false, null, null, searchKey);
					return;
				}

				this.assets = [...this._dialog_data.assets];
				this.searching = false;
			}
		});
	}

	private subscribeToContentScheduleFormChanges() {
		this._playlist.schedulerFormUpdated.pipe(takeUntil(this._unsubscribe)).subscribe({
			next: (response) => {
				const contents = Array.from(this.newContentsSettings.playlistContentsLicenses);
				const mappedSchedule = this._playlist.mapScheduleFromUiContent(response);

				this.newContentsSettings.playlistContentsLicenses = contents.map((c) => {
					return { ...c, ...mappedSchedule };
				});
			}
		});
	}
}
