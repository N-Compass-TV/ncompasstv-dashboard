import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { API_CONTENT_V2, API_HOST, API_LICENSE_PROPS, PlaylistContentSchedule, UI_CONTENT_SCHEDULE } from 'src/app/global/models';
import { SavePlaylistContentUpdate } from '../../models';
import { BlacklistUpdates } from '../../type/PlaylistContentUpdate';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { IsvideoPipe } from 'src/app/global/pipes';
import * as moment from 'moment';

@Component({
	selector: 'app-content-settings',
	templateUrl: './content-settings.component.html',
	styleUrls: ['./content-settings.component.scss'],
	providers: [IsvideoPipe]
})
export class ContentSettingsComponent implements OnInit, OnDestroy {
	hasImageAndFeed;
	playlistContent: SavePlaylistContentUpdate = {
		contentUpdates: [],
		blacklistUpdates: {
			playlistContentId: '',
			licenses: []
		}
	};
	toggleAll = new Subject<void>();
	loadingWhitelistedLicenses = true;
	whitelistedLicenses: string[] = [];
	whitelistedHosts: string[] = [];
	blacklist: BlacklistUpdates = {
		playlistContentId: '',
		licenses: []
	};

	playlistContentScheduleId = this.contentData.playlistContents[0].playlistContentsScheduleId;
	protected _unsubscribe = new Subject<void>();

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public contentData: {
			playlistContents: API_CONTENT_V2[];
			hostLicenses: { host: API_HOST; licenses: API_LICENSE_PROPS[] }[];
			bulkSet: boolean;
		},
		private _playlist: SinglePlaylistService,
		private _video: IsvideoPipe
	) {}

	ngOnInit() {
		this.playlistContent.blacklistUpdates.playlistContentId = this.contentData.playlistContents[0].playlistContentId;
		this.hasImageAndFeed = this.contentData.playlistContents.filter((p) => p.fileType !== 'webm').length > 0;

		this._playlist.hostLoaded$.subscribe({
			next: (res: { host: API_HOST; licenses: API_LICENSE_PROPS[] }[]) => {
				if (this.contentData && !this.contentData.hostLicenses) {
					this.contentData.hostLicenses = res;
					this.getPlaylistContentWhitelistData();
				}
			}
		});

		this.getPlaylistContentWhitelistData();
		this.subscribeToContentSchedulerFormChanges();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	private getPlaylistContentWhitelistData() {
		if (this.contentData.bulkSet || (this.contentData && !this.contentData.hostLicenses)) return;

		this._playlist.getWhitelistData(this.contentData.playlistContents[0].playlistContentId).subscribe({
			next: (res: { licensePlaylistContents: any[] }) => {
				this.loadingWhitelistedLicenses = false;

				if (!res.licensePlaylistContents) return;
				this.whitelistedLicenses = res.licensePlaylistContents.map((i) => i.licenseId);
				this.whitelistedHosts = res.licensePlaylistContents.map((i) => i.hostId);
			}
		});
	}

	public licensesToBlacklist(licenseIds: string[]) {
		this.playlistContent.blacklistUpdates.licenses = licenseIds;
	}

	public licenseIdToggled(licenseIds: string[]) {
		/** Single Playlist Content Edit */
		if (!this.contentData.bulkSet) {
			this.playlistContent.contentUpdates = [
				{
					...(this.playlistContent.contentUpdates && this.playlistContent.contentUpdates[0]),
					licenseIds,
					playlistContentId: this.contentData.playlistContents[0].playlistContentId
				}
			];

			return;
		}

		/** Multiple Playlist Content Edit, Duration applies to non video filetype only */
		const contentData: any = this.playlistContent.contentUpdates.length ? this.playlistContent.contentUpdates : this.contentData.playlistContents;
		this.playlistContent.contentUpdates = contentData.map((p) => {
			return {
				...p,
				playlistContentId: p.playlistContentId,
				licenseIds
			};
		});
	}

	public onSelectType(event: any) {}

	/**
	 * @param data - Playlist content setting changes
	 */
	public playlistContentModified(data: any) {
		/** Single Playlist Content Edit */
		if (!this.contentData.bulkSet) {
			this.playlistContent.contentUpdates = [
				{
					...(this.playlistContent.contentUpdates && this.playlistContent.contentUpdates[0]),
					...data,
					playlistContentId: this.contentData.playlistContents[0].playlistContentId,
					duration: this._video.transform(this.contentData.playlistContents[0].fileType)
						? this.contentData.playlistContents[0].duration
						: data.duration || this.playlistContent.contentUpdates[0].duration
				}
			];
			return;
		}

		/** Multiple Playlist Content Edit, Duration applies to non video filetype only */
		const contentData: any = this.playlistContent.contentUpdates.length ? this.playlistContent.contentUpdates : this.contentData.playlistContents;
		this.playlistContent.contentUpdates = contentData.map((p) => {
			return {
				playlistContentId: p.playlistContentId,
				...data,
				duration: this._video.transform(p.fileType) ? p.duration : data.duration || p.duration
			};
		});
	}

	private mapContentScheduleForSubmission(data: UI_CONTENT_SCHEDULE, playlistContentId: string) {
		const result = {} as PlaylistContentSchedule;
		const contents = this.contentData.playlistContents;

		switch (data.type) {
			case 1:
			case 2:
				result.type = data.type;
				result.playlistContentsScheduleId = contents.find((c) => c.playlistContentId === playlistContentId).playlistContentId;
				break;
			default:
				const DATE_FORMAT = 'YYYY-MM-DD';
				const TIME_FORMAT = 'hh:mm A';

				Object.keys(data).forEach((key) => {
					if (typeof data[key] === 'undefined' || (!data[key] && typeof data[key] !== 'number')) return;

					switch (key) {
						case 'days':
							result.days = data.days
								.filter((day) => day.checked)
								.map((day) => day.day)
								.join(',');
							break;
						case 'playTimeStartData':
						case 'playTimeEndData':
							let toParse = key === 'playTimeStartData' ? data.playTimeStartData : data.playTimeEndData;
							const resultKey = key === 'playTimeStartData' ? 'playTimeStart' : 'playTimeEnd';
							result[resultKey] = moment(`${toParse.hour}:${toParse.minute}`, 'HH:mm').format(TIME_FORMAT);
							break;
						case 'startDate':
						case 'endDate':
							const parsedDate = moment(`${data[key]}`).format(DATE_FORMAT);
							if (key === 'startDate') result.from = parsedDate;
							else result.to = parsedDate;

							break;
						default:
							result[key] = data[key];
					}
				});

				result.from += ` ${result.playTimeStart}`;
				result.to += ` ${result.playTimeEnd}`;
				result.playlistContentsScheduleId = contents.find((c) => c.playlistContentId === playlistContentId).playlistContentsScheduleId;
		}

		return result;
	}

	private subscribeToContentSchedulerFormChanges() {
		this._playlist.schedulerFormUpdated.pipe(takeUntil(this._unsubscribe)).subscribe((response) => {
			this.playlistContent.contentUpdates = this.playlistContent.contentUpdates.map((contentUpdate) => {
				contentUpdate.schedule = this.mapContentScheduleForSubmission(response, contentUpdate.playlistContentId);
				return contentUpdate;
			});
		});
	}
}
