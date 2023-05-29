import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT, API_HOST, API_LICENSE } from 'src/app/global/models';

@Component({
	selector: 'app-add-content',
	templateUrl: './add-content.component.html',
	styleUrls: ['./add-content.component.scss']
})
export class AddContentComponent implements OnInit {
	assets: API_CONTENT[] = [];
	contentSettings = [];
	gridCount = 8;
	playlistHostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[] = [];
	selectedContents: API_CONTENT[] = [];
	selectedContentForSettings: API_CONTENT[] = [];
	hasImageAndFeed: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public _dialog_data: { assets: API_CONTENT[]; hostLicenses: { host: API_HOST; licenses: API_LICENSE[] }[] }
	) {
		this.assets = [...this._dialog_data.assets];
		this.playlistHostLicenses = this._dialog_data.hostLicenses ? [...this._dialog_data.hostLicenses] : [];
	}

	ngOnInit() {}

	public applyContentSettings(settingData: any) {
		this.selectedContentForSettings.forEach((c) => {
			if (!this.contentSettings.filter((c) => c.contentId).length) {
				this.contentSettings.push({ ...c, ...settingData });
				return;
			}

			this.contentSettings.map((p) => {
				if (p.contentId == c.contentId) return { ...p, ...settingData };
			});
		});

		console.log(this.contentSettings);
	}

	public contentSelected(content: API_CONTENT) {
		if (this.selectedContents.includes(content)) this.selectedContents = this.selectedContents.filter((p) => p !== content);
		else this.selectedContents.push(content);
	}

	public contentSelectedForSettings(content: API_CONTENT) {
		if (this.selectedContentForSettings.includes(content))
			this.selectedContentForSettings = this.selectedContentForSettings.filter((p) => p !== content);
		else this.selectedContentForSettings.push(content);

		this.hasImageAndFeed = this.selectedContentForSettings.filter((p) => p.fileType !== 'webm').length > 0;
	}
}
