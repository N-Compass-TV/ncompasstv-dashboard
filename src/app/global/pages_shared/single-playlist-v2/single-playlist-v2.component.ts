import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Sortable } from 'sortablejs';
import { FormControl } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as io from 'socket.io-client';

import {
	API_CONTENT,
	API_HOST,
	API_LICENSE,
	API_LICENSE_PROPS,
	API_SCREEN_OF_PLAYLIST,
	API_UPDATED_PLAYLIST_CONTENT,
	API_CONTENT_V2,
	API_PLAYLIST_V2,
	UI_ROLE_DEFINITION_TEXT,
	UI_PLAYLIST_SCREENS_NEW
} from 'src/app/global/models';

import {
	PlaylistPrimaryControlActions as pActions,
	PlaylistPrimaryControls,
	PlaylistContentControlActions as pcActions,
	PlaylistFiltersDropdown,
	PlaylistViewOptions,
	PlaylistViewOptionActions,
	PlaylistFilterActions,
	PlaylistPrimaryControlActions
} from './constants';

import { FEED_TYPES, IMAGE_TYPES, VIDEO_TYPES } from '../../constants/file-types';
import { SinglePlaylistService } from './services/single-playlist.service';
import { AuthService } from '../../services';
import { ContentSettingsComponent } from './components/content-settings/content-settings.component';
import { AddContentComponent } from './components/add-content/add-content.component';
import { BlacklistUpdates, PlaylistContent, PlaylistContentUpdate } from './type/PlaylistContentUpdate';
import { QuickMoveComponent } from './components/quick-move/quick-move.component';
import { IsvideoPipe } from '../../pipes';
import { SpacerSetupComponent } from './components/spacer-setup/spacer-setup.component';
import { SavePlaylistContentUpdate } from './models';
import { AddPlaylistContent } from './class/AddPlaylistContent';
import { ConfirmationModalComponent } from '../../components_shared/page_components/confirmation-modal/confirmation-modal.component';
import { environment } from 'src/environments/environment';
import { PlaylistDemoComponent, ViewSchedulesComponent } from '../../components_shared/playlist_components';

@Component({
	selector: 'app-single-playlist-v2',
	templateUrl: './single-playlist-v2.component.html',
	styleUrls: ['./single-playlist-v2.component.scss'],
	providers: [IsvideoPipe]
})
export class SinglePlaylistV2Component implements OnInit, OnDestroy {
	@ViewChild('draggables', { static: false }) draggables: ElementRef<HTMLCanvasElement>;
	assets: API_CONTENT_V2[] = [];
	contentStatusBreakdown = [];
	currentFilters: { type: string; status: string; keyword: string } = { type: null, status: null, keyword: null };
	detailedViewMode = false;
	feedCount = 0;
	floatingAssets: API_CONTENT_V2[] = [];
	hostLicenses: any;
	hostURL = '';
	hosts: API_HOST[];
	imageCount = 0;
	isFiltered: { type: boolean; status: boolean; keyword: boolean } = { type: false, status: false, keyword: false };
	licenseURL = '';
	licenses: API_LICENSE_PROPS[];
	licensesToUpdate: any[] = [];
	playlist: API_PLAYLIST_V2['playlist'];
	playlistContentBreakdown = [];
	playlistContents: API_CONTENT_V2[];
	playlistContentsToSave = [];
	playlistControls = PlaylistPrimaryControls;
	playlistDescription = 'Getting playlist data';
	playlistFilters = PlaylistFiltersDropdown;
	playlistHostLicenses: { host: API_HOST; licenses: API_LICENSE[] };
	playlistName = 'Please wait';
	playlistScreenTable: any;
	playlistScreens: API_SCREEN_OF_PLAYLIST[] = [];
	playlistSequenceUpdates: PlaylistContent[] = [];
	playlistSortableOrder: string[] = [];
	playlistViews = PlaylistViewOptions;
	savingPlaylist = false;
	screenTableColumns = ['#', 'Screen Title', 'Dealer', 'Host', 'Type', 'Template', 'Created By'];
	screens: API_SCREEN_OF_PLAYLIST[];
	searchForm = new FormControl();
	selectedPlaylistContents = [];
	sortablejs: any;
	sortablejsTriggered: Subject<boolean> = new Subject<boolean>();
	videoCount = 0;

