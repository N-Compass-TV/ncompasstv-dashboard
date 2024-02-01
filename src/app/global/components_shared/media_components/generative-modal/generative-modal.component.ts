import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error } from 'console';
import { ContentService } from 'src/app/global/services';

@Component({
    selector: 'app-generative-modal',
    templateUrl: './generative-modal.component.html',
    styleUrls: ['./generative-modal.component.scss'],
})
export class GenerativeModalComponent implements OnInit {
    generativeAIForm: FormGroup;
    generatingImage = false;
    imageResult = '';
    revisedPrompt = '';

    constructor(private _form: FormBuilder, private _contentService: ContentService) {}

    ngOnInit() {
        this.prepareCategoryForm();
    }

    prepareCategoryForm() {
        this.generativeAIForm = this._form.group({
            prompt: ['', Validators.required],
        });
    }

    generateImage() {
        this.generatingImage = true;
        this.imageResult = '';
        this._contentService.generate_image(this.generativeAIForm.value['prompt']).subscribe({
            next: (response: {
                created: number;
                data: {
                    revised_prompt: string;
                    url: string;
                }[];
            }) => {
                this.imageResult = response.data[0].url;
                this.revisedPrompt = response.data[0].revised_prompt;
                setTimeout(() => {
                    this.generatingImage = false;
                }, 200);
            },
            error: (error) => {
                alert(`Something went wrong: ${error}`);
            },
        });
    }

    uploadGeneratedImage() {
        alert('Uploading Image!');
    }
}
