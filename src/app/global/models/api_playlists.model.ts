export class API_PLAYLIST {
    businessName: string;
    dateCreated: string;
    dateUpdated: string;
    dealerId: string;
    isMigrated: number;
    playlist: Array<any>;
    playlistDescription: string;
    playlistId: string;
    playlistType: string;
    playlists: Array<any>;
    totalScreens: number;
    playlistName?: string;
    name?: string;
    totalContents: number;
}

export interface API_PLAYLIST_MINIFIED {
    businessName: string;
    dealerId: string;
    playlistId: string;
    playlistName: string;
}