	private _socket: any;
	private playlistContentsBackup: API_CONTENT_V2[] = [];
	private playlistId: string;
	protected _unsubscribe = new Subject<void>();

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _auth: AuthService,
		private _dialog: MatDialog,
		private _playlist: SinglePlaylistService,
		private _isVideo: IsvideoPipe
	) {
		this._socket = io(environment.socket_server, {
			transports: ['websocket'],
			query: 'client=Dashboard__SinglePlaylistComponent'
		});

		this._socket.on('connect', () => {});
		this._socket.on('disconnect', () => {});
	}

	ngOnInit() {
		this.playlistRouteInit();

		let role = this.currentRole;
		if (role === UI_ROLE_DEFINITION_TEXT.dealeradmin) {
			role = UI_ROLE_DEFINITION_TEXT.administrator;
		}

		this.hostURL = `/` + role + `/hosts/`;
		this.licenseURL = `/` + role + `/licenses/`;
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	private addContents(data: AddPlaylistContent) {
		this.playlist = null;

		this._playlist
			.addContent(data)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe({
				next: (res) => {
					this.playlistRouteInit();
				},
				error: (err) => console.log('Error adding contents to playlist', err)
			});
	}

	public addToLicenseToPush(e: { checked: boolean }, licenseId: string) {
		if (e.checked && !this.licensesToUpdate.includes(licenseId)) this.licensesToUpdate.push({ licenseId: licenseId });
		else this.licensesToUpdate = this.licensesToUpdate.filter((i) => i.licenseId !== licenseId);
	}

	public filterContent(filterType: string, filterValue: string) {
		switch (filterType) {
			case PlaylistFilterActions.contentType:
				this.currentFilters.type = filterValue;
				break;

			case PlaylistFilterActions.contentStatus:
				this.currentFilters.status = filterValue;
				break;

			default:
				this.currentFilters.keyword = filterValue;
		}

		const filterByKeyword = (c: API_CONTENT_V2) => {
			if (!this.currentFilters.keyword || this.currentFilters.keyword.trim().length <= 0) return Array.from(this.playlistContentsBackup);

			return c.fileName.toLowerCase().includes(this.currentFilters.keyword.toLowerCase());
		};

		const filterByContentType = (c: API_CONTENT_V2) => {
			const filter = this.currentFilters.type;

			switch (filter) {
				case 'image':
					return IMAGE_TYPES.includes(c.fileType);
				case 'video':
					return VIDEO_TYPES.includes(c.fileType);
				case 'feed':
					return FEED_TYPES.includes(c.fileType);
				default: // all
					return Array.from(this.playlistContentsBackup);
			}
		};

		const filterByStatus = (c: API_CONTENT_V2) => {
			const filter = this.currentFilters.status;

			switch (filter) {
				case 'active':
					return c.scheduleStatus === 'active';
				case 'inactive':
					return c.scheduleStatus === 'inactive';
				case 'in-queue':
					return c.scheduleStatus === 'future';
				case 'scheduled':
					return c.scheduleStatus === 'scheduled';
				default: // all
					return Array.from(this.playlistContentsBackup);
			}
		};

		let result = Array.from(this.playlistContentsBackup);

		if (this.currentFilters.status === 'scheduled') {
			result = result
				.filter(filterByKeyword)
				.filter(filterByContentType)
				.filter((c) => c.scheduleStatus !== 'active');
		} else {
			result = result.filter(filterByKeyword).filter(filterByContentType).filter(filterByStatus);
		}

		this.playlistContents = [...result];
	}

	public contentControlClicked(e: { playlistContent: any; action: string }, index: number) {
		switch (e.action) {
			case pcActions.remove:
				this.showRemoveContentDialog(e.playlistContent);
				break;
			case pcActions.edit:
				this.playlistContentSettings([e.playlistContent], false, index);
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
		const requests = [];

		const dealerContentConfig = {
			page: 1,
			pageSize: 60,
			dealerId: this.playlist.dealerId
		};

		const floatingContentConfig = {
			page: 1,
			pageSize: 60,
			floating: true
		};

		requests.push(this._playlist.contentFetch(dealerContentConfig));
		if (this.isAdmin) requests.push(this._playlist.contentFetch(floatingContentConfig));

		forkJoin(requests).subscribe({
			next: ([res1, res2]: [{ contents: API_CONTENT_V2[]; page: any }, { iContents: API_CONTENT_V2[]; page: any }]) => {
				this.assets = res1.contents;
				if (res2 && res2.iContents.length) this.floatingAssets = res2.iContents;

				this.playlistControls = this.playlistControls.map((p) => {
					/** Add Bulk Button Actions Here */
					if (p.action == pActions.addContent)
						return { ...p, icon: this.assets.length ? 'fas fa-plus' : 'fas fa-ban', disabled: !this.assets.length };
					return p;
				});

				/** Send signal */
				this._playlist.contentReady(res1.contents);
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
			{ label: 'Content Count', total: this.playlistContents.length },
			{ label: 'All Videos', total: this.videoCount },
			{ label: 'All Images', total: this.imageCount },
			{ label: 'All Feeds', total: this.feedCount }
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
				this.playlistContentsBackup = Array.from(this.playlistContents);
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

	private getPlaylistScreens(playlistId: string) {
		return this._playlist
			.getPlaylistScreens(playlistId)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe(
				(response) => {
					this.playlistScreens = response.screens;
					this.mapToTable(this.playlistScreens);
				},
				(error) => {
					throw new Error(error);
				}
			);
	}

	private mapToTable(screens) {
		let counter = 1;
		// const route = Object.keys(UI_ROLE_DEFINITION).find((key) => UI_ROLE_DEFINITION[key] === this._auth.current_user_value.role_id);
		let role = this.currentRole;
		if (role === UI_ROLE_DEFINITION_TEXT.dealeradmin) {
			role = UI_ROLE_DEFINITION_TEXT.administrator;
		}
		if (screens) {
			this.playlistScreenTable = [];
			this.playlistScreenTable = screens.map((i) => {
				return new UI_PLAYLIST_SCREENS_NEW(
					{ value: i.screenId, link: null, editable: false, hidden: true },
					{ value: counter++, link: null, editable: false, hidden: false },
					{ value: i.screenName, link: `/` + role + `/screens/` + i.screenId, editable: false, hidden: false, new_tab_link: true },
					{ value: i.businessName, link: null, editable: false, hidden: false },
					{ value: i.hostName, link: null, editable: false, hidden: false },
					{ value: i.screenTypeName || '--', link: null, editable: false, hidden: false },
					{ value: i.templateName, link: null, editable: false, hidden: false },
					{ value: i.createdBy, link: null, editable: false, hidden: false }
				);
			});
		} else {
			this.playlistScreenTable = {
				message: 'No Screens Available'
			};
		}
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

	private showPlaylistSchedules() {
		const contents = this.playlistContents;

		this._dialog.open(ViewSchedulesComponent, {
			width: '1280px',
			data: { contents },
			autoFocus: false
		});
	}

	private showPlaylistDemo() {
		this._dialog.open(PlaylistDemoComponent, {
			data: {
				playlistId: this.playlist.playlistId,
				playlistContents: this.playlistContents
			},
			width: '768px',
			height: '432px',
			panelClass: 'no-padding'
		});
	}

	private onChangeViewOptions(action: string) {
		this.detailedViewMode = action === PlaylistViewOptionActions.detailedView;
		const detailedViewIndex = this.playlistViews.findIndex((v) => v.label === 'Detailed View');
		const gridViewIndex = this.playlistViews.findIndex((v) => v.label === 'Grid View');

		if (this.detailedViewMode) {
			this.playlistViews[detailedViewIndex].is_selected = true;
			this.playlistViews[gridViewIndex].is_selected = false;
			return;
		}

		this.playlistViews[detailedViewIndex].is_selected = false;
		this.playlistViews[gridViewIndex].is_selected = true;
	}

	public playlistContentSelected(playlistContentId: string) {
		if (this.selectedPlaylistContents.includes(playlistContentId))
			this.selectedPlaylistContents = this.selectedPlaylistContents.filter((p) => p !== playlistContentId);
		else this.selectedPlaylistContents.push(playlistContentId);

		this.setBulkControlsState();
	}

	public pushUpdateToSelectedLicenses() {
		this.warningModal(
			'warning',
			'Push Playlist Updates',
			`You are about to push playlist updates to ${this.licensesToUpdate.length} licenses?`,
			`Playlist Update will be pushed on ${this.licensesToUpdate.length} licenses. Click OK to Continue.`,
			'update',
			this.licensesToUpdate
		);
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
				seq: index + 1,
				scheduleStatus: this._playlist.getScheduleStatus(content)
			};
		});
	}

	private playlistContentSettings(playlistContents: API_CONTENT_V2[], bulkSet = false, index?: number) {
		const hasExistingSchedule = playlistContents.length === 1 && playlistContents[0].type === 3;
		const scheduleType = bulkSet ? 1 : playlistContents[0].type;
		const data = {
			playlistContents,
			hostLicenses: this.playlistHostLicenses,
			bulkSet,
			hasExistingSchedule,
			scheduleType,
			allContents: this.playlistContents,
			index
		};
		const configs: MatDialogConfig = { width: '1270px', disableClose: true, data };

		this._dialog
			.open(ContentSettingsComponent, configs)
			.afterClosed()
			.subscribe({
				next: (res: { contentUpdates: PlaylistContent[]; blacklistUpdates: BlacklistUpdates }) => {
					if (!res) return;

					/** Store updates for saving */
					res.contentUpdates.forEach((p) => this.playlistContentsToSave.push(p.playlistContentId));

					this.savePlaylistContentUpdates(res, false);
				}
			});
	}

	public playlistContentMoveSwap(playlistContent: API_CONTENT_V2) {
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
			case pActions.newSpacer:
				this.showNewSpacerDialog();
				break;
			case pActions.bulkModify:
				/** Find playlist contents from selected playlist content ids */
				const selected = this.playlistContents.filter((obj) => this.selectedPlaylistContents.includes(obj.playlistContentId));
				this.playlistContentSettings(selected, true);
				break;
			case pActions.savePlaylist:
				this.savePlaylistContentUpdates({ contentUpdates: this.playlistSequenceUpdates });
				break;
			case pActions.bulkDelete:
				this.showRemoveContentDialog();
				break;
			default:
				break;
		}
	}

	private playlistRouteInit() {
		this._activatedRoute.paramMap.subscribe((data: any) => {
			this.playlistId = data.params.data;
			this.getPlaylistData(this.playlistId);
			this.getPlaylistHostLicenses(this.playlistId);
			this.getPlaylistScreens(this.playlistId);
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
			this.savePlaylistContentUpdates({ contentUpdates: this.playlistSequenceUpdates }, true);
			return;
		}

		this.setBulkControlsState();
	}

	private removePlaylistContents(playlistContentIds: string[]) {
		if (playlistContentIds.length <= 0) return;

		let requests = [];

		playlistContentIds.forEach((id) => {
			requests.push(this._playlist.removePlaylistContent(this.playlistId, id));
		});

		forkJoin(requests)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe({
				next: () => {
					// remove the deleted content(s) from the array
					this.playlistContents = this.playlistContents.filter((c) => playlistContentIds.indexOf(c.playlistContentId) === -1);

					// update the total number of contents on the breakdown
					const indexForTotalCount = this.playlistContentBreakdown.findIndex((c) => c.label === 'Content Count');
					this.playlistContentBreakdown[indexForTotalCount].total = this.playlistContents.length;
				},
				error: (e) => console.log('Error removing playlist contentes', e)
			});
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
		this.searchForm.valueChanges.pipe(debounceTime(1000)).subscribe({
			next: (keyword: string) => {
				this.filterContent('search', keyword);
			}
		});
	}

	private setFullscreenProperty(p: API_CONTENT_V2) {
		this.playlistContentsToSave.push(p.playlistContentId);

		this.savePlaylistContentUpdates(
			{
				contentUpdates: [
					{
						playlistContentId: p.playlistContentId,
						isFullScreen: !p.isFullScreen ? 1 : 0
					}
				]
			},
			false
		);
	}

	private showAddContentDialog(contentToSwap?: API_CONTENT_V2) {
		const configs = {
			disableClose: true,
			data: {
				assets: this.assets,
				dealerId: this.playlist.dealerId,
				floatingAssets: this.floatingAssets,
				hostLicenses: this.playlistHostLicenses,
				isDealer: this.isDealer,
				playlistContentId: contentToSwap ? contentToSwap.playlistContentId : null,
				playlistId: this.playlist.playlistId
			}
		};

		this._dialog
			.open(AddContentComponent, configs)
			.afterClosed()
			.subscribe({
				next: (response: AddPlaylistContent | API_CONTENT | undefined) => {
					// closed or cancelled the dialog
					if (typeof response === 'undefined') return;

					if (typeof contentToSwap === 'undefined') {
						this.addContents(response as AddPlaylistContent);
						return;
					}

					this.swapContent(response as API_CONTENT, contentToSwap);
				}
			});
	}

	private showRemoveContentDialog(content?: API_CONTENT_V2) {
		const DEFAULT_WIDTH = '500px';
		const DEFAULT_HEIGHT = '350px';
		const dataMsg = typeof content === 'undefined' ? 'Proceed removing these contents?' : `Filename: ${content.fileName}`;
		let returnMsg = 'Success!';

		if (typeof content === 'undefined') returnMsg += ` ${this.selectedPlaylistContents.length} contents have been removed`;
		else returnMsg += ' Content has been removed';

		const data = {
			status: 'warning',
			action: 'delete',
			data: dataMsg,
			message: 'Remove Content(s)',
			return_msg: returnMsg
		};

		const configs: MatDialogConfig = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, disableClose: true, data };
		const idsToDelete = typeof content === 'undefined' ? this.selectedPlaylistContents : [content.playlistContentId];

		this._dialog
			.open(ConfirmationModalComponent, configs)
			.afterClosed()
			.subscribe((response: string | boolean) => {
				if (!response) return;
				this.removePlaylistContents(idsToDelete);
			});
	}

	private showNewSpacerDialog() {
		this._dialog
			.open(SpacerSetupComponent, {
				width: '860px',
				data: {
					hostLicenses: this.playlistHostLicenses
				}
			})
			.afterClosed();
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

	private swapContent(newContent: API_CONTENT, playlistContent: API_CONTENT_V2) {
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

	private savePlaylistContentUpdates(data: SavePlaylistContentUpdate, savingPlaylist = true) {
		let updateFrequencyCount = 0;
		const toUpdate: PlaylistContentUpdate = {
			playlistId: this.playlist.playlistId,
			playlistContentsLicenses: savingPlaylist ? this.playlistSequenceUpdates : data.contentUpdates
		};

		const requests = [this._playlist.updatePlaylistContent(toUpdate)];
		const schedulesToUpdate = data.contentUpdates.filter((c) => typeof c.schedule !== 'undefined').map((c) => c.schedule);

		toUpdate.playlistContentsLicenses = data.contentUpdates.map((c) => {
			// remove the schedule object after using it to filter
			delete c.schedule;

			// set the API calls for contents that have updated frequencies
			if (c.frequency !== 0) {
				// if frequency is 1 then revert
				if (c.frequency === 1) requests.push(this._playlist.revert_frequency(c.playlistContentId));
				// else update the frequency
				else requests.push(this._playlist.set_frequency(c.frequency, c.playlistContentId, this.playlistId));

				updateFrequencyCount++;
			}

			return c;
		});

		if (data.blacklistUpdates && data.blacklistUpdates.licenses.length) requests.push(this._playlist.removeWhitelist([data.blacklistUpdates]));

		// api call to update content schedule
		if (schedulesToUpdate.length > 0) requests.push(this._playlist.updateContentSchedule(schedulesToUpdate));

		this.savingPlaylist = savingPlaylist;

		forkJoin(requests)
			.pipe(takeUntil(this._unsubscribe))
			.subscribe({
				next: () => {
					this.savingPlaylist = false;
					this.selectedPlaylistContents = [];
					this.playlistContentsToSave = [];

					if (savingPlaylist) {
						this.playlistSequenceUpdates = [];
						this.sortablejsTriggered.next(false);
					}

					this.setBulkControlsState();

					this.playlistContents = this.playlistContents
						.map((p) => {
							const updateObj = toUpdate.playlistContentsLicenses.find((u) => u.playlistContentId === p.playlistContentId);
							const mapped = updateObj ? { ...p, ...updateObj } : p;
							return mapped;
						})
						.map((c) => {
							// map to update the content array schedules after submitting to the server
							// this is assuming that all requests will be successful
							// maybe refactor this in the near future to use zip instead of forkJoin

							schedulesToUpdate.forEach((toUpdate) => {
								if (c.playlistContentsScheduleId === toUpdate.playlistContentsScheduleId) {
									Object.keys(toUpdate).forEach((key) => {
										c[key] = toUpdate[key];
										c.scheduleStatus = this._playlist.getScheduleStatus(toUpdate);
									});
								}
							});

							return c;
						})
						.sort((a, b) => {
							const order = this.playlistSortableOrder;
							return order.indexOf(a.playlistContentId) - order.indexOf(b.playlistContentId);
						});

					setTimeout(() => {
						this.sortableJSInit();
					}, 0);

					if (updateFrequencyCount > 0) this.playlistRouteInit();
				}
			});
	}

	public viewButtonClicked(action: string) {
		switch (action) {
			case PlaylistViewOptionActions.detailedView:
				this.onChangeViewOptions(action);
				break;
			case PlaylistViewOptionActions.gridView:
				this.onChangeViewOptions(action);
				break;
			case PlaylistPrimaryControlActions.playlistDemo:
				this.showPlaylistDemo();
				break;
			// case PlaylistPrimaryControlActions.viewSchedule:
			// 	this.showPlaylistSchedules();
			// 	break;
			default:
				break;
		}
	}

	private warningModal(status: string, message: string, data: string, return_msg: string, action: string, licenses: API_LICENSE_PROPS[]): void {
		this._dialog.closeAll();

		const dialogData = {
			status: status,
			message: message,
			data: data,
			return_msg: return_msg,
			action: action
		};

		const configs: MatDialogConfig = {
			width: '500px',
			height: '350px',
			disableClose: true,
			data: dialogData
		};

		const dialogRef = this._dialog.open(ConfirmationModalComponent, configs);

		dialogRef.afterClosed().subscribe((result) => {
			if (result === 'update') {
				licenses.forEach((p) => {
					this._socket.emit('D_update_player', p.licenseId);
				});

				this.ngOnInit();
			}
		});
	}

	protected get currentUser() {
		return this._auth.current_user_value;
	}

	protected get currentRole() {
		return this._auth.current_role;
	}

	protected get isAdmin() {
		return this._auth.current_role === 'administrator';
	}

	protected get isDealer() {
		return this._auth.current_role === 'dealer';
	}
}
