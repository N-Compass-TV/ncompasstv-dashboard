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
import { FormControl } from '@angular/forms';
import { PlaylistContent, PlaylistContentUpdate } from './type/PlaylistContentUpdate';

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
	playlistSortableOrder: string[] = [];
	playlistSequenceUpdates: PlaylistContent[] = [];
	playlistContentsToSave = [];
	savingPlaylist = false;
	screens: API_SCREEN_OF_PLAYLIST[];
	searchForm = new FormControl();
	selectedPlaylistContents = [];
	videoCount = 0;

	constructor(private _activatedRoute: ActivatedRoute, private _dialog: MatDialog, private _playlist: SinglePlaylistService) {}

	ngOnInit() {
		this.playlistRouteInit();
	}

	private addContents(contentData: any) {
		this.playlist = null;

		this._playlist.addContent(contentData).subscribe({
			next: (res) => {
				this.playlistRouteInit();
			},
			error: (err) => console.log('Error', err)
		});
	}

	public contentControlClicked(e: { playlistContent: any; action: string }) {
		switch (e.action) {
			case pcActions.remove:
				break;
			case pcActions.edit:
				this.playlistContentSettings([e.playlistContent], false);
				break;
			case pcActions.fullscreen:
				this.setFullscreenProperty(e.playlistContent);
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

		this.setBulkControlsState();
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

				/** Making sure playlist contents are ordered properly */
				this.playlistContents = data.playlistContents.map((p, index) => {
					return {
						...p,
						seq: index + 1
					};
				});

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

				/** Initialize search form watch */
				this.searchFormInit();

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

	public onChangeViewOptions(action: string) {
		this.detailedViewMode = action === PlaylistViewOptionActions.detailedView ? true : false;
	}

	private playlistContentSettings(playlistContent: API_CONTENT[], bulkSet: boolean = false) {
		this._dialog
			.open(ContentSettingsComponent, {
				width: '1270px',
				height: '720px',
				data: {
					playlistContents: playlistContent,
					hostLicenses: this.playlistHostLicenses,
					bulkSet: bulkSet
				}
			})
			.afterClosed()
			.subscribe({
				next: (res: PlaylistContent[]) => {
					if (!res) return;

					/** Store updates for saving */
					res.forEach((p) => {
						this.playlistContentsToSave.push(p.playlistContentId);

						if (this.playlistSequenceUpdates.filter((i: PlaylistContent) => i.playlistContentId == p.playlistContentId).length) {
							const playlistContentIndex = this.playlistSequenceUpdates.findIndex(
								(i: PlaylistContent) => i.playlistContentId == p.playlistContentId
							);

							this.playlistSequenceUpdates[playlistContentIndex] = {
								...p,
								seq: this.playlistSequenceUpdates[playlistContentIndex].seq
							};
						} else {
							this.playlistSequenceUpdates.push(p);
						}
					});

					this.updatePlaylistContent(res, false);
				}
			});
	}

	public playlistControlClicked(e: { action: string }) {
		switch (e.action) {
			case pActions.addContent:
				this.showAddContentDialog();
				break;
			case pActions.bulkModify:
				/** Find playlist contents from selected playlist content ids */
				const selected = this.playlistContents.filter((obj) => this.selectedPlaylistContents.includes(obj.playlistContentId));
				this.playlistContentSettings(selected, true);
				break;
			case pActions.savePlaylist:
				this.updatePlaylistContent(this.playlistSequenceUpdates);
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

	private setBulkControlsState() {
		this.playlistControls = this.playlistControls.map((p) => {
			/** Add Bulk Button Actions Here */
			if (p.action == pActions.bulkModify || p.action == pActions.bulkDelete)
				return { ...p, disabled: this.selectedPlaylistContents.length < 1 };
			else if (p.action == pActions.savePlaylist) return { ...p, disabled: this.playlistSequenceUpdates.length == 0 };
			return p;
		});
	}

	private searchFormInit() {
		this.searchForm.valueChanges.subscribe({
			next: (keyword: string) => {
				console.log(keyword);
			}
		});
	}

	private setFullscreenProperty(p: API_CONTENT) {
		this.playlistContentsToSave.push(p.playlistContentId);

		this.updatePlaylistContent(
			[
				{
					playlistContentId: p.playlistContentId,
					isFullScreen: !p.isFullScreen ? 1 : 0
				}
			],
			false
		);
	}

	private showAddContentDialog() {
		this._dialog
			.open(AddContentComponent, {
				data: {
					playlistId: this.playlist.playlistId,
					assets: this.assets,
					hostLicenses: this.playlistHostLicenses
				}
			})
			.afterClosed()
			.subscribe({
				next: (res) => res && this.addContents(res)
			});
	}

	private sortableJSInit(): void {
		const set = (sortable) => {
			this.playlistSortableOrder = [...sortable.toArray()];
			this.rearrangePlaylist(this.playlistSortableOrder);
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
			filter: '.undraggable'
		});
	}

	private rearrangePlaylist(updates: any[]) {
		updates.forEach((p, index) => {
			if (this.playlistSequenceUpdates.filter((i: PlaylistContent) => i.playlistContentId == p).length) {
				/** Get index of the re-updated playlist content (in this.playlistSequenceUpdates) */
				const pcIndex = this.playlistSequenceUpdates.findIndex((i: PlaylistContent) => i.playlistContentId == p);

				/** Apply new sequence value of the re-updated playlist content */
				this.playlistSequenceUpdates[pcIndex] = { ...this.playlistSequenceUpdates[pcIndex], seq: index + 1 };
			} else {
				/** First time update, not in the stored playlist updates (this.playlistSequenceUpdates) array */
				const sequenceUpdate = { playlistContentId: p, seq: index + 1 };

				/** Store new */
				this.playlistSequenceUpdates.push(sequenceUpdate);
			}
		});

		this.setBulkControlsState();
	}

	/**
	 * @param data - Data to be saved
	 * @param playlistSave - If true then saves the whole playlist, else just the playlist content
	 */
	private updatePlaylistContent(data: PlaylistContent[], playlistSave: boolean = true) {
		let playlistUpdatesToSave: PlaylistContentUpdate = {
			playlistId: this.playlist.playlistId,
			playlistContentsLicenses: playlistSave ? this.playlistSequenceUpdates : data
		};

		this.savingPlaylist = playlistSave;

		/** Save playlist updates */
		this._playlist.updatePlaylistContent(playlistUpdatesToSave).subscribe({
			next: () => {
				this.savingPlaylist = false;
				this.selectedPlaylistContents = [];
				this.playlistContentsToSave = [];
				if (playlistSave) this.playlistSequenceUpdates = [];
				this.setBulkControlsState();

				this.playlistContents = this.playlistContents.map((p) => {
					const updateObj = playlistUpdatesToSave.playlistContentsLicenses.find((u) => u.playlistContentId === p.playlistContentId);

					if (updateObj) {
						return {
							...p,
							...updateObj
						};
					}

					return p;
				});

				this.playlistContents = this.playlistContents.sort(
					(a, b) => this.playlistSortableOrder.indexOf(a.playlistContentId) - this.playlistSortableOrder.indexOf(b.playlistContentId)
				);
			},
			error: (err) => {}
		});
	}
}
