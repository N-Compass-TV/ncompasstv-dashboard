import { Injectable, EventEmitter } from '@angular/core';
import { BaseService } from 'src/app/global/services/base.service';
import { AddPlaylistContent } from '../class/AddPlaylistContent';
import { PlaylistContentUpdate } from '../type/PlaylistContentUpdate';
import { Observable, Subject } from 'rxjs';
import { API_CONTENT_V2, API_PLAYLIST_V2, PlaylistContentSchedule, UI_CONTENT_SCHEDULE } from 'src/app/global/models';
import * as moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class SinglePlaylistService extends BaseService {
	private contentLoaded = new Subject<any>();
	private hostLoaded = new Subject<any>();
	contentLoaded$ = this.contentLoaded.asObservable();
	hostLoaded$ = this.hostLoaded.asObservable();

	receiveExistingScheduleData = new EventEmitter<PlaylistContentSchedule>();
	receiveSchedulerFormData = new EventEmitter<UI_CONTENT_SCHEDULE>();
	recheckContentSchedule = new EventEmitter<{ playlistContentId: string }>();
	requestExistingScheduleData = new EventEmitter<UI_CONTENT_SCHEDULE>();
	requestSchedulerFormData = new EventEmitter<void>();
	scheduleTypeSelected = new EventEmitter<{ type: 1 | 2 | 3; hasExistingSchedule: boolean }>();
	schedulerFormUpdated = new EventEmitter<UI_CONTENT_SCHEDULE>();

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

	/**
	 * Gets the schedule status of a playlist content based on its type
	 * @param data
	 * @returns
	 */
	getScheduleStatus(data: API_CONTENT_V2 | PlaylistContentSchedule) {
		let result = 'inactive';
		const DATE_FORMAT = 'YYYY-MM-DD';
		const TIME_FORMAT = 'hh:mm A';

		if (!data || !data.playlistContentsScheduleId) return result;

		switch (data.type) {
			case 3: // type 3 means the content only plays during the set schedule
				const currentDate = moment(new Date(), `${DATE_FORMAT} ${TIME_FORMAT}`);
				const startDate = moment(`${data.from} ${data.playTimeStart}`, `${DATE_FORMAT} ${TIME_FORMAT}`);
				const endDate = moment(`${data.to} ${data.playTimeEnd}`, `${DATE_FORMAT} ${TIME_FORMAT}`);

				if (currentDate.isBefore(startDate)) result = 'future';
				if (currentDate.isBetween(startDate, endDate, undefined)) result = 'active';
				break;

			case 2: // type 2 means the content is set to not play
				result = 'inactive';
				break;

			default: // type 1 means the content is set to always play
				result = 'active';
				break;
		}

		return result;
	}

	getWhitelistData(playlistContentId: string) {
		return this.getRequest(`playlistsv2/GetLicensePlaylistContents?playlistContentId=${playlistContentId}`);
	}

	mapScheduleFromUiContent(data: UI_CONTENT_SCHEDULE, playlistContentId?: string, contents?: API_CONTENT_V2[]) {
		const result = {} as PlaylistContentSchedule;

		switch (data.type) {
			case 1:
			case 2:
				result.type = data.type;
				break;
			default:
				const DATE_FORMAT = 'YYYY-MM-DD';
				const TIME_FORMAT = 'hh:mm A';
				result.type = 3;

				Object.keys(data).forEach((key) => {
					if (typeof data[key] === 'undefined' || (!data[key] && typeof data[key] !== 'number')) return;

					switch (key) {
						case 'days':
							result.days = data.days
								.filter((day) => day.checked)
								.map((day) => day.dayId)
								.join(',');
							break;
						case 'playTimeStartData':
						case 'playTimeEndData':
							let toParse = key === 'playTimeStartData' ? data.playTimeStartData : data.playTimeEndData;
							const resultKey = key === 'playTimeStartData' ? 'playTimeStart' : 'playTimeEnd';
							result[resultKey] = moment(`${toParse.hour}:${toParse.minute}`, 'HH:mm').format(TIME_FORMAT);
							break;
						case 'startDate':
						case 'endDate':
							const parsedDate = moment(`${data[key]}`).format(DATE_FORMAT);
							if (key === 'startDate') result.from = parsedDate;
							else result.to = parsedDate;

							break;
						default:
							result[key] = data[key];
					}
				});

				result.from += ` ${moment(result.playTimeStart, TIME_FORMAT).format('HH:mm:ss')}`;
				result.to += ` ${moment(result.playTimeEnd, TIME_FORMAT).format('HH:mm:ss')}`;
		}

		if (typeof playlistContentId !== 'undefined' && typeof contents !== 'undefined') {
			result.playlistContentsScheduleId = contents.find((c) => c.playlistContentId === playlistContentId).playlistContentsScheduleId;
		}

		return result;
	}

	removeWhitelist(blacklistData: { playlistContentId: string; licenses: string[] }[]) {
		return this.postRequest(`playlistsv2/LicensePlaylistContentsDelete`, blacklistData).map((data) => data);
	}

	swapPlaylistContent(data: any) {
		return this.postRequest(`playlistsv2/swapcontent`, data);
	}

	updateContentSchedule(data: { playlistContentsScheduleId?: string; type: number }[]) {
		return this.postRequest(this.updaters.content_schedule_v2, data);
	}

	updatePlaylistContent(data: PlaylistContentUpdate) {
		return this.postRequest(`playlistsv2/updatecontent`, data).map((data) => data);
	}
}
