import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_CONTENT, API_HOST, API_LICENSE_PROPS, API_SCREEN_OF_PLAYLIST, API_SINGLE_PLAYLIST, API_SINGLE_PLAYLIST_INFO } from '../../models';
import { PlaylistPrimaryControls } from './constants/PlaylistControls';
import { SinglePlaylistService } from './services/single-playlist.service';

@Component({
	selector: 'app-single-playlist-v2',
	templateUrl: './single-playlist-v2.component.html',
	styleUrls: ['./single-playlist-v2.component.scss']
})
export class SinglePlaylistV2Component implements OnInit {
	hostLicenses: any;
	hosts: API_HOST[];
	licenses: API_LICENSE_PROPS[];
	playlist: API_SINGLE_PLAYLIST_INFO;
	playlistContents: API_CONTENT[];
	screens: API_SCREEN_OF_PLAYLIST[];
	playlistControls = PlaylistPrimaryControls;

	constructor(private _activatedRoute: ActivatedRoute, private _playlist: SinglePlaylistService) {}

	ngOnInit() {
		this.playlistRouteInit();
	}

	playlistRouteInit() {
		this._activatedRoute.paramMap.subscribe((data: any) => {
			this.getPlaylistData(data.params.data);
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
			},
			error: (error) => {
				throw Error(error);
			}
		});
	}
}
