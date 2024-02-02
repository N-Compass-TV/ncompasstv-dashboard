import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { PlaylistContentSchedule } from './playlist-content-schedule.model';

export interface API_CONTENT_V2 {
    advertiserId: any;
    createdByName?: string;
    contentId: any;
    dateCreated: any;
    dealerId: any;
    description: any;
    feedId: any;
    fileName: any;
    fileType: any;
    isConverted: any;
    isFullScreen: any;
    isProtected: any;
    playsTotal: any;
    seq: any;
    thumbnail: any;
    title: any;
    url: any;
    alternateWeek?: number;
    classification?: string;
    creditsEnabled?: number | boolean;
    days?: string;
    duration?: number;
    filesize?: string | number;
    frequency?: number;
    from?: string;
    handlerId?: string;
    hostId?: string;
    liveStream?: number;
    parentId?: string;
    playTimeEnd?: null;
    playTimeEndData?: NgbTimeStruct;
    playTimeStart?: null;
    playTimeStartData?: NgbTimeStruct;
    playlistContentId?: string;
    playlistContentsScheduleId?: string;
    prefix?: string;
    previewThumbnail?: string;
    refDealerId?: string;
    schedule?: PlaylistContentSchedule;
    scheduleStatus?: string;
    status?: string;
    to?: string;
    type?: number;
    uuid?: string;
}
