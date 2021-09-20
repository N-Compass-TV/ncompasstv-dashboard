import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UI_SINGLE_SCREEN } from 'src/app/global/models';
import { API_RESOURCE_DATA, API_RESOURCE_DATA_COUNT } from 'src/app/global/models/api_resource-data.model';
import { LicenseService } from 'src/app/global/services';

@Component({
  selector: 'app-resource-tab',
  templateUrl: './resource-tab.component.html',
  styleUrls: ['./resource-tab.component.scss']
})
export class ResourceTabComponent implements OnInit {
  
  @Input() license_id: string;
	@Input() screen: UI_SINGLE_SCREEN;
	@Input() realtime_data: EventEmitter<any>;

  analytics_reload: Subject<any> = new Subject();
  destroy_ram_charts = false;
  destroy_cpu_charts = false;
  dateRange_chart_updating = true;
  queried_date: string;

  resource_logs: any = [];
  resource_data: Array<API_RESOURCE_DATA> = [];
  ramUsageCount: Array<API_RESOURCE_DATA_COUNT> = [];
  cpuUsageCount: Array<API_RESOURCE_DATA_COUNT> = [];

  display_mode: string = "dateRange";

  contentsForm: FormGroup = this._form_builder.group({ 
    start_date: [ '', Validators.required ],
    end_date: [ '', Validators.required ],
	});

  start_date: Date;
  end_date: Date;
  current_date: any = moment().format('dddd	- MMMM D, YYYY');

  protected _unsubscribe: Subject<void> = new Subject<void>();

  constructor(
     private _form_builder: FormBuilder,
     private _license: LicenseService) { }

  ngOnInit() {
    this.queried_date = moment().format('MMMM D, YYYY');
    this.getLicenseResourceUsage(this.license_id);
  }

  ngOnDestroy() {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

  //For Future Implementation/Reference
  // onSelectStartDate(e) {
  //   this.start_date = e.format('YYYY-MM-DD');
  //   if(this.end_date){
  //    this.getLicenseResourceUsage(this.license_id);
  //   }
  // }

  // onSelectEndDate(e){
  //   this.end_date = e.format('YYYY-MM-DD');
  //   if(this.start_date){
  //     this.getLicenseResourceUsage(this.license_id);
  //   }
  //   const currentDate = moment();
	// 	this.queried_date = currentDate.format('MMMM D, YYYY');
  // }

  getLicenseResourceUsage(id: string) {
  //let startDate = moment(this.start_date).format('YYYY-MM-DD');
  //let endDate = moment(this.end_date).format('YYYY-MM-DD');
  let currentDate = moment(this.current_date).format('YYYY-MM-DD');

  this._license.get_license_resource(id)
    .pipe(takeUntil(this._unsubscribe))
    .subscribe(
      (data) => {
        if(data)
        {
          this.dateRange_chart_updating = false;
          let result = data.paging;

          /*filtered based on start and end date
          this.resource_logs = result.entities.filter(item => item.logDate.split("T")[0] >= startDate 
                                                      && item.logDate.split("T")[0] <= endDate)
                                                      .sort((a, b) => +new Date(a.logDate) - +new Date(b.logDate));
          */
          this.resource_logs = result.entities.filter(item => item.logDate.split("T")[0] === currentDate)
                               .sort((a, b) => +new Date(a.logDate) - +new Date(b.logDate));;
          this.resource_data = [];

          //CPU Usage
          this.cpuUsageCount = this.resource_logs.map(item=> ({'dateTime': item.logDate, 'count': item.cpuUsage}));
          let cpuResource = new API_RESOURCE_DATA();
          cpuResource.resourceName = "CPU Usage";
          cpuResource.resourceDataCount = this.cpuUsageCount;
          this.resource_data.push(cpuResource);

          //RAM Usage
          this.ramUsageCount= this.resource_logs.map(item=> ({'dateTime': item.logDate, 'count': item.ramUsage}));
          let ramResource = new API_RESOURCE_DATA();
          ramResource.resourceName = "RAM Usage";
          ramResource.resourceDataCount = this.ramUsageCount;
          this.resource_data.push(ramResource);

          setTimeout(() => {
          this.analytics_reload.next();
          }, 1000)
        }
      }, 
      error => {
        console.log('Error getting resource logs', error);
        this.dateRange_chart_updating = false;
      }
    );
  }

}