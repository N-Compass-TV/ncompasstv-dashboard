import { Component, Input, OnInit } from '@angular/core';
import { API_HOST, API_LICENSE_PROPS } from 'src/app/global/models';

@Component({
	selector: 'app-play-location',
	templateUrl: './play-location.component.html',
	styleUrls: ['./play-location.component.scss']
})
export class PlayLocationComponent implements OnInit {
	@Input() hostLicenses: { host: API_HOST; licenses: API_LICENSE_PROPS[] };
	@Input() blacklistData: {
		blacklistedContentId: string;
		contentId: string;
		dateCreated: string;
		dateUpdated: string;
		licenseId: string;
	}[];

	constructor() {}

	ngOnInit() {
		console.log('hostLicenses', this.hostLicenses);
	}
}
