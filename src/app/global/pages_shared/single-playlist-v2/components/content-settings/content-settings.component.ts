import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT, API_HOST, API_LICENSE_PROPS } from '../../../../models';
import { PlaylistService } from '../../../../services';
import { SinglePlaylistService } from '../../services/single-playlist.service';

@Component({
	selector: 'app-content-settings',
	templateUrl: './content-settings.component.html',
	styleUrls: ['./content-settings.component.scss']
})
export class ContentSettingsComponent implements OnInit {
	constructor(
		@Inject(MAT_DIALOG_DATA)
		public contentData: { playlistContent: API_CONTENT; hostLicenses: { host: API_HOST; licenses: API_LICENSE_PROPS[] } },
		private _playlist: PlaylistService,
		private _playlistV2: SinglePlaylistService
	) {}

	ngOnInit() {
		this.getBlacklistData();
	}

	createWhitelistRecord(data) {}

	getBlacklistData() {
		this._playlist.get_blacklisted_by_id(this.contentData.playlistContent.playlistContentId).subscribe({
			next: (res) => {
				console.log(res);
			}
		});
	}

	getWhitelistData() {
		this._playlistV2.getWhitelistData(this.contentData.playlistContent.playlistContentId).subscribe({
			next: (res) => {
				console.log(res);
			}
		});
	}
}
