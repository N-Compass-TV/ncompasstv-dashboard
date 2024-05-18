import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material';
import { Observable } from 'rxjs/internal/Observable';
import { API_HOST, API_LICENSE_PROPS } from 'src/app/global/models';

interface HostLicenses {
    host: API_HOST;
    licenses: API_LICENSE_PROPS[];
}

@Component({
    selector: 'app-play-location',
    templateUrl: './play-location.component.html',
    styleUrls: ['./play-location.component.scss'],
})
export class PlayLocationComponent implements OnInit {
    @Input() host_licenses: HostLicenses[];
    @Input() toggle_all: Observable<void>;
    @Input() toggle_all_add_content: Observable<void>;
    @Input() toggle_all_spacer: Observable<void>;
    @Input() whitelisted_hosts: string[] = [];
    @Input() whitelisted_licenses: string[] = [];
    @Output() to_whitelist = new EventEmitter<string[]>();
    @Output() to_blacklist = new EventEmitter<string[]>();
    @Output() license_toggled = new EventEmitter<string[]>();
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

    private addContent_toggleAllHostLicenses(isChecked: boolean, hostLicenses: HostLicenses) {
        if (isChecked) {
            if (!this.selectedHostIds.includes(hostLicenses.host.hostId))
                this.selectedHostIds.push(hostLicenses.host.hostId);
            hostLicenses.licenses.forEach(
                (l) => !this.selectedLicenseIds.includes(l.licenseId) && this.selectedLicenseIds.push(l.licenseId),
            );
        } else {
            this.selectedHostIds = this.selectedHostIds.filter((h) => h !== hostLicenses.host.hostId);
            this.selectedLicenseIds = this.selectedLicenseIds.filter(
                (id) => !hostLicenses.licenses.some((l) => id === l.licenseId),
            );
        }

        this.to_whitelist.emit(this.selectedLicenseIds);
    }

    /**
     * Toggles all the hosts and their respective licenses
     * @param e
     * @param inAddContent
     */
    private onAllToggled(e: MatSlideToggleChange, inAddContent: boolean = false) {
        this.host_licenses.forEach((h) => {
            if (!inAddContent) {
                this.toggleAllHostLicenses(e, h);
                return;
            }

            this.addContent_toggleAllHostLicenses(e.checked, h);
        });
    }

    /**
     * Toggles all the licenses under a host
     * @param e
     * @param hostLicenses
     */
    public toggleAllHostLicenses(e: MatSlideToggleChange, hostLicenses: HostLicenses) {
        if (e.checked) {
            if (!this.selectedHostIds.includes(hostLicenses.host.hostId))
                this.selectedHostIds.push(hostLicenses.host.hostId);
            hostLicenses.licenses.forEach(
                (l) => !this.selectedLicenseIds.includes(l.licenseId) && this.selectedLicenseIds.push(l.licenseId),
            );
            this.whitelisted_hosts = this.selectedHostIds;
            this.whitelisted_licenses = this.selectedLicenseIds;
            this.blacklistLicences = [];
            this.to_whitelist.emit(this.selectedLicenseIds);
        } else {
            this.blacklistLicences = [...this.whitelisted_licenses];
            this.whitelisted_hosts = [];
            this.whitelisted_licenses = [];
            this.selectedHostIds = this.selectedHostIds.filter((h) => h !== hostLicenses.host.hostId);
            this.selectedLicenseIds = this.selectedLicenseIds.filter(
                (id) => !hostLicenses.licenses.some((l) => id === l.licenseId),
            );
            this.to_blacklist.emit(this.blacklistLicences);
        }

        // informs the content-settings component that a license was toggled
        // this is used to check if all licenses are toggled
        this.license_toggled.emit(this.whitelisted_licenses);
    }

    /**
     * Toggles a license under a host
     * @param e
     * @param h
     * @param licenseId
     */
    public toggleHostLicense(e: MatSlideToggleChange, h: HostLicenses, licenseId: string) {
        if (e.checked) {
            if (!this.selectedHostIds.includes(h.host.hostId)) this.selectedHostIds.push(h.host.hostId);
            if (!this.selectedLicenseIds.includes(licenseId)) this.selectedLicenseIds.push(licenseId);
            this.removeFromBlacklist(licenseId);
            this.to_whitelist.emit(this.getAllCurrentWhitelisted);
        } else {
            this.selectedLicenseIds = this.selectedLicenseIds.filter((sl) => sl !== licenseId);
            if (!h.licenses.some((l) => this.selectedLicenseIds.includes(l.licenseId)))
                this.selectedHostIds = this.selectedHostIds.filter((id) => id !== h.host.hostId);

            this.addtoBlacklist(licenseId);
            this.to_blacklist.emit(this.blacklistLicences);
        }

        // informs the content-settings component that a license was toggled
        // this is used to check if all licenses are whitelisted
        this.license_toggled.emit(this.getAllCurrentWhitelisted);
    }

    private removeFromBlacklist(licenseId: string) {
        this.blacklistLicences = this.blacklistLicences.filter((i) => i != licenseId);
    }

    private addtoBlacklist(licenseId: string) {
        if (!this.blacklistLicences.filter((i) => i == licenseId).length) this.blacklistLicences.push(licenseId);
    }

    /**
     * Returns all the license that are considered whitelisted
     * That includes all newly selected licenses for whitelisting
     */
    private get getAllCurrentWhitelisted() {
        const whitelisted = Array.from(this.whitelisted_licenses);
        const forWhitelisting = Array.from(this.selectedLicenseIds);
        return [...new Set(whitelisted.concat(forWhitelisting))];
    }
}
