import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT, API_HOST, API_LICENSE } from 'src/app/global/models';
import { AddPlaylistContent } from '../../class/AddPlaylistContent';

@Component({
	selector: 'app-add-content',
	templateUrl: './add-content.component.html',
	styleUrls: ['./add-content.component.scss']
})
export class AddContentComponent implements OnInit {
	assets: API_CONTENT[] = [];
	activeEdits: boolean;
	newContentsSettings: AddPlaylistContent = new AddPlaylistContent();
	gridCount = 8;
	playlistHostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[] = [];
	selectedContents: API_CONTENT[] = [];
	hasImageAndFeed: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public _dialog_data: { playlistId: string; assets: API_CONTENT[]; hostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[] }
	) {
		this.assets = [...this._dialog_data.assets];
		this.playlistHostLicenses = this._dialog_data.hostLicenses ? [...this._dialog_data.hostLicenses] : [];
	}

	ngOnInit() {
		this.newContentsSettings.playlistId = this._dialog_data.playlistId;
	}

	public applyContentSettings(settingsData: any) {
		this.newContentsSettings.playlistContentsLicenses = this.newContentsSettings.playlistContentsLicenses.map((c, index) => {
			return {
				...c,
				...settingsData,
				seq: index
			};
		});

		console.log(this.newContentsSettings);
	}

	public contentSelected(content: API_CONTENT) {
		if (this.selectedContents.includes(content)) this.selectedContents = this.selectedContents.filter((p) => p !== content);
		else this.selectedContents.push(content);

		this.newContentsSettings.playlistContentsLicenses = this.selectedContents.map((c, index) => {
			return {
				contentId: c.contentId,
				duration: c.fileType !== 'webm' ? c.duration || 20 : c.duration,
				isFullScreen: 0,
				licenseIds: [],
				seq: index
			};
		});

		this.hasImageAndFeed = this.selectedContents.filter((p) => p.fileType !== 'webm').length > 0;
	}

	public licenseIdToggled(licenseIds: string[]) {
		console.log(licenseIds);

		this.newContentsSettings.playlistContentsLicenses = this.newContentsSettings.playlistContentsLicenses.map((c, index) => {
			if (!c.licenseIds) c.licenseIds = [];

			return {
				...c,
				licenseIds: licenseIds
			};
		});

		console.log('=>', this.newContentsSettings);
	}
}