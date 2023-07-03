import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MOVE_SWAP } from '../../constants/MoveSwap';

@Component({
	selector: 'app-move-swap',
	templateUrl: './move-swap.component.html',
	styleUrls: ['./move-swap.component.scss']
})
export class MoveSwapComponent implements OnInit {
	moveSwap = MOVE_SWAP;
	moveSwapForm: FormGroup;

	constructor(private _formBuilder: FormBuilder) {}

	ngOnInit() {
		this.moveSwapForm = this._formBuilder.group({
			seq: [
				{
					value: ''
				}
			]
		});
	}
}
