export class UI_DEALER_PLAYLIST {
    playlist_id: object;
    count: object;
    name: object;
    playlist_desc: object;
    date_created: object;
    allow_export: object;
    total_content: object;

    constructor(
        playlistId: object,
        count: object,
        name: object,
        playlistDescription: object,
        dateCreated: object,
        total_content: object,
        allow_export?: object,
    ) {
        this.playlist_id = playlistId;
        this.count = count;
        this.name = name;
        this.playlist_desc = playlistDescription;
        this.date_created = dateCreated;
        this.allow_export = allow_export;
        this.total_content = total_content;
    }
}
