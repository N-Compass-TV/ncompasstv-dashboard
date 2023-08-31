import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT_V2, API_HOST, API_LICENSE_PROPS, PlaylistContentSchedule, UI_CONTENT_SCHEDULE } from '../../../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { IsvideoPipe } from 'src/app/global/pipes';
import { BlacklistUpdates, PlaylistContent } from '../../type/PlaylistContentUpdate';
import * as moment from 'moment';

@Component({
	selector: 'app-content-settings',
	templateUrl: './content-settings.component.html',
	styleUrls: ['./content-settings.component.scss'],
	providers: [IsvideoPipe]
})
export class ContentSettingsComponent implements OnInit, OnDestroy {
	hasImageAndFeed;
	playlistContent: { contentUpdates: PlaylistContent[]; blacklistUpdates?: BlacklistUpdates } = {
		contentUpdates: [],
		blacklistUpdates: {
			playlistContentId: '',
			licenses: []
		}
	};
	toggleAll: Subject<void> = new Subject<void>();
	loadingWhitelistedLicenses: boolean = true;
	whitelistedLicenses: string[] = [];
	whitelistedHosts: string[] = [];
	blacklist: BlacklistUpdates = {
		playlistContentId: '',
		licenses: []
	};

	playlistContentScheduleId = this.contentData.playlistContents[0].playlistContentsScheduleId;
	private playlistUpdates: any;
	private playlistContentId = this.contentData.playlistContents[0].playlistContentId;
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

	private mapContentScheduleForSubmission(data: UI_CONTENT_SCHEDULE) {
		const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
		const TIME_FORMAT = 'hh:mm A';
		let result = {} as PlaylistContentSchedule;

		Object.keys(data).forEach((key) => {
			if (typeof data[key] === 'undefined' || (!data[key] && typeof data[key] !== 'number')) {
				return;
			}

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
					let parsedDate = moment(data[key]).format(DATE_FORMAT);

					if (key === 'startDate') result.from = parsedDate;
					else result.to = parsedDate;

					break;
				default:
					result[key] = data[key];
			}
		});

		return result;
	}

	private subscribeToContentSchedulerFormChanges() {
		this._playlist.schedulerFormEmitter.pipe(takeUntil(this._unsubscribe)).subscribe((response) => {
			const forSubmission = this.mapContentScheduleForSubmission(response);
			const playlistUpdates = this.playlistUpdates as {
				duration: number;
				frequency: number;
				isFullScreen: number;
				playlistContentId: string;
				schedule: PlaylistContentSchedule;
			}[];
			const indexToUpdate = playlistUpdates.findIndex((update) => update.playlistContentId === this.playlistContentId);
			this.playlistUpdates[indexToUpdate].schedule = forSubmission;
			console.log('playlist updated', this.playlistUpdates);
		});
	}
}
