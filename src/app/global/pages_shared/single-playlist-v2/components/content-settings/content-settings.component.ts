import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT, API_HOST, API_LICENSE_PROPS } from '../../../../models';
import { PlaylistService } from '../../../../services';
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
	whitelistedLicenses: string[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public contentData: { playlistContents: API_CONTENT[]; hostLicenses: { host: API_HOST; licenses: API_LICENSE_PROPS[] }; bulkSet: boolean },
		private _playlist: PlaylistService,
		private _playlistV2: SinglePlaylistService,
		private _video: IsvideoPipe
	) {}

	ngOnInit() {
		console.log(this.contentData);
		if (!this.contentData.bulkSet) this.getBlacklistData();
		this.hasImageAndFeed = this.contentData.playlistContents.filter((p) => p.fileType !== 'webm').length > 0;
	}

	private getBlacklistData() {
		this._playlist.get_blacklisted_by_id(this.contentData.playlistContents[0].playlistContentId).subscribe({
			next: (res) => {
				console.log(res);
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
