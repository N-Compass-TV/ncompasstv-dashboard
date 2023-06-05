import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Sortable } from 'sortablejs';
import {
	API_CONTENT,
	API_HOST,
	API_LICENSE,
	API_LICENSE_PROPS,
	API_SCREEN_OF_PLAYLIST,
	API_SINGLE_PLAYLIST,
	API_SINGLE_PLAYLIST_INFO
} from '../../models';
import { ContentSettingsComponent } from './components/content-settings/content-settings.component';
import {
	PlaylistPrimaryControlActions as pActions,
	PlaylistPrimaryControls,
	PlaylistContentControlActions as pcActions,
	PlaylistFiltersDropdown,
	PlaylistViewOptions,
	PlaylistViewOptionActions
} from './constants';

import { SinglePlaylistService } from './services/single-playlist.service';
import { FEED_TYPES, IMAGE_TYPES, VIDEO_TYPES } from '../../constants/file-types';
import { AddContentComponent } from './components/add-content/add-content.component';

@Component({
	selector: 'app-single-playlist-v2',
	templateUrl: './single-playlist-v2.component.html',
	styleUrls: ['./single-playlist-v2.component.scss']
})
export class SinglePlaylistV2Component implements OnInit {
	@ViewChild('draggables', { static: false }) draggables: ElementRef<HTMLCanvasElement>;
	assets: API_CONTENT[] = [];
	contentStatusBreakdown = [];
	feedCount = 0;
	hostLicenses: any;
	hosts: API_HOST[];
	imageCount = 0;
	licenses: API_LICENSE_PROPS[];
	detailedViewMode = false;
	playlist: API_SINGLE_PLAYLIST_INFO;
	playlistContentBreakdown = [];
	playlistContents: API_CONTENT[];
	playlistControls = PlaylistPrimaryControls;
	playlistDescription = 'Getting playlist data';
	playlistFilters = PlaylistFiltersDropdown;
	playlistHostLicenses: { host: API_HOST; licenses: API_LICENSE[] };
	playlistName = 'Please wait';
	playlistViews = PlaylistViewOptions;
	screens: API_SCREEN_OF_PLAYLIST[];
	selectedPlaylistContents = [];
	videoCount = 0;

	constructor(private _activatedRoute: ActivatedRoute, private _dialog: MatDialog, private _playlist: SinglePlaylistService) {}

	ngOnInit() {
		this.playlistRouteInit();
	}

	public onChangeViewOptions(action: string) {
		this.detailedViewMode = action === PlaylistViewOptionActions.detailedView ? true : false;
	}

	public contentControlClicked(e: { playlistContent: any; action: string }) {
		switch (e.action) {
			case pcActions.remove:
				break;
			case pcActions.edit:
				this._dialog.open(ContentSettingsComponent, {
					width: '1270px',
					height: '720px',
					data: {
						playlistContent: e.playlistContent,
						hostLicenses: this.playlistHostLicenses
					}
				});
				break;
			case pcActions.fullscreen:
				break;
			case pcActions.swap:
				break;
			default:
				break;
		}
	}

	public contentSelected(playlistContentId: string) {
		if (this.selectedPlaylistContents.includes(playlistContentId))
			this.selectedPlaylistContents = this.selectedPlaylistContents.filter((p) => p !== playlistContentId);
		else this.selectedPlaylistContents.push(playlistContentId);

		this.playlistControls = this.playlistControls.map((p) => {
			/** Add Bulk Button Actions Here */
			if (p.action == pActions.bulkModify || p.action == pActions.bulkDelete)
				return { ...p, disabled: this.selectedPlaylistContents.length < 1 };
			return p;
		});
	}

	private getAssets() {
		this._playlist.getAvailableDealerAssets().subscribe({
			next: (data: { contents: API_CONTENT[]; page: any }) => {
				/** Implement paging */
				this.assets = data.contents;

				/** Enable Add Content Button */
				this.playlistControls = this.playlistControls.map((p) => {
					/** Add Bulk Button Actions Here */
					if (p.action == pActions.addContent)
						return { ...p, icon: this.assets.length ? 'fas fa-plus' : 'fas fa-ban', disabled: this.assets.length < 1 };
					return p;
				});
			},
			error: (error) => {
				throw Error(error);
			}
		});
	}

