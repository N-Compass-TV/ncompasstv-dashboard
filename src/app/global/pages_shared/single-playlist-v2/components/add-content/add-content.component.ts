import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { API_CONTENT_V2, API_HOST, API_LICENSE_PROPS } from 'src/app/global/models';
import { SinglePlaylistService } from '../../services/single-playlist.service';
import { AddPlaylistContent } from '../../class/AddPlaylistContent';
import { FormControl } from '@angular/forms';
import { CONTENT_TYPE } from '../../constants/ContentType';
import { ButtonGroup } from '../../type/ButtonGroup';
import { Observable } from 'rxjs-compat';

@Component({
    selector: 'app-add-content',
    templateUrl: './add-content.component.html',
    styleUrls: ['./add-content.component.scss'],
})
export class AddContentComponent implements OnInit, OnDestroy {
    activeEdits: boolean;
    assets: API_CONTENT_V2[] = [];
    contentTypesBtnGroup: ButtonGroup[] = CONTENT_TYPE;
    currentPage = 1;
    floating_assets: API_CONTENT_V2[] = [];
    fetchContent$: Observable<any>;
    gettingHostData = true;
    gridCount = 8;
    hasImageAndFeed: boolean;
    hasSelectedAllHostLicenses = false;
    markedContent: API_CONTENT_V2;
    mode = 'add';
    newContentsSettings: AddPlaylistContent = new AddPlaylistContent();
    noData = this._dialog_data.assets.length === 0;
    noHostData = false;
    pageLimit = 0;
    paginating = false;
    playlistHostLicenses: { host: API_HOST; licenses: API_LICENSE_PROPS[] }[] = [];
    searchInput: FormControl = new FormControl('');
    searching = false;
    selectedContents: API_CONTENT_V2[] = [];
    selectedContentType: ButtonGroup = this.contentTypesBtnGroup[0];
    toggleAll = new Subject<void>();
    protected _unsubscribe = new Subject<void>();

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public _dialog_data: {
            assets: API_CONTENT_V2[];
            floatingAssets: API_CONTENT_V2[];
            dealerId: string;
            isDealer: boolean;
            hostLicenses: { host: API_HOST; licenses: API_LICENSE_PROPS[] }[];
            playlistContentId: string;
            playlistId: string;
        },
        private _playlist: SinglePlaylistService,
    ) {}

    ngOnInit() {
        this.assets = [...this._dialog_data.assets];
        this.floating_assets = [...this._dialog_data.floatingAssets];
        this.playlistHostLicenses = this._dialog_data.hostLicenses ? [...this._dialog_data.hostLicenses] : [];
        this.noHostData = !this.playlistHostLicenses.length;
        this.newContentsSettings.playlistId = this._dialog_data.playlistId;

        /** Watch Contents Readiness */
        this._playlist.contentLoaded$.subscribe({
            next: (res: API_CONTENT_V2[]) => {
                if (!this.assets.length) this.assets = res;
            },
        });

        /** Watch Hosts Data Readiness */
        this._playlist.hostLoaded$.subscribe({
            next: (res: { host: API_HOST; licenses: API_LICENSE_PROPS[] }[]) => {
                this.gettingHostData = false;
                if (!this.playlistHostLicenses.length && res.length) this.playlistHostLicenses = res;
                else this.noHostData = true;
            },
        });

        this.subscribeToContentScheduleFormChanges();
        this.searchInit();
        this.mode = typeof this._dialog_data.playlistContentId === 'undefined' ? 'add' : 'swap';
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    public applyContentSettings(settingsData: any) {
        this.newContentsSettings.playlistContentsLicenses = this.newContentsSettings.playlistContentsLicenses.map((c, index) => {
            return {
                ...c,
                ...settingsData,
                seq: index,
            };
        });
    }

    private checkIfAllHostLicensesWhitelisted(licenseIds: string[]) {
        const whitelisted = licenseIds;
        const allHostLicenses = this.mappedHostLicenses(this.playlistHostLicenses);
        this.hasSelectedAllHostLicenses = whitelisted.length === allHostLicenses.length;
    }

    public contentSelected(content: API_CONTENT_V2, e?: any) {
        if (!e.target.checked) this.selectedContents = this.selectedContents.filter((i) => i !== content);
        else this.selectedContents.push(content);

        const schedule = { type: 1 };

        this.newContentsSettings.playlistContentsLicenses = this.selectedContents.map((c, index) => {
            return {
                contentId: c.contentId,
                duration: c.fileType !== 'webm' ? c.duration || 20 : c.duration,
                isFullScreen: 0,
                licenseIds: [],
                seq: index,
                ...schedule,
            };
        });

        this.hasImageAndFeed = this.selectedContents.filter((p) => p.fileType !== 'webm').length > 0;
    }

    private getContents(floating: boolean = false, page: number = 1, pageSize: number = 60, searchKey?: string) {
        this.noData = false;
        if (this.pageLimit > 0 && this.currentPage > this.pageLimit) {
            this.paginating = false;
            return;
        }

        this.noData = false;
        const dealerId = floating ? null : this._dialog_data.dealerId;

        this._playlist
            .contentFetch({
                dealerId,
                floating,
                page,
                pageSize,
                searchKey,
            })
            .subscribe({
                next: (response: { iContents?: API_CONTENT_V2[]; contents?: API_CONTENT_V2[]; paging?: any; message?: string }) => {
                    // if no data from the server
                    if ('message' in response) {
                        this.noData = true;
                        this.searching = false;
                        this.paginating = false;
                        return;
                    }

                    const getContentsResponse = floating ? response.iContents : response.contents;

                    // if no results after searching
                    if (getContentsResponse.length <= 0) {
                        this.noData = true;
                        this.searching = false;
                        this.paginating = false;
                        return;
                    }

                    // if switched tabs after scrolling
                    if ((floating && this.selectedContentType.slug !== 'floating-content') || (!floating && this.selectedContentType.slug === 'floating-content')) {
                        this.getContents(false);
                        return;
                    }

                    // set paging limit
                    if (response.paging) {
                        this.pageLimit = response.paging.pages;
                    }

                    /** Paginating */
                    if (page > 1 && page <= this.pageLimit) {
                        if (response.contents && response.contents.length) this.assets = [...this.assets, ...response.contents];
                        if (response.iContents && response.iContents.length) this.assets = [...this.floating_assets, ...response.iContents];
                        this.paginating = false;
                        this.searching = false;
                        return true;
                    }

                    this.assets = [...getContentsResponse];
                    this.searching = false;
                },
            });
    }

    private fetchContents(page = 1, pageSize = 60, searchKey?: string) {
        const isRequestingFloatingContent = this.selectedContentType.slug === 'floating-content';
        const dealerId = isRequestingFloatingContent ? this._dialog_data.dealerId : null;

        this.fetchContent$ = this._playlist.contentFetch({
            dealerId,
            floating: isRequestingFloatingContent,
            page,
            pageSize,
            searchKey,
        });
    }

    public licenseIdToggled(licenseIds: string[]) {
        this.checkIfAllHostLicensesWhitelisted(licenseIds);

        this.newContentsSettings.playlistContentsLicenses = this.newContentsSettings.playlistContentsLicenses.map((c) => {
            if (!c.licenseIds) c.licenseIds = [];

            return {
                ...c,
                licenseIds: licenseIds,
            };
        });
    }

    public licenseDeselected() {
        this.hasSelectedAllHostLicenses = false;
    }

    public markContent(content: API_CONTENT_V2) {
        if (!this._dialog_data.playlistContentId) return;
        this.markedContent = content;
    }

    private mappedHostLicenses(data: { host: API_HOST; licenses: API_LICENSE_PROPS[] }[]) {
        return data.reduce((result, i) => {
            i.licenses.forEach((l) => result.push(l.licenseId));
            return result;
        }, []);
    }

    public onScroll(e: any): void {
        if (this.paginating) return;

        if (e.target.scrollTop + e.target.clientHeight + 1 >= e.target.scrollHeight) {
            this.paginating = true;
            this.currentPage += 1;
            const floating = this.selectedContentType.slug == 'floating-content';
            this.getContents(floating, this.currentPage, 60);
        }
    }

    public onSelectContentType(data: ButtonGroup) {
        if (data === this.selectedContentType) return;

        this.selectedContentType = data;
        this.paginating = false;
        this.searching = true;
        this.currentPage = 1;
        const currentSearchKey = this.searchInput.value as string;
        const hasSearchKey = currentSearchKey.length && currentSearchKey.length > 0;

        switch (this.selectedContentType.slug) {
            case 'dealer-content':
                if (hasSearchKey) this.getContents(false, 1, 60, currentSearchKey);
                else this.assets = [...this._dialog_data.assets];
                break;
            case 'floating-content':
                if (hasSearchKey) this.getContents(true, 1, 60, currentSearchKey);
                else this.assets = [...this.floating_assets];
                break;
            default:
                break;
        }

        setTimeout(() => {
            if (hasSearchKey) return;
            this.searching = false;
        }, 350);
    }

    private searchInit() {
        this.searchInput.valueChanges.pipe(takeUntil(this._unsubscribe), debounceTime(1000)).subscribe({
            next: (searchKey) => {
                const floating = this.selectedContentType.slug == 'floating-content';

                if (searchKey.length) {
                    this.searching = true;
                    this.getContents(floating, null, null, searchKey);
                    return;
                }

                this.assets = floating ? [...this.floating_assets] : [...this._dialog_data.assets];
                this.searching = false;
            },
        });
    }

    private subscribeToContentScheduleFormChanges() {
        this._playlist.schedulerFormUpdated.pipe(takeUntil(this._unsubscribe)).subscribe({
            next: (response) => {
                const contents = Array.from(this.newContentsSettings.playlistContentsLicenses);
                const mappedSchedule = this._playlist.mapScheduleFromUiContent(response);

                this.newContentsSettings.playlistContentsLicenses = contents.map((c) => {
                    return { ...c, ...mappedSchedule };
                });
            },
        });
    }
}
