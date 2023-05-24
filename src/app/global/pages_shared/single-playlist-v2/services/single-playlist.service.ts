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
}
