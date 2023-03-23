import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/global/services/base.service';

@Injectable({
	providedIn: 'root'
})
export class SinglePlaylistService extends BaseService {
	getPlaylistData(playlistId) {
		return this.getRequest(`playlists/getplaylistsbyid?playlistid=${playlistId}`);
	}
}
