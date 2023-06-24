import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT, API_HOST, API_LICENSE_PROPS } from '../../../../models';
import { PlaylistService } from '../../../../services';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { IsvideoPipe } from 'src/app/global/pipes';

@Component({
	selector: 'app-content-settings',
	templateUrl: './content-settings.component.html',
	styleUrls: ['./content-settings.component.scss'],
	providers: [IsvideoPipe]
})
export class ContentSettingsComponent implements OnInit {
	hasImageAndFeed;
	playlistUpdates: any;

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

	createWhitelistRecord(data) {}

	private getBlacklistData() {
		this._playlist.get_blacklisted_by_id(this.contentData.playlistContents[0].playlistContentId).subscribe({
			next: (res) => {
				console.log(res);
			}
		});
	}

	public playlistContentModified(data: any) {
		/** Single Playlist Content Edit */
		if (!this.contentData.bulkSet) {
			this.playlistUpdates = [
				{
					playlistContentId: this.contentData.playlistContents[0].playlistContentId,
					...data
				}
			];

			return;
		}

		/** Multiple Playlist Content Edit, Duration applies to non video filetype only */
		this.playlistUpdates = this.contentData.playlistContents.map((p) => {
			return {
				playlistContentId: p.playlistContentId,
				...data,
				duration: this._video.transform(p.fileType) ? p.duration : data.duration
			};
		});
	}
}