	private getAssetCount(): void {
		const fileTypes = (type: string) => this.getFileTypesByTypeName(type);
		this.videoCount = this.playlistContents.filter((i) => fileTypes('video').includes(i.fileType.toLowerCase())).length;
		this.imageCount = this.playlistContents.filter((i) => fileTypes('image').includes(i.fileType.toLowerCase())).length;
		this.feedCount = this.playlistContents.filter((i) => fileTypes('feed').includes(i.fileType.toLowerCase())).length;
		this.playlistContentBreakdown = [
			{ label: 'Active Contents', active: 267, total: this.playlistContents.length },
			{ label: 'Active Videos', active: 185, total: this.videoCount },
			{ label: 'Active Images', active: 82, total: this.imageCount },
			{ label: 'Active Feeds', active: 0, total: this.feedCount }
		];
	}

	private getFileTypesByTypeName(data: string) {
		switch (data) {
			case 'image':
				return IMAGE_TYPES;

			case 'video':
				return VIDEO_TYPES;

			default:
				return FEED_TYPES;
		}
	}

	private getPlaylistData(playlistId: string) {
		this._playlist.getPlaylistData(playlistId).subscribe({
			next: (data: API_SINGLE_PLAYLIST) => {
				/** This call should only return playlist related data like the ones below */
				this.playlist = data.playlist;
				this.playlistContents = data.playlistContents;
				this.playlistName = this.playlist.playlistName;
				this.playlistDescription = this.playlist.playlistDescription;

				/** These data should be coming from another API call but since they're included ... */
				this.screens = data.screens;
				this.hostLicenses = data.hostLicenses;
				this.licenses = data.licenses;

				/** Get Assets */
				this.getAssets();

				/** Get Asset Count By Type */
				this.getAssetCount();

				/** Initialize SortableJS */
				setTimeout(() => this.sortableJSInit(), 0);
			},
			error: (error) => {
				throw Error(error);
			}
		});
	}

	private getPlaylistHostLicenses(playlistId: string) {
		this._playlist.getPlaylistHosts(playlistId).subscribe({
			next: (res) => (this.playlistHostLicenses = res),
			error: (error) => {
				throw Error(error);
			}
		});
	}

	public playlistControlClicked(e: { action: string }) {
		switch (e.action) {
			case pActions.addContent:
				this.showAddContentDialog();
				break;
			default:
				break;
		}
	}

	private playlistRouteInit() {
		this._activatedRoute.paramMap.subscribe((data: any) => {
			this.getPlaylistData(data.params.data);
			this.getPlaylistHostLicenses(data.params.data);
		});
	}

	private showAddContentDialog() {
		this._dialog.open(AddContentComponent, {
			data: {
				playlistId: this.playlist.playlistId,
				assets: this.assets,
				hostLicenses: this.playlistHostLicenses
			}
		});
	}

	private sortableJSInit(): void {
		// Sortable.mount(new MultiDrag());

		const onDeselect = (e) => {
			// this.selected_content_count = e.newIndicies.length;
			// setTimeout(() => {
			// 	if (this.button_click_event == 'edit-marked' || this.button_click_event == 'delete-marked') {
			// 	} else {
			// 		this.selected_contents = [];
			// 		this.selected_content_ids = [];
			// 	}
			// }, 0);
		};

		const onSelect = (e) => {
			//this.selected_content_count = e.newIndicies.length;
		};

		const set = (sortable) => {
			// this.rearrangePlaylistContents(sortable.toArray());
			// localStorage.setItem('playlist_order', sortable.toArray());
		};

		const onStart = () => {
			// if (localStorage.getItem('playlist_order')) this.rearrangePlaylistContents(localStorage.getItem('playlist_order').split(','));
		};

		const onEnd = () => {
			// this.search_control.setValue('');
		};

		new Sortable(this.draggables.nativeElement, {
			swapThreshold: 1,
			sort: true,
			animation: 500,
			ghostClass: 'dragging',
			scrollSensitivity: 200,
			multiDrag: true,
			selectedClass: 'selected',
			fallbackOnBody: true,
			forceFallback: true,
			group: 'playlist_content',
			fallbackTolerance: 10,
			store: { set },
			filter: '.undraggable',
			onSelect,
			onDeselect,
			onStart,
			onEnd
		});
	}
}
