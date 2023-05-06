import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/global/services/base.service';

@Injectable({
	providedIn: 'root'
})
export class SinglePlaylistService extends BaseService {
	getPlaylistData(playlistId: string) {
		return this.getRequest(`playlistsv2?playlistid=${playlistId}`);
	}

	getPlaylistHosts(playlistId: string) {
		return this.getRequest(`playlistsv2/gethostlicenses?playlistid=${playlistId}`).map((data: any) => data.hostLicenses);
	}
}
