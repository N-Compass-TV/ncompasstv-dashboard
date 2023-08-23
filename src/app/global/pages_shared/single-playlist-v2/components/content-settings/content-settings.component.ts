import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT, API_HOST, API_LICENSE_PROPS } from '../../../../models';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { IsvideoPipe } from 'src/app/global/pipes';
import { Subject } from 'rxjs/internal/Subject';

@Component({
	selector: 'app-content-settings',
	templateUrl: './content-settings.component.html',
	styleUrls: ['./content-settings.component.scss'],
	providers: [IsvideoPipe]
})
export class ContentSettingsComponent implements OnInit {
	hasImageAndFeed;
	playlistUpdates: any[] = [];
	toggleAll: Subject<void> = new Subject<void>();
	loadingWhitelistedLicenses: boolean = true;
	whitelistedLicenses: string[] = [];
	whitelistedHosts: string[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public contentData: { playlistContents: API_CONTENT[]; hostLicenses: { host: API_HOST; licenses: API_LICENSE_PROPS[] }[]; bulkSet: boolean },
		private _playlist: SinglePlaylistService,
		private _video: IsvideoPipe
	) {}

	ngOnInit() {
		console.log(this.contentData);
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
	}

	private getPlaylistContentWhitelistData() {
		if (this.contentData.bulkSet || (this.contentData && !this.contentData.hostLicenses)) return;

		this._playlist.getWhitelistData(this.contentData.playlistContents[0].playlistContentId).subscribe({
			next: (res: { licensePlaylistContents: any[] }) => {
				this.loadingWhitelistedLicenses = false;

				if (!res.licensePlaylistContents) return;
				this.whitelistedLicenses = res.licensePlaylistContents.map((i) => i.licenseId);
				this.whitelistedHosts = res.licensePlaylistContents.map((i) => i.hostId);
				console.log('===>', this.whitelistedLicenses, this.loadingWhitelistedLicenses);
			}
		});
	}

	public licenseIdToggled(licenseIds: string[]) {
		/** Single Playlist Content Edit */
		if (!this.contentData.bulkSet) {
			this.playlistUpdates = [
				{
					...(this.playlistUpdates && this.playlistUpdates[0]),
					licenseIds,
					playlistContentId: this.contentData.playlistContents[0].playlistContentId
				}
			];

			console.log(this.playlistUpdates);
			return;
		}

		/** Multiple Playlist Content Edit, Duration applies to non video filetype only */
		const contentData = this.playlistUpdates.length ? this.playlistUpdates : this.contentData.playlistContents;
		this.playlistUpdates = contentData.map((p) => {
			return {
				...p,
				playlistContentId: p.playlistContentId,
				licenseIds
			};
		});

		console.log(this.playlistUpdates);
	}

	/**
	 * @param data - Playlist content setting changes
	 */
	public playlistContentModified(data: any) {
		/** Single Playlist Content Edit */
		if (!this.contentData.bulkSet) {
			this.playlistUpdates = [
				{
					...(this.playlistUpdates && this.playlistUpdates[0]),
					...data,
					playlistContentId: this.contentData.playlistContents[0].playlistContentId,
					duration: this._video.transform(this.contentData.playlistContents[0].fileType)
						? this.contentData.playlistContents[0].duration
						: data.duration || this.playlistUpdates[0].duration
				}
			];
			return;
		}

		/** Multiple Playlist Content Edit, Duration applies to non video filetype only */
		const contentData = this.playlistUpdates.length ? this.playlistUpdates : this.contentData.playlistContents;
		this.playlistUpdates = contentData.map((p) => {
			return {
				playlistContentId: p.playlistContentId,
				...data,
				duration: this._video.transform(p.fileType) ? p.duration : data.duration || p.duration
			};
		});
	}
}
