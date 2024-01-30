export class UI_PLACER_DATA {
    index: object;
    placer_id: object;
    placer_name: object;
    host_name: object;
    foot_traffic: object;
    average_dwell_time: object;
    month: object;
    upload_date: object;
    upload_by: object;
    publication_date: object;
    source_file: object;
    placer_dump_id: object;
    constructor(
        index: object,
        placer_id: object,
        placer_name: object,
        host_name: object,
        foot_traffic: object,
        average_dwell_time: object,
        month: object,
        upload_date: object,
        upload_by: object,
        publication_date: object,
        source_file: object,
        placer_dump_id: object
    ) {
        this.index = index;
        this.placer_id = placer_id;
        this.placer_name = placer_name;
        this.host_name = host_name;
        this.foot_traffic = foot_traffic;
        this.average_dwell_time = average_dwell_time;
        this.month = month;
        this.upload_date = upload_date;
        this.upload_by = upload_by;
        this.publication_date = publication_date;
        this.source_file = source_file;
        this.placer_dump_id = placer_dump_id;
    }
}
