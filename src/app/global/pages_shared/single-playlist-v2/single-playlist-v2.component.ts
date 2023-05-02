import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Sortable } from 'sortablejs';
import { API_CONTENT, API_HOST, API_LICENSE_PROPS, API_SCREEN_OF_PLAYLIST, API_SINGLE_PLAYLIST, API_SINGLE_PLAYLIST_INFO } from '../../models';
import { ContentSettingsComponent } from './components/content-settings/content-settings.component';
import { PlaylistPrimaryControlActions as pActions, PlaylistPrimaryControls, PlaylistContentControlActions as pcActions } from './constants';

import { SinglePlaylistService } from './services/single-playlist.service';

@Component({
	selector: 'app-single-playlist-v2',
	templateUrl: './single-playlist-v2.component.html',
	styleUrls: ['./single-playlist-v2.component.scss']
})
export class SinglePlaylistV2Component implements OnInit {
	@ViewChild('draggables', { static: false }) draggables: ElementRef<HTMLCanvasElement>;
	hostLicenses: any;
	hosts: API_HOST[];
	licenses: API_LICENSE_PROPS[];
	playlist: API_SINGLE_PLAYLIST_INFO;
	playlistContents: API_CONTENT[];
	screens: API_SCREEN_OF_PLAYLIST[];
	selectedPlaylistContents = [];
	playlistControls = PlaylistPrimaryControls;

	constructor(private _activatedRoute: ActivatedRoute, private _dialog: MatDialog, private _playlist: SinglePlaylistService) {}

	ngOnInit() {
		this.playlistRouteInit();
	}

	contentControlClicked(e: { playlistContent: any; action: string }) {
		switch (e.action) {
			case pcActions.delete:
				break;
			case pcActions.edit:
				this._dialog.open(ContentSettingsComponent, {
					width: '1200px',
					height: '750px',
					data: e.playlistContent
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

	contentSelected(playlistContentId: string) {
		if (this.selectedPlaylistContents.includes(playlistContentId)) {
			this.selectedPlaylistContents = this.selectedPlaylistContents.filter((p) => p !== playlistContentId);
		} else {
			this.selectedPlaylistContents.push(playlistContentId);
		}

		this.playlistControls = this.playlistControls.map((p) => {
			/** Add Bulk Button Actions Here */
			if (p.action == pActions.bulkModify || p.action == pActions.bulkDelete)
				return { ...p, disabled: this.selectedPlaylistContents.length < 1 };
			return p;
		});
	}

	getPlaylistData(playlistId: string) {
		this._playlist.getPlaylistData(playlistId).subscribe({
			next: (data: API_SINGLE_PLAYLIST) => {
				/** This call should only return playlist related data like the ones below */
				this.playlist = data.playlist;
				this.playlistContents = data.playlistContents;

				/** These data should be coming from another API call but since they're included ... */
				this.screens = data.screens;
				this.hostLicenses = data.hostLicenses;
				this.licenses = data.licenses;

				/** Initialize SortableJS */
				setTimeout(() => this.sortableJSInit(), 0);
			},
			error: (error) => {
				throw Error(error);
			}
		});
	}

	playlistRouteInit() {
		this._activatedRoute.paramMap.subscribe((data: any) => {
			this.getPlaylistData(data.params.data);
		});
	}

	sortableJSInit(): void {
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
