import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
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
	@Input() toggle_all: Observable<void>;
	@Output() toggle: EventEmitter<string[]> = new EventEmitter();
	private allToggled: Subscription;
	selectedHostIds = [];
	selectedLicenseIds = [];

	constructor() {}

	ngOnInit() {
		this.allToggled = this.toggle_all.subscribe((e: any) => this.onAllToggled(e));
	}

	ngOnDestroy() {
		this.allToggled.unsubscribe();
	}

	private onAllToggled(e) {
		this.host_licenses.forEach((h) => this.toggleAllHostLicenses(e, h));
	}

	public toggleAllHostLicenses(e, hostLicenses: HostLicenses) {
		if (e.checked) {
			if (!this.selectedHostIds.includes(hostLicenses.host.hostId)) this.selectedHostIds.push(hostLicenses.host.hostId);
			hostLicenses.licenses.forEach((l) => !this.selectedLicenseIds.includes(l.licenseId) && this.selectedLicenseIds.push(l.licenseId));
		} else {
			this.selectedHostIds = this.selectedHostIds.filter((h) => h !== hostLicenses.host.hostId);
			this.selectedLicenseIds = this.selectedLicenseIds.filter((id) => !hostLicenses.licenses.some((l) => id === l.licenseId));
		}

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
