import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/global/services/base.service';
import { AddPlaylistContent } from '../class/AddPlaylistContent';
import { PlaylistContentUpdate } from '../type/PlaylistContentUpdate';
import { Observable, Subject } from 'rxjs';
import { API_CONTENT_V2, API_PLAYLIST_V2 } from 'src/app/global/models';

@Injectable({
	providedIn: 'root'
})
export class SinglePlaylistService extends BaseService {
	private contentLoaded = new Subject<any>();
	private hostLoaded = new Subject<any>();
	contentLoaded$ = this.contentLoaded.asObservable();
	hostLoaded$ = this.hostLoaded.asObservable();

	addContent(data: AddPlaylistContent) {
		return this.postRequest('playlistsv2/addcontent', data);
	}

	contentReady(contents: API_CONTENT_V2[]) {
		this.contentLoaded.next(contents);
	}

	hostsReady(hosts: any) {
		this.hostLoaded.next(hosts);
	}

	getAvailableDealerAssets(dealerId: string = '136ce61b-8c69-4723-95f3-45600090cf8b', page: number = 1, pageSize: number = 60) {
		return this.getRequest(`content/getbydealerid?dealerid=${dealerId}&page=${page}&pageSize=${pageSize}`);
	}

	getPlaylistData(playlistId: string): Observable<API_PLAYLIST_V2> {
		return this.getRequest(`playlistsv2?playlistid=${playlistId}`);
	}

	getPlaylistHosts(playlistId: string) {
		return this.getRequest(`playlistsv2/gethostlicenses?playlistid=${playlistId}`).map((data: any) => data.hostLicenses);
	}

	getPlaylistScreens(id) {
		return this.getRequest(`${this.getters.api_get_screens_of_playlist}${id}`);
	}

	getWhitelistData(playlistContentId: string) {
		return this.getRequest(`playlistsv2/GetLicensePlaylistContents?playlistContentId=${playlistContentId}`);
	}

	removeWhitelist(blacklistData: { playlistContentId: string; licenses: string[] }[]) {
		return this.postRequest(`playlistsv2/LicensePlaylistContentsDelete`, blacklistData).map((data) => data);
	}

	swapPlaylistContent(data: any) {
		return this.postRequest(`playlistsv2/swapcontent`, data);
	}

	updatePlaylistContent(data: PlaylistContentUpdate) {
		return this.postRequest(`playlistsv2/updatecontent`, data).map((data) => data);
	}
}
