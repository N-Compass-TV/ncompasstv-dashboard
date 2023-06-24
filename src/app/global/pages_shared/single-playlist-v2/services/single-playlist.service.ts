import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/global/services/base.service';
import { AddPlaylistContent } from '../class/AddPlaylistContent';
import { PlaylistContentUpdate } from '../type/PlaylistContentUpdate';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
	providedIn: 'root'
})
export class SinglePlaylistService extends BaseService {
	private saving_playlist_content = new Subject<any>();
	saving_playlist_content$ = this.saving_playlist_content.asObservable();

	addContent(data: AddPlaylistContent) {
		return this.postRequest('playlistsv2/addcontent', data);
	}

	getAvailableDealerAssets(dealerId: string = '136ce61b-8c69-4723-95f3-45600090cf8b', page: number = 1, pageSize: number = 60) {
		return this.getRequest(`content/getbydealerid?dealerid=${dealerId}&page=${page}&pageSize=${pageSize}`);
	}

	createWhitelistRecord() {}

	getPlaylistData(playlistId: string) {
		return this.getRequest(`playlistsv2?playlistid=${playlistId}`);
	}

	getPlaylistHosts(playlistId: string) {
		return this.getRequest(`playlistsv2/gethostlicenses?playlistid=${playlistId}`).map((data: any) => data.hostLicenses);
	}

	getWhitelistData(playlistContentId: string) {
		return this.getRequest(`playlistsv2/GetLicensePlaylistContents?playlistContentId=${playlistContentId}`);
	}

	savingPlaylistContent(status: boolean, playlistContentId: string) {
		this.saving_playlist_content.next({ status, playlistContentId });
	}

	updatePlaylistContent(data: PlaylistContentUpdate) {
		return this.postRequest(`playlistsv2/updatecontent`, data);
	}
}
