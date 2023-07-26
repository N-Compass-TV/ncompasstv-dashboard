import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Sortable } from 'sortablejs';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {
	API_CONTENT,
	API_HOST,
	API_LICENSE,
	API_LICENSE_PROPS,
	API_SCREEN_OF_PLAYLIST,
	API_UPDATED_PLAYLIST_CONTENT,
	API_CONTENT_V2,
	API_PLAYLIST_V2
} from '../../models';

import {
	PlaylistPrimaryControlActions as pActions,
	PlaylistPrimaryControls,
	PlaylistContentControlActions as pcActions,
	PlaylistFiltersDropdown,
	PlaylistViewOptions,
	PlaylistViewOptionActions
} from './constants';

import { FEED_TYPES, IMAGE_TYPES, VIDEO_TYPES } from '../../constants/file-types';
import { SinglePlaylistService } from './services/single-playlist.service';
import { ContentSettingsComponent } from './components/content-settings/content-settings.component';
import { AddContentComponent } from './components/add-content/add-content.component';
import { PlaylistContent, PlaylistContentUpdate } from './type/PlaylistContentUpdate';
import { QuickMoveComponent } from './components/quick-move/quick-move.component';
import { IsvideoPipe } from '../../pipes';

@Component({
	selector: 'app-single-playlist-v2',
	templateUrl: './single-playlist-v2.component.html',
	styleUrls: ['./single-playlist-v2.component.scss'],
	providers: [IsvideoPipe]
})
export class SinglePlaylistV2Component implements OnInit {
	@ViewChild('draggables', { static: false }) draggables: ElementRef<HTMLCanvasElement>;
	assets: API_CONTENT_V2[] = [];
	contentStatusBreakdown = [];
	feedCount = 0;
	hostLicenses: any;
	hosts: API_HOST[];
	imageCount = 0;
	licenses: API_LICENSE_PROPS[];
	detailedViewMode = false;
	playlist: API_PLAYLIST_V2['playlist'];
	playlistContentBreakdown = [];
	playlistContents: API_CONTENT_V2[];
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
	sortablejsTriggered: Subject<boolean> = new Subject<boolean>();
	sortablejs: any;
	videoCount = 0;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _dialog: MatDialog,
		private _playlist: SinglePlaylistService,
		private _isVideo: IsvideoPipe
	) {}

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
			case pcActions.quickMove:
				this.playlistContentMoveSwap(e.playlistContent);
				break;
			case pcActions.swapContent:
				this.showAddContentDialog(e.playlistContent);
				break;
			default:
				break;
		}
	}

	private getAssets() {
		this._playlist.getAvailableDealerAssets().subscribe({
			next: (data: { contents: API_CONTENT_V2[]; page: any }) => {
				/** Implement paging */
				this.assets = data.contents;

				/** Enable Add Content Button */
				this.playlistControls = this.playlistControls.map((p) => {
					/** Add Bulk Button Actions Here */
					if (p.action == pActions.addContent)
						return { ...p, icon: this.assets.length ? 'fas fa-plus' : 'fas fa-ban', disabled: this.assets.length < 1 };
					return p;
				});

				/** Send signal */
				this._playlist.contentReady(data.contents);
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
			next: (data: API_PLAYLIST_V2) => {
				const { playlist, playlistContents } = data;
				const { playlistName, playlistDescription } = playlist;

				/** This call should only return playlist related data like the ones below */
				this.playlist = playlist;

				/** Making sure playlist contents are ordered properly */
				this.playlistContents = this.preparePlaylistContents(playlistContents);
				this.playlistName = playlistName;
				this.playlistDescription = playlistDescription;

				/** These data should be coming from another API call but since they're included ... */
				// this.screens = data.screens;
				// this.hostLicenses = data.hostLicenses;
				// this.licenses = data.licenses;

				/** Get Assets */
				this.getAssets();

				/** Get Asset Count By Type */
				this.getAssetCount();

				/** Initialize search form watch */
				this.searchFormInit();

				/** Set Bulk Controls State */
				this.setBulkControlsState();

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
			next: (res) => {
				this.playlistHostLicenses = res;

				/** Send signal */
				this._playlist.hostsReady(res);
			},
			error: (error) => {
				throw Error(error);
			}
		});
	}

	private markAll() {
		this.selectedPlaylistContents = this.playlistContents.map((i) => i.playlistContentId);
		this.setBulkControlsState();
	}

	private movePlaylistContent(playlistContentId: string, seq: number) {
		// Get source index and the playlist content to move
		const playlistContentSrcIndex = this.playlistContents.findIndex((i: PlaylistContent) => playlistContentId == i.playlistContentId);
		const playlistContentToMove = this.playlistContents[playlistContentSrcIndex];

		// Remove the object from the source index
		this.playlistContents.splice(playlistContentSrcIndex, 1);

		// Insert the object at the target index
		this.playlistContents.splice(seq - 1, 0, { ...playlistContentToMove });
		this.playlistSortableOrder = this.playlistContents.map((i) => i.playlistContentId);

		// Save Playlist
		this.rearrangePlaylist(this.playlistSortableOrder, true);
	}

	public onChangeViewOptions(action: string) {
		this.detailedViewMode = action === PlaylistViewOptionActions.detailedView ? true : false;
	}

	public playlistContentSelected(playlistContentId: string) {
		if (this.selectedPlaylistContents.includes(playlistContentId))
			this.selectedPlaylistContents = this.selectedPlaylistContents.filter((p) => p !== playlistContentId);
		else this.selectedPlaylistContents.push(playlistContentId);

		this.setBulkControlsState();
	}

	/**
	 * Use this function to modify the playlist contents, e.g. set the sequence or set the schedule status
	 * @param data: API_CONTENT_V2[]
	 * @returns API_CONTENT_V2[]
	 */
	private preparePlaylistContents(data: API_CONTENT_V2[]) {
		return data.map((content, index) => {
			return {
				...content,
				seq: index + 1
			};
		});
	}

	private playlistContentSettings(playlistContent: API_CONTENT_V2[], bulkSet: boolean = false) {
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
					res.forEach((p) => this.playlistContentsToSave.push(p.playlistContentId));

					this.updatePlaylistContent(res, false);
				}
			});
	}

	public playlistContentMoveSwap(playlistContent: API_CONTENT) {
		this._dialog
			.open(QuickMoveComponent, {
				width: '678px',
				data: {
					playlistContent,
					playlistContentCount: this.playlistContents.length
				}
			})
			.afterClosed()
			.subscribe({
				next: (res: { seq: number }) => {
					if (res && res.seq) this.movePlaylistContent(playlistContent.playlistContentId, res.seq);
				}
			});
	}

	public playlistControlClicked(e: { action: string }) {
		switch (e.action) {
			case pActions.markAll:
				this.markAll();
				break;
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

	private rearrangePlaylist(updates: any[], moveAndSave: boolean = false) {
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

		if (moveAndSave) {
			this.updatePlaylistContent(this.playlistSequenceUpdates, true);
			return;
		}

		this.setBulkControlsState();
	}

	private setBulkControlsState() {
		this.playlistControls = this.playlistControls.map((p) => {
			/** Add Bulk Button Actions Here */
			if (p.action == pActions.bulkModify || p.action == pActions.bulkDelete)
				return { ...p, disabled: this.selectedPlaylistContents.length < 1 };
			else if (p.action == pActions.savePlaylist) return { ...p, disabled: this.playlistSequenceUpdates.length == 0 };
			else if (p.action == pActions.markAll) return { ...p, disabled: this.playlistContents.length == 0 };
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

	private showAddContentDialog(playlistContent?: API_CONTENT) {
		this._dialog
			.open(AddContentComponent, {
				data: {
					playlistId: this.playlist.playlistId,
					assets: this.assets,
					hostLicenses: this.playlistHostLicenses,
					playlistContentId: playlistContent ? playlistContent.playlistContentId : null
				}
			})
			.afterClosed()
			.subscribe({
				next: (res) => {
					if (playlistContent) {
						this.swapContent(res, playlistContent);
						return;
					}

					res && this.addContents(res);
				}
			});
	}

	private sortableJSInit(): void {
		const set = (sortable) => {
			this.sortablejsTriggered.next(true);
			this.playlistSortableOrder = [...sortable.toArray()];
			this.rearrangePlaylist(this.playlistSortableOrder);
		};

		const list = document.getElementById('draggables');
		this.sortablejs = new Sortable(list, {
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
			onUpdate: (event: any) => {
				console.log('onUpdate =>', event);
			},
			onSort: (event: any) => {
				console.log('OnSort =>', event);
			}
		});
	}

	private swapContent(newContent: API_CONTENT, playlistContent: API_CONTENT) {
		const playlistContentToSwap = {
			contentId: newContent.contentId,
			playlistContentId: playlistContent.playlistContentId,
			duration: this._isVideo.transform(newContent.fileType) ? newContent.duration : playlistContent.duration
		};

		/** Store updates for saving */
		this.playlistContentsToSave.push(playlistContent.playlistContentId);

		/** Save and Update View */
		this._playlist.swapPlaylistContent(playlistContentToSwap).subscribe({
			next: (res: { content: API_CONTENT; plContent: API_UPDATED_PLAYLIST_CONTENT }) => {
				this.playlistContents = this.playlistContents.map((p) => {
					if (p.playlistContentId == playlistContent.playlistContentId) {
						return {
							...res.content,
							...res.plContent
						};
					}

					return p;
				});

				this.playlistContents = this.playlistContents.sort(
					(a, b) => this.playlistSortableOrder.indexOf(a.playlistContentId) - this.playlistSortableOrder.indexOf(b.playlistContentId)
				);

				this.playlistContentsToSave = [];

				setTimeout(() => {
					this.sortableJSInit();
				}, 0);
			},
			error: (err) => {
				console.log(err);
			}
		});
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
				if (playlistSave) {
					this.playlistSequenceUpdates = [];
					this.sortablejsTriggered.next(false);
				}
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

				setTimeout(() => {
					this.sortableJSInit();
				}, 0);
			},
			error: (err) => {}
		});
	}
}
