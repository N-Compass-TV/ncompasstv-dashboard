export class UI_TABLE_CONTENT_METRICS {
    index: object;
    file_name: object;
    playing_where: object;
    play_count: object;
    duration: object;
   
    constructor(
        index: object, file_name: object, playing_where: object, play_count: object,
        duration: object) {
        this.index = index;
        this.file_name = file_name;
        this.playing_where = playing_where;
        this.play_count = play_count;
        this.duration = duration;
    }
}