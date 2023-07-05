import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MOVE_SWAP } from '../../constants/MoveSwap';
import { ButtonGroup } from '../../type/ButtonGroup';
import { MAT_DIALOG_DATA } from '@angular/material';
import { API_CONTENT } from 'src/app/global/models';

@Component({
	selector: 'app-move-swap',
	templateUrl: './move-swap.component.html',
	styleUrls: ['./move-swap.component.scss']
})
export class MoveSwapComponent implements OnInit {
	moveSwap = MOVE_SWAP;
	moveSwapForm: FormGroup;
	selectedAction: ButtonGroup = this.moveSwap[0];
	playlistContent;
	playlistCount = 0;

	constructor(
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			playlistContent: API_CONTENT;
			playlistContentCount: number;
		}
	) {
		this.playlistContent = this.data.playlistContent;
		this.playlistCount = this.data.playlistContentCount;
	}

	ngOnInit() {
		this.moveSwapForm = this._formBuilder.group({
			seq: [this.playlistContent.seq, [Validators.required, this.numberRangeValidator(this.playlistCount)]]
		});
	}

	numberRangeValidator(maxValue: number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			const value = Number(control.value);

			if (isNaN(value) || value < 1 || value > maxValue) {
				return { numberRange: true };
			}

			return null;
		};
	}
}
