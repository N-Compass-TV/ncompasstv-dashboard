import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { API_HOST, API_LICENSE_PROPS } from 'src/app/global/models';

interface HostLicenses {
	host: API_HOST;
	licenses: API_LICENSE_PROPS[];
}

@Component({
	selector: 'app-play-location',
	templateUrl: './play-location.component.html',
	styleUrls: ['./play-location.component.scss']
})
export class PlayLocationComponent implements OnInit {
	@Input() host_licenses: HostLicenses[];
	@Output() toggle: EventEmitter<string[]> = new EventEmitter();
	selectedHostIds = [];
	selectedLicenseIds = [];

	constructor() {}

	ngOnInit() {}

	public toggleAllHostLicenses(e, hostLicenses: HostLicenses) {
		if (e.checked) {
			this.selectedHostIds.push(hostLicenses.host.hostId);
			hostLicenses.licenses.forEach((l) => !this.selectedLicenseIds.includes(l.licenseId) && this.selectedLicenseIds.push(l.licenseId));
		} else {
			this.selectedHostIds = this.selectedHostIds.filter((h) => h !== hostLicenses.host.hostId);
			this.selectedLicenseIds = this.selectedLicenseIds.filter((id) => !hostLicenses.licenses.some((l) => id === l.licenseId));
		}

		console.log('toggleAllHostLicenses', this.selectedHostIds);
		console.log('toggleHostLicense', this.selectedLicenseIds);
		this.toggle.emit(this.selectedLicenseIds);
	}

	public toggleHostLicense(e, h: HostLicenses, licenseId: string) {
		if (e.checked) {
			if (!this.selectedHostIds.includes(h.host.hostId)) this.selectedHostIds.push(h.host.hostId);
			if (!this.selectedLicenseIds.includes(licenseId)) this.selectedLicenseIds.push(licenseId);
		} else {
			this.selectedLicenseIds = this.selectedLicenseIds.filter((sl) => sl !== licenseId);

			if (!h.licenses.some((l) => this.selectedLicenseIds.includes(l.licenseId)))
				this.selectedHostIds = this.selectedHostIds.filter((id) => id !== h.host.hostId);
		}

		console.log('toggleAllHostLicenses', this.selectedHostIds);
		console.log('toggleHostLicense', this.selectedLicenseIds);
		this.toggle.emit(this.selectedLicenseIds);
	}
}
