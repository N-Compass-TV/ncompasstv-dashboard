import { Routes } from '@angular/router';
import { AuthGuard } from '../../global/guards/auth/auth.guard';
import { UI_ROLE_DEFINITION } from '../../global/models/ui_role-definition.model';
import { AdvertiserLayoutComponent } from './advertiser-layout/advertiser-layout.component'
import { DashboardComponent } from '../advertiser/pages/dashboard/dashboard.component';
import { UserProfileComponent } from '../../global/pages_shared/user-profile/user-profile.component';
import { UserAccountSettingComponent } from '../../global/pages_shared/user-account-setting/user-account-setting.component';

export const ADVERTISER_ROUTES: Routes = [
    {
        path: 'advertiser',
        component: AdvertiserLayoutComponent,
        canActivate: [AuthGuard],
        data: { role: [UI_ROLE_DEFINITION.advertiser] },
        children: [
            { path: '', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'user-profile/:data', component: UserProfileComponent },
            { path: 'user-account-setting/:data', component: UserAccountSettingComponent }
        ]
    }
];