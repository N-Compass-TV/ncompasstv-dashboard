import { Component, OnInit, Input } from '@angular/core';
import Chart from 'chart.js/auto';
import { Subject } from 'rxjs';
import {Router} from "@angular/router"
import { AuthService } from 'src/app/global/services';

@Component({
  selector: 'app-data-graph-compare',
  templateUrl: './data-graph-compare.component.html',
  styleUrls: ['./data-graph-compare.component.scss']
})
export class DataGraphCompareComponent implements OnInit {

    @Input() id: string;
    @Input() label_array: [];
    @Input() value_array: [];
    @Input() title: string;

	private chart: Chart;
	protected _unsubscribe = new Subject<void>();

	constructor(private router: Router, private _auth: AuthService
	) { }

	ngOnInit() {
	}

	ngAfterViewInit() {
		this.generateChart();
	}

	ngOnDestroy() {
		this.chart.destroy();
	}

	generateChart() {
        const canvas =  <HTMLCanvasElement> document.getElementById(`compare-${this.id}`) as HTMLCanvasElement;
        const labels = this.label_array;
		const data = this.value_array;
        var progress = document.getElementById('animationProgress');

        this.chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
                labels: labels,
                datasets: [{
                    label: '',
                    backgroundColor: [
                        'rgb(193, 239, 130)',
                        'rgb(255, 131, 157)',
                        'rgb(151, 221, 211)',
                    ],
                    data,
                }]
            },
            options: {
                onClick: (evt, item) => {
                    if(this.id === 'status'){
                        if(item)
                        {
                            this.router.navigate([`/${this.currentRole}/licenses`, 
                                        {status: item[0].index === 0 ? 'Online': 'Offline'}])
                        }
                    }
                },
                responsive: true,
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
                    }
               },
               animations: {
                tension: {
                  duration: 1000,
                  easing: 'linear',
                  from: 1,
                  to: 0,
                  loop: false
                }
              },       
            },
		});
        
    }

    protected get currentRole() {
		return this._auth.current_role;
	}

}