export const API_ENDPOINTS = {
    auth: {
        api_login: 'account/login',
        api_refresh: 'token/refresh',
    },
    getters: {
        all_release_notes: 'ReleaseNote/getall',
        api_get_activities: 'activity/getall',
        api_get_activities_by_license_id: 'activity/getactivitybylicenseid?licenseid=',
        api_get_activities_by_owner_id: 'activity/getactivitybyownerid',
        api_get_activities_by_owner_id_dealeradmin: 'activity/getactivitybyowneriddealeradmin',
        api_get_activities_by_current_user: 'activity/MyActivities',
        api_get_advertisers: 'advertiser/getall',
        api_get_advertisers_activity: 'advertiseractivitylog/getall',
        api_get_advertisers_by_dealer_id: 'advertiser/getbydealerid',
        api_get_advertisers_by_id: 'advertiser/getbyid?id=',
        api_get_advertiser_report: 'advertiser/getaddedreport',
        api_get_advertiser_total: 'advertiser/gettotal',
        api_get_advertiser_total_by_dealer: 'advertiser/gettotal?dealerid=',
        api_get_advertisers_unassigned: 'advertiser/getunassignedbydealerid?dealer_id=',
        api_get_advertisers_unassigned_minified: 'advertiser/getunassignedbydealerid/minify?dealer_id=',
        api_get_assets: 'content/getall',
        api_get_billing_charges: 'billing/get/charges',
        api_get_billing_invoice_charges: 'billing/get/all/charges',
        api_get_billing_purchases: 'billing/get/all/purchases',
        api_get_blacklisted_by_id: 'blacklistedcontents/getblacklistedbyplaylistcontentid?playlistcontentid=',
        api_get_checklist: 'installationchecklists/getallitems',
        api_get_checklist_titles: 'installationchecklists/getall',
        api_get_checklist_by_license_id: 'installationchecklists/getlicensechecklist?licenseid=',
        cities_state: 'citiesStateData/getall',
        api_get_content: 'content/findall',
        api_get_content_summary: 'content/getalllimitedfields',
        api_get_content_metrics: 'contentplaysdaily/getcontentmetricsbydealer',
        api_get_categories: 'category/getall',
        api_get_category_general: 'category/getbycategory?category=',
        api_get_all_dealer_values: 'dealer/getdealervalues',
        api_get_dealer_total: 'dealer/gettotal',
        api_get_dma_hosts: 'dma/gethostlistsbyrank',
        api_get_dealer_contract_files: 'dealer/getcontractfiles?dealerid=',
        api_get_dealer_orders: 'billing/get/dealer/purchases',
        api_get_dealer_territory_files: 'dealer/getterritoryfiles?dealerid=',
        api_get_dealer_values: 'dealer/getdealervaluesbydealerid?dealerid=',
        api_get_filler_check_if_in_playlist: 'filler/playlist/getfillerplaylistinuse',
        api_get_filler_feeds: 'filler/playlist/getall',
        api_get_filler_feeds_minify: 'filler/playlist/getall/minify',
        api_get_filler_feed_dependency: 'filler/playlist/getplaylistsbyfillerplaylistid',
        api_get_filler_feed_placeholder: 'filler/playlist/placeholder',
        api_get_filler_feed_by_role: 'filler/playlist/getbyrole',
        api_get_filler_groups: 'filler/group/getall',
        api_get_filler_group_for_feeds: 'filler/group/getbyuser',
        api_get_dealer_filler_groups_admin_view: 'filler/group/dealer/getall',
        api_get_dealeradmin_filler_groups_view: 'filler/group/dealeradmin/getall',
        api_get_dealer_filler_groups: 'filler/group/dealer/getall',
        api_get_dealer_filler_groups_other_roles: 'filler/group/dealer/byrole',
        api_get_filler_group_by_id: 'filler/group/getbyid',
        api_get_global_settings: 'globalSettings/getall',
        api_get_host_fields: 'fieldgroup/getall',
        api_get_host_field_by_id: 'fieldgroupfield/getbyfieldgroupid?fieldgroupid=',
        api_get_parent_categories: 'category/getparentcategory',
        api_get_content_by_advertiser_id: 'content/getcontentsbyadvertiserid?advertiserid=',
        api_get_content_by_id: 'content/getcontentsbyid?contentid=',
        api_get_content_by_dealer_id: 'content/getbydealerid?dealerid=',
        api_get_content_daily_count: 'contentplays/getdailytotalbycontent',
        api_get_content_metrics_export: 'contentplaysdaily/exportscontentmetricsbycontent',
        api_get_content_monthly_count: 'contentplays/getmonthlytotalbycontent',
        api_get_content_yearly_count: 'contentplays/getyearlytotalbycontent',
        api_get_content_count_by_license: 'contentplays/gettotalbylicense',
        api_get_content_monthly_count_by_license: 'contentplaysdaily/getmonthlytotalbylicense',
        api_get_content_yearly_count_by_license: 'contentplays/getyeartotalbylicense',
        api_get_content_daily_count_by_license: 'contentplays/getdailytotalbylicense',
        api_get_content_by_license_zone: 'content/getcontentbylicenseid?licenseid=',
        api_get_content_hourly_by_license: 'contentplayshourly/getdailytotalbylicense',
        api_get_content_playing_where: 'content/getplayingwherebycontentsid',
        api_get_content_history: 'content/getcontenthistorybycontentid?contentid=',
        api_get_content_thumbnails: 'filler/content/thumbnails',
        api_get_content_total: 'content/gettotal',
        api_get_content_total_by_dealer: 'content/gettotal?dealerid=',
        api_get_dealer_by_id: 'dealer/getbyid?dealer_id=',
        api_get_dealers: 'dealer/getall',
        api_get_dealers_minified: 'dealer/getall/minify',
        api_get_dealer_admins: 'dealeradmin/getall',
        api_get_dealers_fetch: 'dealer/fetchallsorttotaldefault',
        // api_get_dealers_content_metrics: 'contentplaysdaily/exportscontentmetricsbydealer',
        api_get_dealers_content_metrics: 'contentplaysdaily/getcontentmetricsbydealerexport',
        api_get_dealers_directory: 'dealer/getdirectorytree',
        api_get_dealer_logo: 'dealer/getlogo',
        api_get_dealers_with_sort: 'dealer/fetchallsorttotal',
        api_get_dealers_with_host: 'dealer/getdealerswithhost',
        api_get_dealers_with_advertiser: 'dealer/getdealerswithadvertiser',
        api_get_dealers_with_license: 'dealer/getdealerswithlicense',
        api_get_dealer_report: 'dealer/getaddedreport',
        api_get_dealer_activity: 'dealeractivitylog/getall',
        api_get_dealer_admin_user: 'dealeradmin/dealer/assigneddealers',
        api_get_dealer_license_zone: 'dealer/getdealerlicensebyzone',
        api_get_dma: 'dma/gethosttotalbyrank',
        api_get_generated_feed_by_id: 'feed/getbyfeedid?feedid=',
        api_get_feeds: 'feed/getall',
        api_get_feeds_total: 'feed/gettotal',
        api_get_feeds_by_dealer: 'feed/getbydealerid',
        api_get_feed_by_id: 'feed/getfeedbycontentid?contentid=',
        api_get_feed_types: 'feedtype/getall',
        api_get_filler_gettotal: 'filler/group/gettotal',
        api_get_filler_feed_solo: 'filler/playlist/getbyid',
        api_get_filler_group_contents: 'filler/content/getbygroupid',
        api_get_filler_group_validation: 'filler/playlistgroup/getfillerplaylistsbyfillergroupid',
        api_get_fillers: 'feed/getallfillers',
        api_get_fillers_playing_where: 'filler/playlistgroup/getplayingwherebyfillergroupid',
        api_get_host_by_dealer: 'host/getbydealer?dealerid=',
        api_get_host_for_dealer: 'host/gethostbydealer?dealerid=',
        api_get_host_total: 'host/gettotal',
        api_get_host_total_per_dealer: 'host/gettotal?dealerid=',
        api_get_host_by_id: 'host/getbyid?hostid=',
        api_get_host_by_id_optimized: 'host/getbydealerwithtotal',
        api_get_host_licenses_by_state: 'host/getlicensesperstate',
        api_get_host_licenses_by_state_details: 'host/getdealershostslicensesperstate?state=',
        api_get_host_report: 'host/getaddedreport',
        api_get_hosts: 'host/getall',
        api_get_hosts_all_minified: 'host/getallminify',
        api_get_hosts_minified: 'host/minify',
        api_get_hosts_activity: 'hostactivitylog/getall',
        api_get_hosts_fetch: 'host/getalldefault',
        api_get_hosts_fetch_for_export: 'host/export',
        api_get_hosts_categories: 'host/gethostcategories',
        api_get_hosts_states: 'host/gethoststates',
        api_get_hosts_statistics: 'host/getmonthlytotal',
        api_get_licenses: 'license/getall',
        api_get_licenses_fetch: 'license/getalldefault',
        api_get_licenses_all_duration: 'license/getallwithduration',
        api_get_licenses_all_duration_clone: 'license/gethostlicenseswithduration',
        api_get_licenses_by_id: 'license/getlicensebyid?licenseid=',
        api_get_licenses_by_dealer: 'license/getbydealer',
        api_get_license_by_dealer_temp: 'license/getbydealerold?dealerid=',
        api_get_licenses_by_host: 'license/getbyhost',
        api_get_licenses_duration: 'license/exportbydealerduration',
        api_get_license_report: 'license/getaddedreport',
        api_get_licenses_total: 'license/gettotal',
        api_get_licenses_total_by_dealer: 'license/gettotal',
        api_get_licenses_by_screen: 'license/getlicensesbyscreenid',
        api_get_licenses_statistics: 'license/getmonthlytotal',
        api_get_licenses_installation_statistics: 'license/getmonthlyinstallation',
        api_get_licenses_installation_statistics_detailed: 'license/getmonthlyinstallationdetailed',
        api_get_logs_based_reports: 'contentPlaysDaily/exportLogsPerHostsByContent',
        api_get_ad_licenses_total: 'license/getaverageadlicensemainscreen',
        api_get_ad_licenses_total_by_dealer: 'license/getaverageadlicensemainscreen?dealerId=',
        api_get_notifications: 'notification/getbyreceiverid?receiver_id=',
        api_get_all_notifications: 'notification/getall',
        api_get_dealer_notifications: 'notification/getbydealerid?dealer_id=',
        api_get_placer: 'placer/dump',
        api_get_placer_for_host: 'placer/host/',
        api_get_playlist: 'playlists/getall',
        api_get_playlist_by_content: 'playlists/GetPlaylistsByContentId?contentid=',
        api_get_all_playlist: 'playlists/getplaylistswithscreens',
        api_get_playlist_by_dealer_id: 'playlists/getplaylistbydealerid?dealerid=',
        api_get_playlist_by_dealer_id_minify: 'playlists/getplaylistbydealerid/minify?dealerid=',
        api_get_playlist_by_dealer_id_table: 'playlists/getplaylistsbydealerid',
        api_get_playlist_by_id: 'playlists/getplaylistbyid?playlistid=',
        api_get_playlists_by_id: 'playlists/getplaylistsbyid?playlistid=',
        api_get_playlist_total: 'playlists/gettotal',
        api_get_playlist_total_by_dealer: 'playlists/gettotal?dealerid=',
        api_get_roles: 'role/getall',
        api_get_and_set_cookies: 'user/setcookie?userid=',
        api_get_resource_logs: 'resourcelogs/getresourcelogbylicenseid?licenseid=',
        api_get_resource_logs_by_date: 'resourcelogs/getresourcelogbylicenseidanddate?licenseid=',
        api_get_screen_by_id: 'screen/getscreenbyid?screenId=',
        api_get_screen_by_dealer: 'screen/getbydealerid?dealerId=',
        api_get_screen_by_dealer_table: 'screen/getscreenbydealerid',
        api_get_screens_of_playlist: 'screen/getscreenwithplaylistbyplaylistid?playlistid=',
        api_get_screens: 'screen/getall',
        api_get_screens_total: 'screen/gettotal',
        api_get_screens_total_by_dealer: 'screen/gettotal?dealerid=',
        api_get_screens_type: 'screentype/getall',
        api_get_screenshots: 'pi/getfiles?licenseid=',
        api_get_stats: 'dealer/getstatistics',
        api_get_support: 'support/getall',
        api_get_timezone: 'timezone/getall',
        api_get_timezoneByCoordinate: 'https://api.timezonedb.com/v2.1',
        api_get_template_by_dealer_id: 'template/gettemplatebydealerid?dealerid=',
        api_get_template_by_id: 'template/gettemplatebyid?templateId=',
        api_get_templates: 'template/getall',
        api_get_unassigned_host_to_placer: 'placer/host/unassigned',
        api_get_user_by_id: 'user/getbyid',
        api_get_users: 'user/getall',
        api_get_users_total: 'user/gettotal',
        api_get_users_role_by_id: 'user/getuserrole',
        api_get_unused_contents: 'content/getunusedcontents',
        api_generate_content_logs_report: 'contentplaysdaily/ExportPlayLogsPerHostsByContent',
        api_google_map: 'googleapi/searchplaces?place=',
        api_google_store_hours: 'googleapi/getstorehours?placeid=',
        api_renewsocket: 'license/renewsocket',
        api_search_dealer: 'dealer/searchdealer?search=',
        api_search_dealer_with_host: 'dealer/getdealerswithhost?search=',
        api_search_host: 'dealer/getdealerswithhost?search=',
        api_search_dealer_getall: 'dealer/getall?search=',
        api_apps: 'playerapp/getapp',
        api_apps_versions: 'playerapp/getappversions',
        api_apps_version: 'playerapp/getlatestversion?appid=',
        all_license_by_install_date: 'license/getlicensesbyinstalldate',
        contents_by_host: 'host/GetContents',
        content_by_host_id: 'content/getbyhostid',
        dealer_cards: 'billing/Get/CreditCards',
        distinct_tags_by_tag_type: 'tag/getdistinctagsbytypeid?typeid=', // yes that is intentionally misspelled
        distinct_tags_by_type_and_name: 'tag/GetDistincTagsByTypeIdAndTagName',
        dma_hosts_by_rank: 'dma/GetHostListsByRankLocatorPage',
        export_advertiser: 'advertiser/export?dealer_id=',
        export_all_advertiser: 'advertiser/ExportAll',
        export_advertiser_dealer: 'dealer/ExportDealerAdvertisers',
        export_advertiser_dealer_admin: 'dealer/ExportDealerAdminAdvertisers',
        export_dealer_licenses: 'license/exportbydealer',
        export_dealers: 'dealer/exportdealer',
        export_content_playlist: 'playlists/exportplaylistscontents?playlistId=',
        export_hosts: 'host/exportbydealer?dealerid=',
        host_files: 'host/GetHostFilesByType',
        host_place_images: 'googleapi/GetLogoByPlaceId',
        license_by_tags: 'license/getByTags',
        license_installation_statistics: 'license/getinstallationstats',
        license_statistics: 'license/getstatisticsbydealerid',
        license_statistics_by_install_date: 'license/getlicensestatisticsbyinstalldate?installdate=',
        next_month_installations: 'license/getNextMonthInstall',
        next_week_installations: 'license/getNextWeekInstall',
        outdated_licenses: 'license/GetOutDatedLicenses',
        recent_installations: 'license/getRecentInstall',
        release_note_by_id: 'ReleaseNote/getbyid',
        search_advertiser: 'advertiser/search?searchkey=',
        search_license: 'license/search?searchkey=',
        search_license_by_host: 'license/getbyhost',
        search_owner_tags: 'tag/searchOwnerTag',
        search_dealer_data: 'tag/searchDealersTagData',
        search_owners: 'tag/searchOwners',
        search_tags: 'tag/search',
        tag_check_name: 'tag/check',
        tag_types_by_type_id: 'tag/gettagsbytagtypeid?typeid=',
        tag_types_get_all: 'tag/GetAllTypes',
        tags_by_id: 'tag/gettagsbyid?tagid=',
        tags_by_owner_id: 'tag/gettagsbyownerid?ownerid',
        tags_by_role: 'tag/getbyrole',
        tags_by_tag_name_and_type: 'tag/gettagsbytagnameandtypeid',
        tags_count: 'tag/getalltagscount',
        tags_get_all: 'tag/getall',
        upcoming_installations: 'license/getUpComingInstall',
        users_by_owner: 'user/GetAllUsersByOwnerId?ownerid=',
        validate_weather_zip: 'feed/weather/validate?zipcode=',
        validate_rss_url: 'feed/news/validate?url=',
        validate_feed_url: 'feed/validate/url',
    },
    create: {
        add_credit_card: 'billing/add/creditcard',
        admin_tag: 'tag/admin/create',
        amazon_s3_upload: 'host/AmazonS3Upload',
        api_new_activity: 'activity/create',
        api_create_global_settings: 'globalsettings/create',
        api_create_filler_feed: 'filler/playlist/upsert',
        api_installation_checklist_title_add: 'installationchecklists/add',
        api_installation_checklist_items_add: 'installationchecklists/additems',
        api_new_admin: 'admin/create',
        api_new_advertiser: 'advertiser/create',
        api_new_advertiser_profile: 'advertiser/createadvertiser',
        api_new_dealer: 'dealer/create',
        api_new_dealer_admin: 'dealeradmin/upsert',
        api_new_dealer_admin_dealers: 'dealeradmin/assign/new/dealers',
        api_new_feed: 'feed/create',
        api_new_feed_generate: 'feed/generate',
        api_new_news_feed_demo: 'feed/preview/demo/news',
        api_new_slide_feed_demo: 'feed/preview/demo/slides',
        api_new_weather_feed_demo: 'feed/preview/demo/weather',
        api_new_filler_feed_demo: 'feed/preview/demo/fillers',
        api_new_filler_group: 'filler/group/upsert',
        api_new_host: 'host/create',
        api_new_host_place: 'host/createhost',
        api_new_license: 'license/create?',
        api_new_playlist: 'playlists/create',
        api_clone_playlist: 'playlists/clone',
        api_create_field_group: 'fieldgroup/create',
        api_new_screen: 'screen/create',
        api_new_techrep: 'tech/create',
        api_new_template: 'template/create',
        api_new_app_version: 'playerapp/addversion',
        api_new_app: 'playerapp/create',
        api_create_support: 'support/create',
        api_new_content_history_log: 'playlists/logcontenthistory',
        api_fieldgroup_value_create: 'fieldgroupdvalue/create',
        api_save_activity: 'activity/log',
        content_schedule: 'playlistcontentsschedule/create',
        dealer_tag: 'tag/dealer/create',
        host_s3_files: 'host/saveS3Files',
        feed_clone: 'feed/clone',
        dealer_credit_card_details: 'billing/Add/CreditCard',
        dealer_contract_files: 'dealer/savecontractfiles',
        dealer_territory_files: 'dealer/saveterritoryfiles',
        placer_upload: 'placer/process',
        sub_dealer_account: 'account/createsubaccount',
        tag: 'tag/create',
        tag_add_and_assign: 'tag/admin/create/generic',
        tag_owners: 'tag/addowners',
        tag_type: 'tag/createtype',
        new_host_activity_logs: 'hostActivityLog/create',
        new_dealer_activity_logs: 'dealeractivitylog/create',
        new_advertiser_activity_logs: 'advertiseractivitylog/create',
        filler_clone: 'filler/playlist/clone',
    },
    third_party: {
        api_post_content_info: 'webhooks/processhandler',
        api_process_convert: 'webhooks/processconvert',
        api_process_files: 'webhooks/processfiles',
        filestack_api_key: 'ALjKIdQzT1uQvACcqMCnQz',
        filestack_policy: 'eyJjYWxsIjpbIndyaXRlIiwicmVtb3ZlIl0sImV4cGlyeSI6MTYxMjAyMjQwMH0',
        filestack_signature: '49306a4d1945bffbb381dd90b38be3a69230b2f473543d3d73440c77eeab730d',
        filestack_screenshot:
            'https://cdn.filestackcontent.com/ALjKIdQzT1uQvACcqMCnQz/urlscreenshot=mode:window,height:1080,width:1920/resize=width:600/',
    },
    update: {
        account_permission: 'account/updatepermission',
        api_add_license_favorite: 'license/add/favorite',
        api_assign_license_to_screen: 'screen/assignlicenses',
        api_activate_license: 'license/activate',
        api_assign_license_to_host: 'license/assignhost',
        api_assign_template_to_dealer: 'template/assigntodealer',
        api_billing_order_update: 'billing/upsert/purchase/status',
        api_blocklist_content: 'blacklistedcontents/create',
        api_blacklist_cloned_content: 'blacklistedcontents/createforclone',
        api_checklist_check_update: 'installationchecklists/licensechecklistadd',
        api_checklist_title_update: 'installationchecklists/update',
        api_checklist_item_update: 'installationchecklists/updateitems',
        api_creditcard_update: 'billing/update/creditcard',
        api_deactivate_license: 'license/deactivate',
        api_display_status: 'license/updatedisplaystatus',
        api_update_advertiser: 'advertiser/updateadvertiser',
        api_update_alias: 'license/updatealias',
        api_update_card: 'billing/dealer/upsert/addressBook',
        api_update_dealer: 'dealer/update',
        api_update_dealer_logo: 'dealer/updatedealerlogo',
        api_update_dealer_values: 'dealer/updatedealervalues',
        api_update_feed: 'feed/update',
        api_update_filler_group_photo: 'filler/group/update/coverphoto',
        api_update_fillers_content: 'filler/content/upsert',
        api_update_generated_feed: 'feed/edit',
        api_update_host: 'host/updatehost',
        api_update_host_ticket: 'support/',
        api_update_license_boot_delay: 'license/bootdelay',
        api_update_internet_info: 'license/updateinternetinfo',
        api_update_news_slide_feed: 'feed/update/news',
        api_update_notification_status: 'notification/updateNotificationIsOpened?notificationId=',
        api_update_all_notification_status: 'notification/updateAllNotificationIsOpened',
        api_update_notification_status_by_dealer: 'notification/updateNotificationIsOpenedByDealerId?dealerId=',
        api_update_playlist_content: 'playlists/addcontent',
        api_update_playlist_info: 'playlists/updateplaylistinfo',
        api_update_screen: 'screen/edit',
        api_update_screenshot_settings: 'license/screenshotsettings',
        api_update_speedtest_settings: 'license/speedtestsettings',
        api_update_resource_settings: 'license/resourcesettings',
        api_update_tvdisplay_settings: 'license/tvdisplaysettings',
        api_update_display_control_settings: 'license/displaycontrolsettings',
        api_update_fastedge_tool_settings: 'license/update/fastedge/monitoringtool',
        api_update_filler_feed: 'feed/update/fillers',
        api_update_slide_feed: 'feed/update/slides',
        api_update_content: 'content/unassigndealer',
        api_update_player_background: 'license/UpdateBackgroundImage',
        api_update_unused_content: 'content/updateunusedcontents',
        api_update_user: 'user/update',
        api_update_weather_feed: 'feed/update/weather',
        content_protection: 'content/setProtection',
        content_schedule: 'playlistcontentsschedule/update',
        content_to_filler: 'content/setfiller',
        dealer_credit_card_details: 'billing/update/CreditCard',
        dealer_status: 'dealer/updatestatus',
        host_file_alias: 'host/update/file/alias',
        install_date: 'license/updateinstalldate',
        install_request_date: 'license/updateinstallrequestdate',
        install_date_list: 'license/updateinstalldatelist',
        license_cec_status: 'notification/update/cec',
        license_notification_settings: 'license/update/notification/settings',
        license_reboot_time: 'license/update/reboot/time',
        placer_host: 'placer/update/host',
        play_credits: 'playlists/addcredits',
        reassign_content: 'content/reassigncontent',
        reassign_dealer: 'dealer/reassigndealer',
        revert_frequency: 'playlists/revertFrequency',
        screen_template: 'screen/change/template',
        set_content_frequency: 'playlists/setFrequency',
        set_order_as_viewed: 'ordersviewed/upsert',
        set_user_cookie: 'user/setcookie',
        swap_playlist_content: 'playlists/swapcontent',
        tag: 'tag/update',
        tag_type: 'tag/updatetype',
        template: 'template/update',
        toggle_credits: 'playlists/enableCredits',
        tv_brand: 'license/Update/TvBrand',
        user_email_settings: 'user/updateemailsettings',

        //DEALER ADMIN
        dealeradmin_update_user: 'dealeradmin/user/update',
    },
    delete: {
        api_delete_contract_details: 'dealer/deletecontractfiles?filename=',
        api_delete_credit_card: 'billing/delete/creditcard',
        api_delete_dealer_admin: 'dealeradmin/delete/assigned/dealers',
        api_delete_filler_content: 'filler/content/delete',
        api_delete_filler_feed: 'filler/playlist/delete',
        api_delete_filler_group: 'filler/group/delete',
        api_delete_placer_dump: 'placer/delete/dump',
        api_delete_territory_details: 'dealer/deleteterritoryfiles?filename=',
        api_delete_screenshot: 'pi/deletescreenshots',
        api_remove_advertiser: 'advertiser/removeadvertiser?advertiserid=',
        api_remove_checklist_title: 'installationchecklists/remove?installationchecklistid=',
        api_remove_checklist_items: 'installationchecklists/removeitems',
        api_remove_content: 'content/removebycontentid',
        api_remove_player_app: 'playerapp/removeplayerapp',
        api_remove_player_app_version: 'playerapp/RemovePlayerAppVersion',
        api_remove_playlist: 'playlists/removeplaylist?playlistid=',
        api_remove_playlist_content: 'playlists/removecontent',
        api_remove_playlist_contents: 'playlists/removecontents',
        api_remove_screenshots: 'pi/removefiles',
        api_remove_in_blacklist: 'blacklistedcontents/delete',
        api_bulk_remove_in_blacklist: 'blacklistedcontents/bulkdelete',
        api_remove_license: 'license/removebylicenseid',
        api_remove_favorite: 'license/remove/favorite',
        api_remove_screen: 'screen/removebyscreenid',
        api_remove_screen_license: 'screen/unassignlicense',
        api_remove_host_licenses: 'license/unassignhost',
        api_remove_host_ticket: 'support/',
        delete_dealer: 'dealer/delete',
        host: 'host/delete',
        host_file_amazon_s3: 'host/AmazonS3Delete',
        release_note: 'ReleaseNote/delete',
        tag: 'tag/delete',
        tag_by_id_and_owner: 'tag/DeleteByOwnerIdAndTagId',
        tag_by_owner_id: 'tag/DeleteByOwnerId?ownerid=',
        user: 'user/delete',
    },
    upsert: {
        release_notes: 'ReleaseNote/upsert',
    },
};
