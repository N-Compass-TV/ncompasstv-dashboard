import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/global/services/base.service';
import { NewPlaylistContent } from '../interface/NewPlaylistContent';

@Injectable({
	providedIn: 'root'
})
export class SinglePlaylistService extends BaseService {
	addContent(data: NewPlaylistContent) {
		return this.postRequest('playlistsv2/addcontent', data);
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
}
