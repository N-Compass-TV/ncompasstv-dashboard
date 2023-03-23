import { Component, Input, OnInit } from '@angular/core';
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
	playlistContentControls = PlaylistContentControls;

	constructor() {}

	ngOnInit() {}
}
