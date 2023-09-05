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
	@Input() toggle_all_add_content: Observable<void>;
	@Input() toggle_all_spacer: Observable<void>;
	@Input() whitelisted_hosts: string[] = [];
	@Input() whitelisted_licenses: string[] = [];
	@Output() toggle: EventEmitter<string[]> = new EventEmitter();
	@Output() to_blacklist: EventEmitter<string[]> = new EventEmitter();
	selectedHostIds = [];
	selectedLicenseIds = [];
	blacklistLicences = []; // Licenses that will be removed in the whitelist records

	constructor() {}

	ngOnInit() {
		/** Yes I had them separated instead of just one observable instance */
		if (this.toggle_all) this.toggle_all.subscribe((e: any) => this.onAllToggled(e));
		if (this.toggle_all_add_content) this.toggle_all_add_content.subscribe((e: any) => this.onAllToggled(e));
		if (this.toggle_all_spacer) this.toggle_all_spacer.subscribe((e: any) => this.onAllToggled(e));
	}

	private onAllToggled(e, inAddContent: boolean = false) {
		this.host_licenses.forEach((h) => {
			if (!inAddContent) {
				this.toggleAllHostLicenses(e, h);
				return;
			}

			this.addContent_toggleAllHostLicenses(e, h);
		});
	}

	public toggleAllHostLicenses(e, hostLicenses: HostLicenses) {
		if (e.checked) {
			if (!this.selectedHostIds.includes(hostLicenses.host.hostId)) this.selectedHostIds.push(hostLicenses.host.hostId);
			hostLicenses.licenses.forEach((l) => !this.selectedLicenseIds.includes(l.licenseId) && this.selectedLicenseIds.push(l.licenseId));
			this.whitelisted_hosts = this.selectedHostIds;
			this.whitelisted_licenses = this.selectedLicenseIds;
			this.blacklistLicences = [];
		} else {
			this.blacklistLicences = [...this.whitelisted_licenses];
			this.whitelisted_hosts = [];
			this.whitelisted_licenses = [];
			this.selectedHostIds = this.selectedHostIds.filter((h) => h !== hostLicenses.host.hostId);
			this.selectedLicenseIds = this.selectedLicenseIds.filter((id) => !hostLicenses.licenses.some((l) => id === l.licenseId));
		}

		this.to_blacklist.emit(this.blacklistLicences);
		this.toggle.emit(this.selectedLicenseIds);
	}

	addContent_toggleAllHostLicenses(e, hostLicenses: HostLicenses) {
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
			this.removeToBlacklist(licenseId);
		} else {
			this.selectedLicenseIds = this.selectedLicenseIds.filter((sl) => sl !== licenseId);
			if (!h.licenses.some((l) => this.selectedLicenseIds.includes(l.licenseId)))
				this.selectedHostIds = this.selectedHostIds.filter((id) => id !== h.host.hostId);

			this.addtoBlacklist(licenseId);
		}

		this.to_blacklist.emit(this.blacklistLicences);
		this.toggle.emit(this.selectedLicenseIds);
	}

	private removeToBlacklist(licenseId: string) {
		this.blacklistLicences = this.blacklistLicences.filter((i) => i != licenseId);
	}

	private addtoBlacklist(licenseId: string) {
		if (!this.blacklistLicences.filter((i) => i == licenseId).length) this.blacklistLicences.push(licenseId);
	}
}
