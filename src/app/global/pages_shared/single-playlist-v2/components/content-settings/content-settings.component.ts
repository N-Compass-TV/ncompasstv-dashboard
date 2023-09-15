import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { API_CONTENT_V2, API_HOST, API_LICENSE_PROPS } from 'src/app/global/models';
import { SavePlaylistContentUpdate } from '../../models';
import { BlacklistUpdates } from '../../type/PlaylistContentUpdate';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { IsvideoPipe } from 'src/app/global/pipes';

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
			hasExistingSchedule: boolean;
			scheduleType?: number;
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
	 * @param basicSettings - Playlist content setting changes
	 */
	public playlistContentModified(basicSettings: { duration?: number; frequency?: number; isFullScreen?: number }) {
		console.log('playlist content modified', basicSettings);

		// simply parse frequency if it is of type string
		if (typeof basicSettings.frequency === 'string') basicSettings.frequency = parseInt(basicSettings.frequency);

		/** Single Playlist Content Edit */
		if (!this.contentData.bulkSet) {
			this.playlistContent.contentUpdates = [
				{
					...(this.playlistContent.contentUpdates && this.playlistContent.contentUpdates[0]),
					...basicSettings,
					playlistContentId: this.contentData.playlistContents[0].playlistContentId,
					duration: this._video.transform(this.contentData.playlistContents[0].fileType)
						? this.contentData.playlistContents[0].duration
						: basicSettings.duration || this.playlistContent.contentUpdates[0].duration
				}
			];
			return;
		}

		/** Multiple Playlist Content Edit, Duration applies to non video filetype only */
		const contentData: any = this.playlistContent.contentUpdates.length ? this.playlistContent.contentUpdates : this.contentData.playlistContents;
		this.playlistContent.contentUpdates = contentData.map((p) => {
			return {
				playlistContentId: p.playlistContentId,
				...basicSettings,
				duration: this._video.transform(p.fileType) ? p.duration : basicSettings.duration || p.duration
			};
		});
	}

	private subscribeToContentSchedulerFormChanges() {
		this._playlist.schedulerFormUpdated.pipe(takeUntil(this._unsubscribe)).subscribe({
			next: (response) => {
				this.playlistContent.contentUpdates = this.playlistContent.contentUpdates.map((contentUpdate) => {
					contentUpdate.schedule = this._playlist.mapScheduleFromUiContent(
						response,
						contentUpdate.playlistContentId,
						this.contentData.playlistContents
					);
					return contentUpdate;
				});
			}
		});
	}
}
