import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { API_CONTENT } from 'src/app/global/models';
import { PlaylistContentControls } from '../../constants/PlaylistContentControls';

@Component({
	selector: 'app-content',
	templateUrl: './content.component.html',
	styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
	@Input() content: API_CONTENT;
	@Input() index: number;
	@Output() control_click: EventEmitter<any> = new EventEmitter();
	@Output() content_selected: EventEmitter<string> = new EventEmitter();
	contentName: string;
	playlistContentControls = PlaylistContentControls;

	constructor() {}

	ngOnInit() {}
}
