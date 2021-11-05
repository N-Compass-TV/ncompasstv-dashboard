import { Component, OnInit, Input } from '@angular/core';
import { UI_ROLE_DEFINITION } from 'src/app/global/models';
import { AuthService } from 'src/app/global/services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-total',
  templateUrl: './data-total.component.html',
  styleUrls: ['./data-total.component.scss']
})
export class DataTotalComponent implements OnInit {

    @Input() total: number;
    @Input() icon: string;
    @Input() links: string;
    @Input() new_this_week: string;
    @Input() new_this_week_label: string;

    routes: string;


    constructor(
        private _auth: AuthService,
        private _router: Router,
    ) { }

    ngOnInit() {
    }

    navigateToLink() {
        const route = Object.keys(UI_ROLE_DEFINITION).find(key => UI_ROLE_DEFINITION[key] === this._auth.current_user_value.role_id);
		this._router.navigate([]).then(result => {  window.open(`/${route}/`+this.links, '_blank'); });
    }

}
