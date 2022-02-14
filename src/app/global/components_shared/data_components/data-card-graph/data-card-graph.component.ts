import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import Chart from 'chart.js/auto';

import { HelperService } from 'src/app/global/services';

@Component({
	selector: 'app-data-card-graph',
    templateUrl: './data-card-graph.component.html',
    styleUrls: ['./data-card-graph.component.scss']
})
export class DataCardGraphComponent implements OnInit, OnDestroy, AfterViewInit {

	@Input() compare_basis: number;
	@Input() compare_basis_label: string;
	@Input() compare_basis_sub_label: string;
	@Input() good_value: number;
	@Input() good_value_label: string;
	@Input() bad_value: number;
	@Input() bad_value_label: string; 
	@Input() third_value: number;
	@Input() third_value_label: string; 
	@Input() additional_value: number;
	@Input() additional_value_label: string;
	@Input() online_value: number;
	@Input() online_value_label: string;
	@Input() offline_value: number;
	@Input() offline_value_label: string;
	@Input() average_basis: number;
	@Input() average_basis_label: string;
	@Input() id: string;
	@Input() is_green: boolean;
    @Input() icon: string;
    @Input() label_array: [];
    @Input() value_array: [];
	@Input() page?: string;
	@Input() has_dealer_status_filter? = false;
    @Input() has_breakdown? = false;
    @Input() breakdown1_value? : number;
    @Input() breakdown1_label? : string;
    @Input() breakdown2_value? : number;
    @Input() breakdown2_label? : string;
    @Input() breakdown3_value? : number;
    @Input() breakdown3_label? : string;
    @Input() breakdown4_value? : number;
    @Input() breakdown4_label? : string;
    @Input() breakdown4_sub_label? : string;
    @Input() breakdown5_value? : number;
    @Input() breakdown5_label? : string;

	has_selected_active = false;
	has_selected_inactive = false;

	private chart: Chart;
	protected _unsubscribe = new Subject<void>();

	constructor(
		private _helper: HelperService
	) { }

	ngOnInit() {
	}

	ngAfterViewInit() {
        if(this.label_array) {
            this.generateChart();
        }
	}

	ngOnDestroy() {
        if(this.label_array) {
		    this.chart.destroy();
        }
	}

	generateChart() {
        const canvas =  <HTMLCanvasElement> document.getElementById(`breakdown-${this.id}`) as HTMLCanvasElement;
        const labels = this.label_array;
		const data = this.value_array;

        this.chart = new Chart(canvas, {
			type: 'pie',
			data: { labels, 
                datasets: [{ 
                    data,
                    backgroundColor: ["#c1ef82", "#97ddd3", "#9e96df", "gray", "#771c8a"],
                }], 
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            boxWidth: 10,
                        }
                    },
                    tooltip: {
                        enabled: false
                    },
                    title: {
                        text: 'Screen Type Count',
                        display: true
                    }
               },                
            },
		});
    }


}

