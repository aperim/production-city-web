// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.
// @generated

export type FeatureId =
  | 'home.overview.executive'
  | 'home.overview.staff'
  | 'home.overview.client'
  | 'home.overview.investor'
  | 'home.overview.guest'
  | 'home.overview.vendor'
  | 'home.overview.government'
  | 'home.overview.partner'
  | 'home.quick_actions'
  | 'home.activity_feed'
  | 'company_ops.hr.directory'
  | 'company_ops.hr.org_chart'
  | 'company_ops.hr.recruitment'
  | 'company_ops.hr.onboarding'
  | 'company_ops.hr.performance'
  | 'company_ops.hr.leave'
  | 'company_ops.hr.payroll'
  | 'company_ops.hr.positions'
  | 'company_ops.hr.succession'
  | 'company_ops.legal.contracts'
  | 'company_ops.legal.ip'
  | 'company_ops.legal.compliance_calendar'
  | 'company_ops.legal.litigation'
  | 'company_ops.legal.counsel'
  | 'company_ops.legal.privacy'
  | 'company_ops.finance.accounts'
  | 'company_ops.finance.cashflow'
  | 'company_ops.finance.reporting'
  | 'company_ops.finance.tax'
  | 'company_ops.capital.cap_table'
  | 'company_ops.capital.fundraising'
  | 'company_ops.capital.shareholder_registry'
  | 'company_ops.capital.sovereign_funds'
  | 'company_ops.capital.investment_docs'
  | 'company_ops.capital.scenario_modelling'
  | 'company_ops.board.meetings'
  | 'company_ops.board.minutes'
  | 'company_ops.board.directors'
  | 'company_ops.board.governance'
  | 'company_ops.board.company_secretary'
  | 'company_ops.insurance.portfolio'
  | 'company_ops.insurance.risk_register'
  | 'company_ops.insurance.bcp'
  | 'company_ops.insurance.claims'
  | 'company_ops.knowledge.wiki'
  | 'company_ops.knowledge.documents'
  | 'company_ops.knowledge.project_mgmt'
  | 'gov_policy.local.councils'
  | 'gov_policy.local.meetings'
  | 'gov_policy.local.correspondence'
  | 'gov_policy.local.da_engagement'
  | 'gov_policy.local.incentives'
  | 'gov_policy.state.ministers'
  | 'gov_policy.state.meetings'
  | 'gov_policy.state.screen_qld'
  | 'gov_policy.state.tiq'
  | 'gov_policy.state.incentives'
  | 'gov_policy.state.crown_lease'
  | 'gov_policy.state.policy'
  | 'gov_policy.federal.ministers'
  | 'gov_policy.federal.incentives'
  | 'gov_policy.federal.arts_office'
  | 'gov_policy.federal.grants'
  | 'gov_policy.international.singapore'
  | 'gov_policy.international.hawaii'
  | 'gov_policy.international.europe'
  | 'gov_policy.international.usa'
  | 'gov_policy.outreach.campaigns'
  | 'gov_policy.outreach.stakeholder_map'
  | 'gov_policy.outreach.briefings'
  | 'first_nations.traditional_owners.groups'
  | 'first_nations.traditional_owners.engagement'
  | 'first_nations.traditional_owners.agreements'
  | 'first_nations.cultural_heritage.surveys'
  | 'first_nations.cultural_heritage.sites'
  | 'first_nations.cultural_heritage.duty_of_care'
  | 'first_nations.cultural_heritage.native_title'
  | 'first_nations.ways.campus_design'
  | 'first_nations.ways.seasonal_calendar'
  | 'first_nations.ways.language'
  | 'first_nations.ways.cultural_spaces'
  | 'first_nations.programs.employment'
  | 'first_nations.programs.suppliers'
  | 'first_nations.programs.artists'
  | 'first_nations.programs.cultural_safety'
  | 'first_nations.rap.plan'
  | 'first_nations.rap.reporting'
  | 'first_nations.advisory.board'
  | 'first_nations.protocols.welcome'
  | 'first_nations.protocols.acknowledgement'
  | 'first_nations.protocols.cultural_ip'
  | 'first_nations.outreach.community'
  | 'first_nations.outreach.screen_industry'
  | 'first_nations.outreach.events'
  | 'community.stakeholder_engagement.advisory_boards'
  | 'community.stakeholder_engagement.public_consultation'
  | 'community.stakeholder_engagement.feedback_management'
  | 'community.stakeholder_engagement.stakeholder_directory'
  | 'community.social_impact.economic_reporting'
  | 'community.social_impact.employment_metrics'
  | 'community.social_impact.local_business'
  | 'community.cultural_programs.community_events'
  | 'community.cultural_programs.open_days'
  | 'community.cultural_programs.public_art'
  | 'community.cultural_programs.cultural_partnerships'
  | 'community.media_relations.press_releases'
  | 'community.media_relations.media_monitoring'
  | 'community.media_relations.spokesperson'
  | 'community.media_relations.crisis_comms'
  | 'partnerships.technology_partners.directory'
  | 'partnerships.technology_partners.integrations'
  | 'partnerships.technology_partners.joint_rd'
  | 'partnerships.technology_partners.ip_sharing'
  | 'partnerships.education_partners.university_programs'
  | 'partnerships.education_partners.internships'
  | 'partnerships.education_partners.curriculum'
  | 'partnerships.education_partners.research'
  | 'partnerships.industry_alliances.co_production'
  | 'partnerships.industry_alliances.facility_sharing'
  | 'partnerships.industry_alliances.cross_campus'
  | 'partnerships.sovereign_funds.government_programs'
  | 'partnerships.sovereign_funds.fund_engagement'
  | 'partnerships.sovereign_funds.economic_tracking'
  | 'data_rooms.investor.financial_documents'
  | 'data_rooms.investor.due_diligence'
  | 'data_rooms.investor.materials'
  | 'data_rooms.investor.access_control'
  | 'data_rooms.government.grant_applications'
  | 'data_rooms.government.compliance'
  | 'data_rooms.government.economic_reports'
  | 'data_rooms.project.per_production'
  | 'data_rooms.project.nda_tracking'
  | 'data_rooms.project.watermarked_access'
  | 'data_rooms.partnership.joint_venture'
  | 'data_rooms.partnership.term_sheets'
  | 'data_rooms.partnership.collaboration_agreements'
  | 'campus_dev.site_search.identification'
  | 'campus_dev.site_search.due_diligence'
  | 'campus_dev.site_search.feasibility'
  | 'campus_dev.site_search.acquisition'
  | 'campus_dev.planning.da_applications'
  | 'campus_dev.planning.zoning'
  | 'campus_dev.planning.heritage'
  | 'campus_dev.planning.environmental'
  | 'campus_dev.planning.community_consultation'
  | 'campus_dev.design.master_plan'
  | 'campus_dev.design.architecture'
  | 'campus_dev.design.engineering'
  | 'campus_dev.design.interior'
  | 'campus_dev.design.sustainability'
  | 'campus_dev.construction.project_management'
  | 'campus_dev.construction.contractor_management'
  | 'campus_dev.construction.progress'
  | 'campus_dev.construction.quality'
  | 'campus_dev.construction.safety'
  | 'campus_dev.commissioning.fitout'
  | 'campus_dev.commissioning.systems_testing'
  | 'campus_dev.commissioning.certification'
  | 'campus_dev.commissioning.punch_lists'
  | 'campus_dev.campus_portfolio.overview'
  | 'campus_dev.campus_portfolio.comparison'
  | 'campus_dev.campus_portfolio.expansion_pipeline'
  | 'campus_dev.campus_portfolio.global_standards'
  | 'productions.active.board'
  | 'productions.active.timeline'
  | 'productions.active.call_sheets'
  | 'productions.active.daily_reports'
  | 'productions.pre_production.script_breakdown'
  | 'productions.pre_production.storyboarding'
  | 'productions.pre_production.casting'
  | 'productions.pre_production.location_scouting'
  | 'productions.pre_production.budget_estimation'
  | 'productions.production.shooting_schedules'
  | 'productions.production.crew_assignments'
  | 'productions.production.daily_logs'
  | 'productions.production.rushes_review'
  | 'productions.post_production.editing'
  | 'productions.post_production.color_grading'
  | 'productions.post_production.vfx'
  | 'productions.post_production.sound_mix'
  | 'productions.post_production.deliverables'
  | 'productions.finance.budgets'
  | 'productions.finance.cost_reports'
  | 'productions.finance.purchase_orders'
  | 'productions.finance.petty_cash'
  | 'productions.finance.completion_guarantor'
  | 'facilities.sound_stages.calendar'
  | 'facilities.sound_stages.booking'
  | 'facilities.sound_stages.pricing'
  | 'facilities.sound_stages.configuration'
  | 'facilities.broadcast.theatre_booking'
  | 'facilities.broadcast.control_room_scheduling'
  | 'facilities.broadcast.presets'
  | 'facilities.workshops.set_construction'
  | 'facilities.workshops.props'
  | 'facilities.workshops.costume'
  | 'facilities.workshops.paint_shop'
  | 'facilities.recording_studios.booking'
  | 'facilities.recording_studios.session_management'
  | 'facilities.recording_studios.equipment'
  | 'facilities.support_spaces.dressing_rooms'
  | 'facilities.support_spaces.green_rooms'
  | 'facilities.support_spaces.catering'
  | 'facilities.support_spaces.parking'
  | 'facilities.support_spaces.storage'
  | 'facilities.maintenance.preventive'
  | 'facilities.maintenance.work_orders'
  | 'facilities.maintenance.asset_lifecycle'
  | 'facilities.maintenance.vendor_scheduling'
  | 'facilities.rooms.room_booking'
  | 'broadcast.live_production.rundown'
  | 'broadcast.live_production.cue_sheets'
  | 'broadcast.live_production.switching'
  | 'broadcast.live_production.graphics'
  | 'broadcast.control_room.booking'
  | 'broadcast.control_room.technical_setup'
  | 'broadcast.control_room.signal_routing'
  | 'broadcast.control_room.redundancy'
  | 'broadcast.transmission.uplink'
  | 'broadcast.transmission.cdn'
  | 'broadcast.transmission.multi_platform'
  | 'broadcast.transmission.latency_monitoring'
  | 'broadcast.planning.schedule'
  | 'broadcast.planning.rehearsals'
  | 'broadcast.planning.technical_requirements'
  | 'broadcast.planning.risk_assessment'
  | 'virtual_production.led_volume.configuration'
  | 'virtual_production.led_volume.content_management'
  | 'virtual_production.led_volume.calibration'
  | 'virtual_production.led_volume.show_files'
  | 'virtual_production.previs.previsualization'
  | 'virtual_production.previs.techvis'
  | 'virtual_production.previs.postvis'
  | 'virtual_production.previs.virtual_camera'
  | 'virtual_production.motion_capture.scheduling'
  | 'virtual_production.motion_capture.performers'
  | 'virtual_production.motion_capture.data_processing'
  | 'virtual_production.motion_capture.cleanup'
  | 'virtual_production.realtime_rendering.unreal_projects'
  | 'virtual_production.realtime_rendering.asset_library'
  | 'virtual_production.realtime_rendering.scene_management'
  | 'virtual_production.realtime_rendering.performance'
  | 'virtual_production.digital_assets.library'
  | 'virtual_production.digital_assets.scan_processing'
  | 'virtual_production.digital_assets.digital_twins'
  | 'virtual_production.digital_assets.versioning'
  | 'audio_music.recording.session_booking'
  | 'audio_music.recording.engineer_assignment'
  | 'audio_music.recording.track_management'
  | 'audio_music.recording.mix_versions'
  | 'audio_music.sound_design.sfx_library'
  | 'audio_music.sound_design.foley_scheduling'
  | 'audio_music.sound_design.adr_booking'
  | 'audio_music.sound_design.atmos_mixing'
  | 'audio_music.music_production.score_composition'
  | 'audio_music.music_production.music_licensing'
  | 'audio_music.music_production.library_management'
  | 'audio_music.mastering.mastering_sessions'
  | 'audio_music.mastering.deliverable_formats'
  | 'audio_music.mastering.quality_control'
  | 'workflow.pipeline.asset_pipeline'
  | 'workflow.pipeline.workflow_templates'
  | 'workflow.pipeline.stage_gates'
  | 'workflow.pipeline.handoff_tracking'
  | 'workflow.review_approval.dailies_review'
  | 'workflow.review_approval.client_review'
  | 'workflow.review_approval.approval_chains'
  | 'workflow.review_approval.annotation_tools'
  | 'workflow.deliverables.deliverable_specs'
  | 'workflow.deliverables.format_management'
  | 'workflow.deliverables.qc_checklists'
  | 'workflow.deliverables.distribution'
  | 'workflow.automation.automation_rules'
  | 'workflow.automation.triggers'
  | 'workflow.automation.notifications'
  | 'workflow.automation.escalation_policies'
  | 'talent_crew.crew_database.crew_profiles'
  | 'talent_crew.crew_database.skills_certifications'
  | 'talent_crew.crew_database.availability'
  | 'talent_crew.crew_database.rate_cards'
  | 'talent_crew.casting.casting_calls'
  | 'talent_crew.casting.audition_scheduling'
  | 'talent_crew.casting.talent_management'
  | 'talent_crew.casting.talent_agreements'
  | 'talent_crew.crew_scheduling.call_sheets'
  | 'talent_crew.crew_scheduling.department_scheduling'
  | 'talent_crew.crew_scheduling.overtime_tracking'
  | 'talent_crew.crew_scheduling.meal_breaks'
  | 'talent_crew.safety_compliance.safety_inductions'
  | 'talent_crew.safety_compliance.incident_reporting'
  | 'talent_crew.safety_compliance.first_aid'
  | 'talent_crew.safety_compliance.ppe_tracking'
  | 'talent_crew.safety_compliance.health_protocols'
  | 'education.programs.course_catalog'
  | 'education.programs.program_management'
  | 'education.programs.curriculum_design'
  | 'education.programs.accreditation'
  | 'education.students.enrollment'
  | 'education.students.progress_tracking'
  | 'education.students.assessment'
  | 'education.students.certification'
  | 'education.internships.internship_programs'
  | 'education.internships.placement_management'
  | 'education.internships.mentor_assignment'
  | 'education.internships.evaluations'
  | 'education.workshops.workshop_scheduling'
  | 'education.workshops.trainer_management'
  | 'education.workshops.materials'
  | 'education.workshops.participant_tracking'
  | 'education.research.rd_projects'
  | 'education.research.research_partnerships'
  | 'education.research.grants'
  | 'education.research.publications'
  | 'events_tickets.events.event_calendar'
  | 'events_tickets.events.event_creation'
  | 'events_tickets.events.logistics'
  | 'events_tickets.events.venue_management'
  | 'events_tickets.ticketing.ticket_sales'
  | 'events_tickets.ticketing.seating_maps'
  | 'events_tickets.ticketing.pricing_tiers'
  | 'events_tickets.ticketing.promo_codes'
  | 'events_tickets.ticketing.refunds'
  | 'events_tickets.tours.tour_bookings'
  | 'events_tickets.tours.guide_scheduling'
  | 'events_tickets.tours.group_management'
  | 'events_tickets.tours.accessibility'
  | 'events_tickets.experiences.vr_ar'
  | 'events_tickets.experiences.interactive_exhibits'
  | 'events_tickets.experiences.special_events'
  | 'events_tickets.experiences.package_deals'
  | 'finance.revenue.revenue_tracking'
  | 'finance.revenue.invoicing'
  | 'finance.revenue.collections'
  | 'finance.revenue.revenue_recognition'
  | 'finance.budgeting.annual_budgets'
  | 'finance.budgeting.departmental_budgets'
  | 'finance.budgeting.variance_analysis'
  | 'finance.budgeting.forecasting'
  | 'finance.procurement.purchase_requisitions'
  | 'finance.procurement.purchase_orders'
  | 'finance.procurement.approval_workflows'
  | 'finance.procurement.spend_analytics'
  | 'finance.expense_management.expense_claims'
  | 'finance.expense_management.corporate_cards'
  | 'finance.expense_management.travel_booking'
  | 'finance.expense_management.policy_enforcement'
  | 'finance.billing.client_billing'
  | 'finance.billing.rate_management'
  | 'finance.billing.retainer_tracking'
  | 'finance.billing.payment_gateway'
  | 'inventory.equipment.equipment_register'
  | 'inventory.equipment.check_in_out'
  | 'inventory.equipment.maintenance_logs'
  | 'inventory.equipment.depreciation'
  | 'inventory.consumables.consumables_tracking'
  | 'inventory.consumables.reorder_alerts'
  | 'inventory.consumables.vendor_management'
  | 'inventory.consumables.cost_allocation'
  | 'inventory.props_wardrobe.props_inventory'
  | 'inventory.props_wardrobe.wardrobe_tracking'
  | 'inventory.props_wardrobe.condition_reports'
  | 'inventory.props_wardrobe.storage_locations'
  | 'inventory.digital_assets_register.dam'
  | 'inventory.digital_assets_register.file_storage'
  | 'inventory.digital_assets_register.version_control'
  | 'inventory.digital_assets_register.rights_management'
  | 'inventory.fleet.vehicle_management'
  | 'inventory.fleet.bookings'
  | 'inventory.fleet.fuel_tracking'
  | 'inventory.fleet.maintenance'
  | 'vendors.vendor_directory.supplier_profiles'
  | 'vendors.vendor_directory.classifications'
  | 'vendors.vendor_directory.certifications'
  | 'vendors.vendor_directory.insurance_tracking'
  | 'vendors.procurement_portal.rfq_management'
  | 'vendors.procurement_portal.bid_evaluation'
  | 'vendors.procurement_portal.award_tracking'
  | 'vendors.contracts.vendor_contracts'
  | 'vendors.contracts.sla_management'
  | 'vendors.contracts.performance_reviews'
  | 'vendors.contracts.renewal_management'
  | 'vendors.payments.invoice_processing'
  | 'vendors.payments.payment_scheduling'
  | 'vendors.payments.reconciliation'
  | 'vendors.payments.dispute_management'
  | 'vendors.compliance.compliance_checks'
  | 'vendors.compliance.insurance_verification'
  | 'vendors.compliance.worksafe_requirements'
  | 'vendors.compliance.modern_slavery'
  | 'campus_ops.building_management.bms_integration'
  | 'campus_ops.building_management.hvac_control'
  | 'campus_ops.building_management.lighting'
  | 'campus_ops.building_management.energy_monitoring'
  | 'campus_ops.security.cctv'
  | 'campus_ops.security.access_logs'
  | 'campus_ops.security.visitor_management'
  | 'campus_ops.security.incident_response'
  | 'campus_ops.catering.restaurant_management'
  | 'campus_ops.catering.catering_orders'
  | 'campus_ops.catering.menu_planning'
  | 'campus_ops.cleaning.schedules'
  | 'campus_ops.cleaning.service_quality'
  | 'campus_ops.cleaning.contractor_management'
  | 'campus_ops.transport.shuttle_service'
  | 'campus_ops.transport.parking'
  | 'campus_ops.transport.loading_dock'
  | 'campus_ops.waste.waste_management'
  | 'campus_ops.waste.recycling_tracking'
  | 'campus_ops.waste.sustainability_metrics'
  | 'campus_ops.waste.compliance_reporting'
  | 'global_network.campuses.campus_registry'
  | 'global_network.campuses.status_dashboard'
  | 'global_network.campuses.comparison_metrics'
  | 'global_network.campuses.expansion_roadmap'
  | 'global_network.campuses.site_selection'
  | 'global_network.interconnect.cross_campus_booking'
  | 'global_network.interconnect.resource_sharing'
  | 'global_network.interconnect.production_transfer'
  | 'global_network.interconnect.unified_calendar'
  | 'global_network.standards.brand_standards'
  | 'global_network.standards.service_level_frameworks'
  | 'global_network.standards.quality_benchmarks'
  | 'global_network.cross_border.multi_jurisdiction'
  | 'global_network.cross_border.currency_management'
  | 'global_network.cross_border.timezone_coordination'
  | 'global_network.cross_border.cross_border_taxation'
  | 'communications.internal.staff_announcements'
  | 'communications.internal.newsletter'
  | 'communications.internal.intranet'
  | 'communications.internal.policy_distribution'
  | 'communications.external.website_cms'
  | 'communications.external.social_media'
  | 'communications.external.press_releases'
  | 'communications.external.media_kit'
  | 'communications.brand.brand_guidelines'
  | 'communications.brand.asset_library'
  | 'communications.brand.template_management'
  | 'communications.notifications.notification_center'
  | 'communications.notifications.alert_management'
  | 'communications.notifications.escalation_rules'
  | 'communications.notifications.communication_preferences'
  | 'analytics.dashboards.custom_builder'
  | 'analytics.dashboards.kpi_configuration'
  | 'analytics.dashboards.data_visualization'
  | 'analytics.dashboards.saved_views'
  | 'analytics.reports.report_templates'
  | 'analytics.reports.scheduled_reports'
  | 'analytics.reports.ad_hoc_queries'
  | 'analytics.reports.export_management'
  | 'analytics.business_intelligence.trend_analysis'
  | 'analytics.business_intelligence.predictive_analytics'
  | 'analytics.business_intelligence.benchmark_comparison'
  | 'analytics.business_intelligence.what_if_modeling'
  | 'analytics.operational_metrics.facility_utilization'
  | 'analytics.operational_metrics.production_throughput'
  | 'analytics.operational_metrics.revenue_per_sqm'
  | 'analytics.sustainability_metrics.energy_consumption'
  | 'analytics.sustainability_metrics.carbon_footprint'
  | 'analytics.sustainability_metrics.waste_diversion'
  | 'analytics.sustainability_metrics.water_usage'
  | 'analytics.sustainability_metrics.green_certification'
  | 'investor_relations.portfolio.investment_overview'
  | 'investor_relations.portfolio.return_tracking'
  | 'investor_relations.portfolio.valuation_updates'
  | 'investor_relations.portfolio.distribution_history'
  | 'investor_relations.reporting.quarterly_reports'
  | 'investor_relations.reporting.annual_reports'
  | 'investor_relations.reporting.investor_updates'
  | 'investor_relations.reporting.agm_materials'
  | 'investor_relations.cap_table.cap_table_management'
  | 'investor_relations.cap_table.share_registry'
  | 'investor_relations.cap_table.option_pool'
  | 'investor_relations.cap_table.convertible_notes'
  | 'investor_relations.fundraising.fundraising_rounds'
  | 'investor_relations.fundraising.investor_pipeline'
  | 'investor_relations.fundraising.term_sheets'
  | 'investor_relations.fundraising.due_diligence'
  | 'investor_relations.fundraising.investor_portal'
  | 'investor_relations.distributions.distribution_calculations'
  | 'investor_relations.distributions.payment_processing'
  | 'investor_relations.distributions.tax_statements'
  | 'administration.users.user_management'
  | 'administration.users.role_assignment'
  | 'administration.users.permission_management'
  | 'administration.users.sso_configuration'
  | 'administration.audit.audit_logs'
  | 'administration.audit.access_reports'
  | 'administration.audit.compliance_monitoring'
  | 'administration.audit.data_retention'
  | 'administration.integrations.api_management'
  | 'administration.integrations.webhook_configuration'
  | 'administration.integrations.third_party'
  | 'administration.integrations.data_sync'
  | 'administration.settings.system_configuration'
  | 'administration.settings.feature_flags'
  | 'administration.settings.locale_management'
  | 'administration.settings.notification_templates'
  | 'administration.settings.branding'
  | 'administration.security.security_policies'
  | 'administration.security.mfa_management'
  | 'administration.security.session_management'
  | 'administration.security.ip_allowlisting'
  ;

export interface DashboardRoute {
  id: FeatureId;
  path: string;
  roles: string[];
  permissions: string[];
  status: string;
  phase: string;
  priority: string;
  dependencies: FeatureId[];
}

export const REGISTRY_HASH = '8fe110fe4e1935661571a634f29c84e991173267ae9fccf0056280620cba40ce';

export const DASHBOARD_ROUTES: DashboardRoute[] = [
  { id: 'home.overview.executive', path: '/dashboard/home/executive', roles: ['admin', 'executive'], permissions: ['dashboard:executive'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'home.overview.staff', path: '/dashboard/home/staff', roles: ['staff'], permissions: ['dashboard:staff'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'home.overview.client', path: '/dashboard/home/client', roles: ['client'], permissions: ['dashboard:client'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'home.overview.investor', path: '/dashboard/home/investor', roles: ['investor'], permissions: ['dashboard:investor'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'home.overview.guest', path: '/dashboard/home/guest', roles: ['guest'], permissions: ['dashboard:guest'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: [] },
  { id: 'home.overview.vendor', path: '/dashboard/home/vendor', roles: ['vendor'], permissions: ['dashboard:vendor'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: [] },
  { id: 'home.overview.government', path: '/dashboard/home/government', roles: ['government'], permissions: ['dashboard:government'], status: 'planned', phase: 'site_acquisition', priority: 'p3', dependencies: [] },
  { id: 'home.overview.partner', path: '/dashboard/home/partner', roles: ['partner'], permissions: ['dashboard:partner'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: [] },
  { id: 'home.quick_actions', path: '/dashboard/home/quick-actions', roles: ['admin', 'executive', 'staff', 'client'], permissions: ['dashboard:read'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'home.activity_feed', path: '/dashboard/home/activity-feed', roles: ['admin', 'executive', 'staff'], permissions: ['dashboard:read'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'company_ops.hr.directory', path: '/dashboard/company/hr/directory', roles: ['admin', 'executive', 'staff'], permissions: ['hr:read'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.hr.org_chart', path: '/dashboard/company/hr/org-chart', roles: ['admin', 'executive', 'staff'], permissions: ['hr:read'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: ['company_ops.hr.directory'] },
  { id: 'company_ops.hr.recruitment', path: '/dashboard/company/hr/recruitment', roles: ['admin', 'executive'], permissions: ['hr:recruitment'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.hr.onboarding', path: '/dashboard/company/hr/onboarding', roles: ['admin', 'executive'], permissions: ['hr:recruitment'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['company_ops.hr.recruitment'] },
  { id: 'company_ops.hr.performance', path: '/dashboard/company/hr/performance', roles: ['admin', 'executive', 'staff'], permissions: ['hr:performance'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: ['company_ops.hr.directory'] },
  { id: 'company_ops.hr.leave', path: '/dashboard/company/hr/leave', roles: ['admin', 'executive', 'staff'], permissions: ['hr:leave'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['company_ops.hr.directory'] },
  { id: 'company_ops.hr.payroll', path: '/dashboard/company/hr/payroll', roles: ['admin', 'executive'], permissions: ['hr:payroll'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: ['company_ops.hr.directory'] },
  { id: 'company_ops.hr.positions', path: '/dashboard/company/hr/positions', roles: ['admin', 'executive'], permissions: ['hr:admin'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: [] },
  { id: 'company_ops.hr.succession', path: '/dashboard/company/hr/succession', roles: ['admin', 'executive'], permissions: ['hr:admin'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['company_ops.hr.directory'] },
  { id: 'company_ops.legal.contracts', path: '/dashboard/company/legal/contracts', roles: ['admin', 'executive'], permissions: ['legal:read'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.legal.ip', path: '/dashboard/company/legal/ip', roles: ['admin', 'executive'], permissions: ['legal:ip'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.legal.compliance_calendar', path: '/dashboard/company/legal/compliance', roles: ['admin', 'executive'], permissions: ['legal:compliance'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.legal.litigation', path: '/dashboard/company/legal/litigation', roles: ['admin', 'executive'], permissions: ['legal:litigation'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: [] },
  { id: 'company_ops.legal.counsel', path: '/dashboard/company/legal/counsel', roles: ['admin', 'executive'], permissions: ['legal:admin'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: [] },
  { id: 'company_ops.legal.privacy', path: '/dashboard/company/legal/privacy', roles: ['admin', 'executive'], permissions: ['legal:privacy'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.finance.accounts', path: '/dashboard/company/finance/accounts', roles: ['admin', 'executive'], permissions: ['company_finance:read'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.finance.cashflow', path: '/dashboard/company/finance/cashflow', roles: ['admin', 'executive'], permissions: ['company_finance:read'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'company_ops.finance.reporting', path: '/dashboard/company/finance/reporting', roles: ['admin', 'executive'], permissions: ['company_finance:reporting'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['company_ops.finance.accounts'] },
  { id: 'company_ops.finance.tax', path: '/dashboard/company/finance/tax', roles: ['admin', 'executive'], permissions: ['company_finance:tax'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: ['company_ops.finance.accounts'] },
  { id: 'company_ops.capital.cap_table', path: '/dashboard/company/capital/cap-table', roles: ['admin', 'executive'], permissions: ['capital:admin'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'company_ops.capital.fundraising', path: '/dashboard/company/capital/fundraising', roles: ['admin', 'executive'], permissions: ['capital:admin'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'company_ops.capital.shareholder_registry', path: '/dashboard/company/capital/shareholders', roles: ['admin', 'executive'], permissions: ['capital:admin'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['company_ops.capital.cap_table'] },
  { id: 'company_ops.capital.sovereign_funds', path: '/dashboard/company/capital/sovereign-funds', roles: ['admin', 'executive'], permissions: ['capital:admin'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.capital.investment_docs', path: '/dashboard/company/capital/documents', roles: ['admin', 'executive'], permissions: ['capital:admin'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.capital.scenario_modelling', path: '/dashboard/company/capital/scenarios', roles: ['admin', 'executive'], permissions: ['capital:admin'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: ['company_ops.capital.cap_table'] },
  { id: 'company_ops.board.meetings', path: '/dashboard/company/board/meetings', roles: ['admin', 'executive'], permissions: ['board:admin'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.board.minutes', path: '/dashboard/company/board/minutes', roles: ['admin', 'executive'], permissions: ['board:admin'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['company_ops.board.meetings'] },
  { id: 'company_ops.board.directors', path: '/dashboard/company/board/directors', roles: ['admin', 'executive'], permissions: ['board:admin'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.board.governance', path: '/dashboard/company/board/governance', roles: ['admin', 'executive'], permissions: ['board:admin'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: [] },
  { id: 'company_ops.board.company_secretary', path: '/dashboard/company/board/secretary', roles: ['admin', 'executive'], permissions: ['board:admin'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.insurance.portfolio', path: '/dashboard/company/insurance/portfolio', roles: ['admin', 'executive'], permissions: ['insurance:read'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.insurance.risk_register', path: '/dashboard/company/insurance/risks', roles: ['admin', 'executive'], permissions: ['risk:read'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.insurance.bcp', path: '/dashboard/company/insurance/bcp', roles: ['admin', 'executive'], permissions: ['risk:admin'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: [] },
  { id: 'company_ops.insurance.claims', path: '/dashboard/company/insurance/claims', roles: ['admin', 'executive'], permissions: ['insurance:admin'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['company_ops.insurance.portfolio'] },
  { id: 'company_ops.knowledge.wiki', path: '/dashboard/company/knowledge/wiki', roles: ['admin', 'executive', 'staff'], permissions: ['knowledge:read'], status: 'planned', phase: 'company_formation', priority: 'p3', dependencies: [] },
  { id: 'company_ops.knowledge.documents', path: '/dashboard/company/knowledge/documents', roles: ['admin', 'executive', 'staff'], permissions: ['documents:read'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'company_ops.knowledge.project_mgmt', path: '/dashboard/company/knowledge/projects', roles: ['admin', 'executive', 'staff'], permissions: ['projects:read'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.local.councils', path: '/dashboard/government/local/councils', roles: ['admin', 'executive'], permissions: ['government:read'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.local.meetings', path: '/dashboard/government/local/meetings', roles: ['admin', 'executive'], permissions: ['government:meetings'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: ['gov_policy.local.councils'] },
  { id: 'gov_policy.local.correspondence', path: '/dashboard/government/local/correspondence', roles: ['admin', 'executive'], permissions: ['government:correspondence'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: ['gov_policy.local.councils'] },
  { id: 'gov_policy.local.da_engagement', path: '/dashboard/government/local/da-engagement', roles: ['admin', 'executive'], permissions: ['government:planning'], status: 'planned', phase: 'planning_approvals', priority: 'p2', dependencies: ['campus_dev.planning.da_applications'] },
  { id: 'gov_policy.local.incentives', path: '/dashboard/government/local/incentives', roles: ['admin', 'executive'], permissions: ['government:incentives'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.state.ministers', path: '/dashboard/government/state/ministers', roles: ['admin', 'executive'], permissions: ['government:read'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.state.meetings', path: '/dashboard/government/state/meetings', roles: ['admin', 'executive'], permissions: ['government:meetings'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: ['gov_policy.state.ministers'] },
  { id: 'gov_policy.state.screen_qld', path: '/dashboard/government/state/screen-qld', roles: ['admin', 'executive'], permissions: ['government:agencies'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'gov_policy.state.tiq', path: '/dashboard/government/state/tiq', roles: ['admin', 'executive'], permissions: ['government:agencies'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.state.incentives', path: '/dashboard/government/state/incentives', roles: ['admin', 'executive'], permissions: ['government:incentives'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'gov_policy.state.crown_lease', path: '/dashboard/government/state/crown-lease', roles: ['admin', 'executive'], permissions: ['government:leasing'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'gov_policy.state.policy', path: '/dashboard/government/state/policy', roles: ['admin', 'executive'], permissions: ['government:policy'], status: 'planned', phase: 'site_acquisition', priority: 'p3', dependencies: [] },
  { id: 'gov_policy.federal.ministers', path: '/dashboard/government/federal/ministers', roles: ['admin', 'executive'], permissions: ['government:read'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.federal.incentives', path: '/dashboard/government/federal/incentives', roles: ['admin', 'executive'], permissions: ['government:incentives'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'gov_policy.federal.arts_office', path: '/dashboard/government/federal/arts', roles: ['admin', 'executive'], permissions: ['government:agencies'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.federal.grants', path: '/dashboard/government/federal/grants', roles: ['admin', 'executive'], permissions: ['government:incentives'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.international.singapore', path: '/dashboard/government/international/singapore', roles: ['admin', 'executive'], permissions: ['government:international'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: [] },
  { id: 'gov_policy.international.hawaii', path: '/dashboard/government/international/hawaii', roles: ['admin', 'executive'], permissions: ['government:international'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: [] },
  { id: 'gov_policy.international.europe', path: '/dashboard/government/international/europe', roles: ['admin', 'executive'], permissions: ['government:international'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: [] },
  { id: 'gov_policy.international.usa', path: '/dashboard/government/international/usa', roles: ['admin', 'executive'], permissions: ['government:international'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: [] },
  { id: 'gov_policy.outreach.campaigns', path: '/dashboard/government/outreach/campaigns', roles: ['admin', 'executive'], permissions: ['government:outreach'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.outreach.stakeholder_map', path: '/dashboard/government/outreach/stakeholder-map', roles: ['admin', 'executive'], permissions: ['government:outreach'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'gov_policy.outreach.briefings', path: '/dashboard/government/outreach/briefings', roles: ['admin', 'executive'], permissions: ['government:outreach'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'first_nations.traditional_owners.groups', path: '/dashboard/first-nations/traditional-owners/groups', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:read'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'first_nations.traditional_owners.engagement', path: '/dashboard/first-nations/traditional-owners/engagement', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:engagement'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['first_nations.traditional_owners.groups'] },
  { id: 'first_nations.traditional_owners.agreements', path: '/dashboard/first-nations/traditional-owners/agreements', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:agreements'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['first_nations.traditional_owners.groups'] },
  { id: 'first_nations.cultural_heritage.surveys', path: '/dashboard/first-nations/heritage/surveys', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:heritage'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'first_nations.cultural_heritage.sites', path: '/dashboard/first-nations/heritage/sites', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:heritage'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['first_nations.cultural_heritage.surveys'] },
  { id: 'first_nations.cultural_heritage.duty_of_care', path: '/dashboard/first-nations/heritage/compliance', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:compliance'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['first_nations.cultural_heritage.surveys'] },
  { id: 'first_nations.cultural_heritage.native_title', path: '/dashboard/first-nations/heritage/native-title', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:native_title'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'first_nations.ways.campus_design', path: '/dashboard/first-nations/ways/campus-design', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:ways'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: [] },
  { id: 'first_nations.ways.seasonal_calendar', path: '/dashboard/first-nations/ways/calendar', roles: ['admin', 'executive', 'staff', 'first_nations'], permissions: ['first_nations:ways'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: [] },
  { id: 'first_nations.ways.language', path: '/dashboard/first-nations/ways/language', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:ways'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: [] },
  { id: 'first_nations.ways.cultural_spaces', path: '/dashboard/first-nations/ways/spaces', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:ways'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: [] },
  { id: 'first_nations.programs.employment', path: '/dashboard/first-nations/programs/employment', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:programs'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'first_nations.programs.suppliers', path: '/dashboard/first-nations/programs/suppliers', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:programs'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'first_nations.programs.artists', path: '/dashboard/first-nations/programs/artists', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:programs'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'first_nations.programs.cultural_safety', path: '/dashboard/first-nations/programs/cultural-safety', roles: ['admin', 'executive', 'staff', 'first_nations'], permissions: ['first_nations:training'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'first_nations.rap.plan', path: '/dashboard/first-nations/rap/plan', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:rap'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'first_nations.rap.reporting', path: '/dashboard/first-nations/rap/reporting', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:rap'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['first_nations.rap.plan'] },
  { id: 'first_nations.advisory.board', path: '/dashboard/first-nations/advisory/board', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:advisory'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'first_nations.protocols.welcome', path: '/dashboard/first-nations/protocols/welcome', roles: ['admin', 'executive', 'staff', 'first_nations'], permissions: ['first_nations:protocols'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'first_nations.protocols.acknowledgement', path: '/dashboard/first-nations/protocols/acknowledgement', roles: ['admin', 'executive', 'staff', 'first_nations'], permissions: ['first_nations:protocols'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'first_nations.protocols.cultural_ip', path: '/dashboard/first-nations/protocols/cultural-ip', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:cultural_ip'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'first_nations.outreach.community', path: '/dashboard/first-nations/outreach/community', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:outreach'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'first_nations.outreach.screen_industry', path: '/dashboard/first-nations/outreach/screen', roles: ['admin', 'executive', 'first_nations'], permissions: ['first_nations:outreach'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'first_nations.outreach.events', path: '/dashboard/first-nations/outreach/events', roles: ['admin', 'executive', 'staff', 'first_nations'], permissions: ['first_nations:outreach'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'community.stakeholder_engagement.advisory_boards', path: '/dashboard/community/stakeholders/advisory-boards', roles: ['admin', 'executive', 'staff', 'government', 'first_nations'], permissions: ['community:advisory_boards'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'community.stakeholder_engagement.public_consultation', path: '/dashboard/community/stakeholders/public-consultation', roles: ['admin', 'executive', 'staff', 'government', 'first_nations', 'guest'], permissions: ['community:public_consultation'], status: 'planned', phase: 'planning_approvals', priority: 'p1', dependencies: ['community.stakeholder_engagement.advisory_boards'] },
  { id: 'community.stakeholder_engagement.feedback_management', path: '/dashboard/community/stakeholders/feedback', roles: ['admin', 'staff'], permissions: ['community:feedback'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'community.stakeholder_engagement.stakeholder_directory', path: '/dashboard/community/stakeholders/directory', roles: ['admin', 'executive', 'staff'], permissions: ['community:stakeholder_directory'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'community.social_impact.economic_reporting', path: '/dashboard/community/social-impact/economic-reporting', roles: ['admin', 'executive', 'government', 'investor'], permissions: ['community:economic_reporting'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: [] },
  { id: 'community.social_impact.employment_metrics', path: '/dashboard/community/social-impact/employment', roles: ['admin', 'executive', 'staff', 'government'], permissions: ['community:employment_metrics'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: [] },
  { id: 'community.social_impact.local_business', path: '/dashboard/community/social-impact/local-business', roles: ['admin', 'executive', 'staff', 'vendor'], permissions: ['community:local_business'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['community.social_impact.economic_reporting'] },
  { id: 'community.cultural_programs.community_events', path: '/dashboard/community/cultural/events', roles: ['admin', 'staff', 'guest'], permissions: ['community:events'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'community.cultural_programs.open_days', path: '/dashboard/community/cultural/open-days', roles: ['admin', 'staff', 'guest'], permissions: ['community:open_days'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['community.cultural_programs.community_events'] },
  { id: 'community.cultural_programs.public_art', path: '/dashboard/community/cultural/public-art', roles: ['admin', 'staff', 'first_nations', 'partner'], permissions: ['community:public_art'], status: 'planned', phase: 'design_construct', priority: 'p3', dependencies: [] },
  { id: 'community.cultural_programs.cultural_partnerships', path: '/dashboard/community/cultural/partnerships', roles: ['admin', 'executive', 'staff', 'first_nations', 'partner'], permissions: ['community:cultural_partnerships'], status: 'planned', phase: 'pre_operations', priority: 'p3', dependencies: [] },
  { id: 'community.media_relations.press_releases', path: '/dashboard/community/media/press-releases', roles: ['admin', 'executive', 'staff'], permissions: ['community:press_releases'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'community.media_relations.media_monitoring', path: '/dashboard/community/media/monitoring', roles: ['admin', 'executive', 'staff'], permissions: ['community:media_monitoring'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'community.media_relations.spokesperson', path: '/dashboard/community/media/spokespersons', roles: ['admin', 'executive'], permissions: ['community:spokesperson'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'community.media_relations.crisis_comms', path: '/dashboard/community/media/crisis', roles: ['admin', 'executive'], permissions: ['community:crisis_comms'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['community.media_relations.spokesperson'] },
  { id: 'partnerships.technology_partners.directory', path: '/dashboard/partnerships/technology/directory', roles: ['admin', 'executive', 'staff', 'partner'], permissions: ['partnerships:tech_directory'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'partnerships.technology_partners.integrations', path: '/dashboard/partnerships/technology/integrations', roles: ['admin', 'staff', 'partner'], permissions: ['partnerships:integrations'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: ['partnerships.technology_partners.directory'] },
  { id: 'partnerships.technology_partners.joint_rd', path: '/dashboard/partnerships/technology/rd', roles: ['admin', 'executive', 'staff', 'partner'], permissions: ['partnerships:joint_rd'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['partnerships.technology_partners.directory'] },
  { id: 'partnerships.technology_partners.ip_sharing', path: '/dashboard/partnerships/technology/ip', roles: ['admin', 'executive'], permissions: ['partnerships:ip_sharing'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['partnerships.technology_partners.joint_rd'] },
  { id: 'partnerships.education_partners.university_programs', path: '/dashboard/partnerships/education/universities', roles: ['admin', 'executive', 'staff', 'partner'], permissions: ['partnerships:university_programs'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'partnerships.education_partners.internships', path: '/dashboard/partnerships/education/internships', roles: ['admin', 'staff', 'partner'], permissions: ['partnerships:internships'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['partnerships.education_partners.university_programs'] },
  { id: 'partnerships.education_partners.curriculum', path: '/dashboard/partnerships/education/curriculum', roles: ['admin', 'executive', 'staff', 'partner'], permissions: ['partnerships:curriculum'], status: 'planned', phase: 'pre_operations', priority: 'p3', dependencies: ['partnerships.education_partners.university_programs'] },
  { id: 'partnerships.education_partners.research', path: '/dashboard/partnerships/education/research', roles: ['admin', 'executive', 'partner'], permissions: ['partnerships:research'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['partnerships.education_partners.university_programs'] },
  { id: 'partnerships.industry_alliances.co_production', path: '/dashboard/partnerships/industry/co-production', roles: ['admin', 'executive', 'client', 'partner'], permissions: ['partnerships:co_production'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'partnerships.industry_alliances.facility_sharing', path: '/dashboard/partnerships/industry/facility-sharing', roles: ['admin', 'staff', 'partner'], permissions: ['partnerships:facility_sharing'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: [] },
  { id: 'partnerships.industry_alliances.cross_campus', path: '/dashboard/partnerships/industry/cross-campus', roles: ['admin', 'executive', 'staff', 'client', 'partner'], permissions: ['partnerships:cross_campus'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: ['partnerships.industry_alliances.facility_sharing'] },
  { id: 'partnerships.sovereign_funds.government_programs', path: '/dashboard/partnerships/sovereign/government-programs', roles: ['admin', 'executive', 'government'], permissions: ['partnerships:government_programs'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'partnerships.sovereign_funds.fund_engagement', path: '/dashboard/partnerships/sovereign/fund-engagement', roles: ['admin', 'executive', 'investor'], permissions: ['partnerships:fund_engagement'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'partnerships.sovereign_funds.economic_tracking', path: '/dashboard/partnerships/sovereign/economic-tracking', roles: ['admin', 'executive', 'government', 'investor'], permissions: ['partnerships:economic_tracking'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: ['partnerships.sovereign_funds.government_programs'] },
  { id: 'data_rooms.investor.financial_documents', path: '/dashboard/data-rooms/investor/financials', roles: ['admin', 'executive', 'investor'], permissions: ['data_rooms:investor_financials'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'data_rooms.investor.due_diligence', path: '/dashboard/data-rooms/investor/due-diligence', roles: ['admin', 'executive', 'investor'], permissions: ['data_rooms:due_diligence'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['data_rooms.investor.financial_documents'] },
  { id: 'data_rooms.investor.materials', path: '/dashboard/data-rooms/investor/materials', roles: ['admin', 'executive', 'investor'], permissions: ['data_rooms:investor_materials'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'data_rooms.investor.access_control', path: '/dashboard/data-rooms/investor/access', roles: ['admin', 'executive'], permissions: ['data_rooms:access_control'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'data_rooms.government.grant_applications', path: '/dashboard/data-rooms/government/grants', roles: ['admin', 'executive', 'government'], permissions: ['data_rooms:grants'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'data_rooms.government.compliance', path: '/dashboard/data-rooms/government/compliance', roles: ['admin', 'executive', 'government'], permissions: ['data_rooms:compliance'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'data_rooms.government.economic_reports', path: '/dashboard/data-rooms/government/economic-reports', roles: ['admin', 'executive', 'government'], permissions: ['data_rooms:economic_reports'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: ['community.social_impact.economic_reporting'] },
  { id: 'data_rooms.project.per_production', path: '/dashboard/data-rooms/projects/productions', roles: ['admin', 'staff', 'client', 'vendor'], permissions: ['data_rooms:project_sharing'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['data_rooms.investor.access_control'] },
  { id: 'data_rooms.project.nda_tracking', path: '/dashboard/data-rooms/projects/ndas', roles: ['admin', 'executive', 'staff'], permissions: ['data_rooms:nda_tracking'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'data_rooms.project.watermarked_access', path: '/dashboard/data-rooms/projects/watermarked', roles: ['admin'], permissions: ['data_rooms:watermark'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['data_rooms.project.per_production'] },
  { id: 'data_rooms.partnership.joint_venture', path: '/dashboard/data-rooms/partnerships/joint-ventures', roles: ['admin', 'executive', 'partner', 'investor'], permissions: ['data_rooms:joint_venture'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['data_rooms.investor.access_control'] },
  { id: 'data_rooms.partnership.term_sheets', path: '/dashboard/data-rooms/partnerships/term-sheets', roles: ['admin', 'executive', 'partner'], permissions: ['data_rooms:term_sheets'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'data_rooms.partnership.collaboration_agreements', path: '/dashboard/data-rooms/partnerships/collaboration', roles: ['admin', 'executive', 'partner'], permissions: ['data_rooms:collaboration'], status: 'planned', phase: 'site_acquisition', priority: 'p2', dependencies: [] },
  { id: 'campus_dev.site_search.identification', path: '/dashboard/campus/site-search/identification', roles: ['admin', 'executive'], permissions: ['campus:site_identification'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'campus_dev.site_search.due_diligence', path: '/dashboard/campus/site-search/due-diligence', roles: ['admin', 'executive', 'staff'], permissions: ['campus:site_due_diligence'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['campus_dev.site_search.identification'] },
  { id: 'campus_dev.site_search.feasibility', path: '/dashboard/campus/site-search/feasibility', roles: ['admin', 'executive', 'investor'], permissions: ['campus:feasibility'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['campus_dev.site_search.due_diligence'] },
  { id: 'campus_dev.site_search.acquisition', path: '/dashboard/campus/site-search/acquisition', roles: ['admin', 'executive'], permissions: ['campus:acquisition'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['campus_dev.site_search.feasibility'] },
  { id: 'campus_dev.planning.da_applications', path: '/dashboard/campus/planning/da', roles: ['admin', 'executive', 'staff', 'government'], permissions: ['campus:da_applications'], status: 'planned', phase: 'planning_approvals', priority: 'p1', dependencies: ['campus_dev.site_search.acquisition'] },
  { id: 'campus_dev.planning.zoning', path: '/dashboard/campus/planning/zoning', roles: ['admin', 'staff', 'government'], permissions: ['campus:zoning'], status: 'planned', phase: 'planning_approvals', priority: 'p1', dependencies: [] },
  { id: 'campus_dev.planning.heritage', path: '/dashboard/campus/planning/heritage', roles: ['admin', 'staff', 'first_nations', 'government'], permissions: ['campus:heritage'], status: 'planned', phase: 'planning_approvals', priority: 'p1', dependencies: [] },
  { id: 'campus_dev.planning.environmental', path: '/dashboard/campus/planning/environmental', roles: ['admin', 'staff', 'government'], permissions: ['campus:environmental'], status: 'planned', phase: 'planning_approvals', priority: 'p1', dependencies: [] },
  { id: 'campus_dev.planning.community_consultation', path: '/dashboard/campus/planning/community', roles: ['admin', 'staff', 'government', 'first_nations', 'guest'], permissions: ['campus:community_consultation'], status: 'planned', phase: 'planning_approvals', priority: 'p1', dependencies: ['community.stakeholder_engagement.public_consultation'] },
  { id: 'campus_dev.design.master_plan', path: '/dashboard/campus/design/master-plan', roles: ['admin', 'executive', 'staff', 'investor', 'government'], permissions: ['campus:master_plan'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: ['campus_dev.planning.da_applications'] },
  { id: 'campus_dev.design.architecture', path: '/dashboard/campus/design/architecture', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:architecture'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: ['campus_dev.design.master_plan'] },
  { id: 'campus_dev.design.engineering', path: '/dashboard/campus/design/engineering', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:engineering'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: ['campus_dev.design.architecture'] },
  { id: 'campus_dev.design.interior', path: '/dashboard/campus/design/interior', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:interior'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: ['campus_dev.design.architecture'] },
  { id: 'campus_dev.design.sustainability', path: '/dashboard/campus/design/sustainability', roles: ['admin', 'executive', 'staff', 'government'], permissions: ['campus:sustainability_design'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: ['campus_dev.design.master_plan'] },
  { id: 'campus_dev.construction.project_management', path: '/dashboard/campus/construction/project-management', roles: ['admin', 'executive', 'staff', 'vendor'], permissions: ['campus:construction_pm'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: ['campus_dev.design.architecture'] },
  { id: 'campus_dev.construction.contractor_management', path: '/dashboard/campus/construction/contractors', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:contractors'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: [] },
  { id: 'campus_dev.construction.progress', path: '/dashboard/campus/construction/progress', roles: ['admin', 'executive', 'staff', 'investor'], permissions: ['campus:construction_progress'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: ['campus_dev.construction.project_management'] },
  { id: 'campus_dev.construction.quality', path: '/dashboard/campus/construction/quality', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:quality'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: ['campus_dev.construction.project_management'] },
  { id: 'campus_dev.construction.safety', path: '/dashboard/campus/construction/safety', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:safety'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: [] },
  { id: 'campus_dev.commissioning.fitout', path: '/dashboard/campus/commissioning/fitout', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:fitout'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['campus_dev.construction.project_management'] },
  { id: 'campus_dev.commissioning.systems_testing', path: '/dashboard/campus/commissioning/systems-testing', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:systems_testing'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['campus_dev.commissioning.fitout'] },
  { id: 'campus_dev.commissioning.certification', path: '/dashboard/campus/commissioning/certification', roles: ['admin', 'staff', 'government'], permissions: ['campus:certification'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['campus_dev.commissioning.systems_testing'] },
  { id: 'campus_dev.commissioning.punch_lists', path: '/dashboard/campus/commissioning/punch-lists', roles: ['admin', 'staff', 'vendor'], permissions: ['campus:punch_lists'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: ['campus_dev.commissioning.fitout'] },
  { id: 'campus_dev.campus_portfolio.overview', path: '/dashboard/campus/portfolio/overview', roles: ['admin', 'executive', 'investor'], permissions: ['campus:portfolio_overview'], status: 'planned', phase: 'expansion', priority: 'p2', dependencies: [] },
  { id: 'campus_dev.campus_portfolio.comparison', path: '/dashboard/campus/portfolio/comparison', roles: ['admin', 'executive', 'investor'], permissions: ['campus:portfolio_comparison'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: ['campus_dev.campus_portfolio.overview'] },
  { id: 'campus_dev.campus_portfolio.expansion_pipeline', path: '/dashboard/campus/portfolio/pipeline', roles: ['admin', 'executive', 'investor'], permissions: ['campus:expansion_pipeline'], status: 'planned', phase: 'expansion', priority: 'p2', dependencies: ['campus_dev.campus_portfolio.overview'] },
  { id: 'campus_dev.campus_portfolio.global_standards', path: '/dashboard/campus/portfolio/standards', roles: ['admin', 'executive'], permissions: ['campus:global_standards'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: [] },
  { id: 'productions.active.board', path: '/dashboard/productions/active/board', roles: ['admin', 'executive', 'staff', 'client'], permissions: ['productions:board'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'productions.active.timeline', path: '/dashboard/productions/active/timeline', roles: ['admin', 'staff', 'client'], permissions: ['productions:timeline'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['productions.active.board'] },
  { id: 'productions.active.call_sheets', path: '/dashboard/productions/active/call-sheets', roles: ['admin', 'staff', 'client'], permissions: ['productions:call_sheets'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['productions.active.board'] },
  { id: 'productions.active.daily_reports', path: '/dashboard/productions/active/daily-reports', roles: ['admin', 'staff', 'client'], permissions: ['productions:daily_reports'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.active.board'] },
  { id: 'productions.pre_production.script_breakdown', path: '/dashboard/productions/pre-production/script-breakdown', roles: ['admin', 'staff', 'client'], permissions: ['productions:script_breakdown'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'productions.pre_production.storyboarding', path: '/dashboard/productions/pre-production/storyboarding', roles: ['admin', 'staff', 'client'], permissions: ['productions:storyboarding'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['productions.pre_production.script_breakdown'] },
  { id: 'productions.pre_production.casting', path: '/dashboard/productions/pre-production/casting', roles: ['admin', 'staff', 'client'], permissions: ['productions:casting'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.pre_production.script_breakdown'] },
  { id: 'productions.pre_production.location_scouting', path: '/dashboard/productions/pre-production/locations', roles: ['admin', 'staff', 'client'], permissions: ['productions:locations'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'productions.pre_production.budget_estimation', path: '/dashboard/productions/pre-production/budget', roles: ['admin', 'executive', 'staff', 'client'], permissions: ['productions:budget_estimation'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['productions.pre_production.script_breakdown'] },
  { id: 'productions.production.shooting_schedules', path: '/dashboard/productions/production/schedules', roles: ['admin', 'staff', 'client'], permissions: ['productions:shooting_schedules'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['productions.pre_production.script_breakdown'] },
  { id: 'productions.production.crew_assignments', path: '/dashboard/productions/production/crew', roles: ['admin', 'staff'], permissions: ['productions:crew_assignments'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'productions.production.daily_logs', path: '/dashboard/productions/production/daily-logs', roles: ['admin', 'staff'], permissions: ['productions:daily_logs'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.production.shooting_schedules'] },
  { id: 'productions.production.rushes_review', path: '/dashboard/productions/production/rushes', roles: ['admin', 'staff', 'client'], permissions: ['productions:rushes_review'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.production.shooting_schedules'] },
  { id: 'productions.post_production.editing', path: '/dashboard/productions/post/editing', roles: ['admin', 'staff', 'client'], permissions: ['productions:editing'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'productions.post_production.color_grading', path: '/dashboard/productions/post/color', roles: ['admin', 'staff', 'client'], permissions: ['productions:color_grading'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['productions.post_production.editing'] },
  { id: 'productions.post_production.vfx', path: '/dashboard/productions/post/vfx', roles: ['admin', 'staff', 'client', 'vendor'], permissions: ['productions:vfx'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.post_production.editing'] },
  { id: 'productions.post_production.sound_mix', path: '/dashboard/productions/post/sound', roles: ['admin', 'staff', 'client'], permissions: ['productions:sound_mix'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.post_production.editing'] },
  { id: 'productions.post_production.deliverables', path: '/dashboard/productions/post/deliverables', roles: ['admin', 'staff', 'client'], permissions: ['productions:deliverables'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.post_production.editing', 'productions.post_production.sound_mix'] },
  { id: 'productions.finance.budgets', path: '/dashboard/productions/finance/budgets', roles: ['admin', 'executive', 'staff', 'client'], permissions: ['productions:budgets'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['productions.pre_production.budget_estimation'] },
  { id: 'productions.finance.cost_reports', path: '/dashboard/productions/finance/cost-reports', roles: ['admin', 'executive', 'staff', 'client'], permissions: ['productions:cost_reports'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['productions.finance.budgets'] },
  { id: 'productions.finance.purchase_orders', path: '/dashboard/productions/finance/purchase-orders', roles: ['admin', 'staff', 'vendor'], permissions: ['productions:purchase_orders'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['productions.finance.budgets'] },
  { id: 'productions.finance.petty_cash', path: '/dashboard/productions/finance/petty-cash', roles: ['admin', 'staff'], permissions: ['productions:petty_cash'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['productions.finance.budgets'] },
  { id: 'productions.finance.completion_guarantor', path: '/dashboard/productions/finance/guarantor', roles: ['admin', 'executive', 'investor'], permissions: ['productions:guarantor'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['productions.finance.cost_reports'] },
  { id: 'facilities.sound_stages.calendar', path: '/dashboard/facilities/sound-stages/calendar', roles: ['admin', 'staff', 'client'], permissions: ['facilities:stage_calendar'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'facilities.sound_stages.booking', path: '/dashboard/facilities/sound-stages/booking', roles: ['admin', 'staff', 'client'], permissions: ['facilities:stage_booking'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['facilities.sound_stages.calendar'] },
  { id: 'facilities.sound_stages.pricing', path: '/dashboard/facilities/sound-stages/pricing', roles: ['admin', 'executive'], permissions: ['facilities:stage_pricing'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'facilities.sound_stages.configuration', path: '/dashboard/facilities/sound-stages/config', roles: ['admin', 'staff'], permissions: ['facilities:stage_config'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.broadcast.theatre_booking', path: '/dashboard/facilities/broadcast/theatre-booking', roles: ['admin', 'staff', 'client'], permissions: ['facilities:broadcast_theatre'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['facilities.sound_stages.calendar'] },
  { id: 'facilities.broadcast.control_room_scheduling', path: '/dashboard/facilities/broadcast/control-rooms', roles: ['admin', 'staff'], permissions: ['facilities:control_room_scheduling'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'facilities.broadcast.presets', path: '/dashboard/facilities/broadcast/presets', roles: ['admin', 'staff'], permissions: ['facilities:broadcast_presets'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['facilities.broadcast.control_room_scheduling'] },
  { id: 'facilities.workshops.set_construction', path: '/dashboard/facilities/workshops/set-construction', roles: ['admin', 'staff', 'client'], permissions: ['facilities:set_construction'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'facilities.workshops.props', path: '/dashboard/facilities/workshops/props', roles: ['admin', 'staff'], permissions: ['facilities:props'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.workshops.costume', path: '/dashboard/facilities/workshops/costume', roles: ['admin', 'staff'], permissions: ['facilities:costume'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.workshops.paint_shop', path: '/dashboard/facilities/workshops/paint-shop', roles: ['admin', 'staff'], permissions: ['facilities:paint_shop'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: [] },
  { id: 'facilities.recording_studios.booking', path: '/dashboard/facilities/recording/booking', roles: ['admin', 'staff', 'client'], permissions: ['facilities:recording_booking'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['facilities.sound_stages.calendar'] },
  { id: 'facilities.recording_studios.session_management', path: '/dashboard/facilities/recording/sessions', roles: ['admin', 'staff', 'client'], permissions: ['facilities:recording_sessions'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['facilities.recording_studios.booking'] },
  { id: 'facilities.recording_studios.equipment', path: '/dashboard/facilities/recording/equipment', roles: ['admin', 'staff'], permissions: ['facilities:recording_equipment'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.support_spaces.dressing_rooms', path: '/dashboard/facilities/support/dressing-rooms', roles: ['admin', 'staff', 'client'], permissions: ['facilities:dressing_rooms'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.support_spaces.green_rooms', path: '/dashboard/facilities/support/green-rooms', roles: ['admin', 'staff'], permissions: ['facilities:green_rooms'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: [] },
  { id: 'facilities.support_spaces.catering', path: '/dashboard/facilities/support/catering', roles: ['admin', 'staff', 'vendor'], permissions: ['facilities:catering'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.support_spaces.parking', path: '/dashboard/facilities/support/parking', roles: ['admin', 'staff'], permissions: ['facilities:parking'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.support_spaces.storage', path: '/dashboard/facilities/support/storage', roles: ['admin', 'staff'], permissions: ['facilities:storage'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: [] },
  { id: 'facilities.maintenance.preventive', path: '/dashboard/facilities/maintenance/preventive', roles: ['admin', 'staff'], permissions: ['facilities:preventive_maintenance'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'facilities.maintenance.work_orders', path: '/dashboard/facilities/maintenance/work-orders', roles: ['admin', 'staff', 'vendor'], permissions: ['facilities:work_orders'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'facilities.maintenance.asset_lifecycle', path: '/dashboard/facilities/maintenance/assets', roles: ['admin', 'staff'], permissions: ['facilities:asset_lifecycle'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'facilities.maintenance.vendor_scheduling', path: '/dashboard/facilities/maintenance/vendors', roles: ['admin', 'staff', 'vendor'], permissions: ['facilities:vendor_scheduling'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['facilities.maintenance.work_orders'] },
  { id: 'facilities.rooms.room_booking', path: '/dashboard/facilities/rooms/booking', roles: ['admin', 'executive', 'staff', 'client'], permissions: ['facilities:booking'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'broadcast.live_production.rundown', path: '/dashboard/broadcast/live/rundown', roles: ['admin', 'staff', 'client'], permissions: ['broadcast:rundown'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'broadcast.live_production.cue_sheets', path: '/dashboard/broadcast/live/cue-sheets', roles: ['admin', 'staff'], permissions: ['broadcast:cue_sheets'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['broadcast.live_production.rundown'] },
  { id: 'broadcast.live_production.switching', path: '/dashboard/broadcast/live/switching', roles: ['admin', 'staff'], permissions: ['broadcast:switching'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.live_production.rundown'] },
  { id: 'broadcast.live_production.graphics', path: '/dashboard/broadcast/live/graphics', roles: ['admin', 'staff'], permissions: ['broadcast:graphics'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.live_production.rundown'] },
  { id: 'broadcast.control_room.booking', path: '/dashboard/broadcast/control-room/booking', roles: ['admin', 'staff', 'client'], permissions: ['broadcast:control_room_booking'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['facilities.broadcast.control_room_scheduling'] },
  { id: 'broadcast.control_room.technical_setup', path: '/dashboard/broadcast/control-room/setup', roles: ['admin', 'staff'], permissions: ['broadcast:technical_setup'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.control_room.booking'] },
  { id: 'broadcast.control_room.signal_routing', path: '/dashboard/broadcast/control-room/routing', roles: ['admin', 'staff'], permissions: ['broadcast:signal_routing'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.control_room.technical_setup'] },
  { id: 'broadcast.control_room.redundancy', path: '/dashboard/broadcast/control-room/redundancy', roles: ['admin', 'staff'], permissions: ['broadcast:redundancy'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.control_room.signal_routing'] },
  { id: 'broadcast.transmission.uplink', path: '/dashboard/broadcast/transmission/uplink', roles: ['admin', 'staff'], permissions: ['broadcast:uplink'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'broadcast.transmission.cdn', path: '/dashboard/broadcast/transmission/cdn', roles: ['admin', 'staff'], permissions: ['broadcast:cdn'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.transmission.uplink'] },
  { id: 'broadcast.transmission.multi_platform', path: '/dashboard/broadcast/transmission/multi-platform', roles: ['admin', 'staff', 'client'], permissions: ['broadcast:multi_platform'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['broadcast.transmission.cdn'] },
  { id: 'broadcast.transmission.latency_monitoring', path: '/dashboard/broadcast/transmission/latency', roles: ['admin', 'staff'], permissions: ['broadcast:latency_monitoring'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.transmission.uplink'] },
  { id: 'broadcast.planning.schedule', path: '/dashboard/broadcast/planning/schedule', roles: ['admin', 'executive', 'staff', 'client'], permissions: ['broadcast:schedule_planning'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'broadcast.planning.rehearsals', path: '/dashboard/broadcast/planning/rehearsals', roles: ['admin', 'staff', 'client'], permissions: ['broadcast:rehearsals'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.planning.schedule'] },
  { id: 'broadcast.planning.technical_requirements', path: '/dashboard/broadcast/planning/technical', roles: ['admin', 'staff'], permissions: ['broadcast:technical_requirements'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.planning.schedule'] },
  { id: 'broadcast.planning.risk_assessment', path: '/dashboard/broadcast/planning/risk', roles: ['admin', 'staff'], permissions: ['broadcast:risk_assessment'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['broadcast.planning.schedule'] },
  { id: 'virtual_production.led_volume.configuration', path: '/dashboard/virtual-production/led/configuration', roles: ['admin', 'staff'], permissions: ['vp:led_configuration'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'virtual_production.led_volume.content_management', path: '/dashboard/virtual-production/led/content', roles: ['admin', 'staff', 'client'], permissions: ['vp:led_content'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['virtual_production.led_volume.configuration'] },
  { id: 'virtual_production.led_volume.calibration', path: '/dashboard/virtual-production/led/calibration', roles: ['admin', 'staff'], permissions: ['vp:led_calibration'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['virtual_production.led_volume.configuration'] },
  { id: 'virtual_production.led_volume.show_files', path: '/dashboard/virtual-production/led/show-files', roles: ['admin', 'staff', 'client'], permissions: ['vp:show_files'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['virtual_production.led_volume.content_management'] },
  { id: 'virtual_production.previs.previsualization', path: '/dashboard/virtual-production/previs/previs', roles: ['admin', 'staff', 'client'], permissions: ['vp:previsualization'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'virtual_production.previs.techvis', path: '/dashboard/virtual-production/previs/techvis', roles: ['admin', 'staff'], permissions: ['vp:techvis'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['virtual_production.previs.previsualization'] },
  { id: 'virtual_production.previs.postvis', path: '/dashboard/virtual-production/previs/postvis', roles: ['admin', 'staff', 'client'], permissions: ['vp:postvis'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['virtual_production.previs.previsualization'] },
  { id: 'virtual_production.previs.virtual_camera', path: '/dashboard/virtual-production/previs/vcam', roles: ['admin', 'staff', 'client'], permissions: ['vp:virtual_camera'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'virtual_production.motion_capture.scheduling', path: '/dashboard/virtual-production/mocap/scheduling', roles: ['admin', 'staff', 'client'], permissions: ['vp:mocap_scheduling'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'virtual_production.motion_capture.performers', path: '/dashboard/virtual-production/mocap/performers', roles: ['admin', 'staff'], permissions: ['vp:mocap_performers'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'virtual_production.motion_capture.data_processing', path: '/dashboard/virtual-production/mocap/processing', roles: ['admin', 'staff'], permissions: ['vp:mocap_processing'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['virtual_production.motion_capture.scheduling'] },
  { id: 'virtual_production.motion_capture.cleanup', path: '/dashboard/virtual-production/mocap/cleanup', roles: ['admin', 'staff'], permissions: ['vp:mocap_cleanup'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['virtual_production.motion_capture.data_processing'] },
  { id: 'virtual_production.realtime_rendering.unreal_projects', path: '/dashboard/virtual-production/rendering/unreal', roles: ['admin', 'staff'], permissions: ['vp:unreal_projects'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'virtual_production.realtime_rendering.asset_library', path: '/dashboard/virtual-production/rendering/assets', roles: ['admin', 'staff', 'client'], permissions: ['vp:asset_library'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'virtual_production.realtime_rendering.scene_management', path: '/dashboard/virtual-production/rendering/scenes', roles: ['admin', 'staff'], permissions: ['vp:scene_management'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['virtual_production.realtime_rendering.unreal_projects'] },
  { id: 'virtual_production.realtime_rendering.performance', path: '/dashboard/virtual-production/rendering/performance', roles: ['admin', 'staff'], permissions: ['vp:performance_monitoring'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['virtual_production.realtime_rendering.unreal_projects'] },
  { id: 'virtual_production.digital_assets.library', path: '/dashboard/virtual-production/digital-assets/library', roles: ['admin', 'staff', 'client'], permissions: ['vp:asset_library_3d'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'virtual_production.digital_assets.scan_processing', path: '/dashboard/virtual-production/digital-assets/scanning', roles: ['admin', 'staff'], permissions: ['vp:scan_processing'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'virtual_production.digital_assets.digital_twins', path: '/dashboard/virtual-production/digital-assets/twins', roles: ['admin', 'staff', 'client'], permissions: ['vp:digital_twins'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['virtual_production.digital_assets.scan_processing'] },
  { id: 'virtual_production.digital_assets.versioning', path: '/dashboard/virtual-production/digital-assets/versioning', roles: ['admin', 'staff'], permissions: ['vp:asset_versioning'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['virtual_production.digital_assets.library'] },
  { id: 'audio_music.recording.session_booking', path: '/dashboard/audio/recording/session-booking', roles: ['admin', 'staff', 'client'], permissions: ['audio:book_session'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['facilities.rooms.room_booking'] },
  { id: 'audio_music.recording.engineer_assignment', path: '/dashboard/audio/recording/engineer-assignment', roles: ['admin', 'staff'], permissions: ['audio:assign_engineer'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['talent_crew.crew_database.crew_profiles', 'audio_music.recording.session_booking'] },
  { id: 'audio_music.recording.track_management', path: '/dashboard/audio/recording/track-management', roles: ['admin', 'staff'], permissions: ['audio:manage_tracks'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['audio_music.recording.session_booking'] },
  { id: 'audio_music.recording.mix_versions', path: '/dashboard/audio/recording/mix-versions', roles: ['admin', 'staff', 'client'], permissions: ['audio:manage_mixes'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['audio_music.recording.track_management', 'workflow.review_approval.approval_chains'] },
  { id: 'audio_music.sound_design.sfx_library', path: '/dashboard/audio/sound-design/sfx-library', roles: ['admin', 'staff'], permissions: ['audio:browse_sfx', 'audio:manage_sfx'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.digital_assets_register.dam'] },
  { id: 'audio_music.sound_design.foley_scheduling', path: '/dashboard/audio/sound-design/foley-scheduling', roles: ['admin', 'staff'], permissions: ['audio:schedule_foley'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['audio_music.recording.session_booking'] },
  { id: 'audio_music.sound_design.adr_booking', path: '/dashboard/audio/sound-design/adr-booking', roles: ['admin', 'staff', 'client'], permissions: ['audio:book_adr'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['audio_music.recording.session_booking', 'talent_crew.casting.talent_management'] },
  { id: 'audio_music.sound_design.atmos_mixing', path: '/dashboard/audio/sound-design/atmos-mixing', roles: ['admin', 'staff'], permissions: ['audio:mix_atmos'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['audio_music.recording.session_booking', 'audio_music.recording.mix_versions'] },
  { id: 'audio_music.music_production.score_composition', path: '/dashboard/audio/music-production/score-composition', roles: ['admin', 'staff', 'client'], permissions: ['audio:manage_scores'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.pipeline.asset_pipeline'] },
  { id: 'audio_music.music_production.music_licensing', path: '/dashboard/audio/music-production/music-licensing', roles: ['admin', 'staff'], permissions: ['audio:manage_licenses'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'audio_music.music_production.library_management', path: '/dashboard/audio/music-production/library-management', roles: ['admin', 'staff'], permissions: ['audio:manage_library'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['inventory.digital_assets_register.dam'] },
  { id: 'audio_music.mastering.mastering_sessions', path: '/dashboard/audio/mastering/sessions', roles: ['admin', 'staff', 'client'], permissions: ['audio:book_mastering'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['audio_music.recording.session_booking'] },
  { id: 'audio_music.mastering.deliverable_formats', path: '/dashboard/audio/mastering/deliverable-formats', roles: ['admin', 'staff'], permissions: ['audio:manage_formats'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.deliverables.deliverable_specs'] },
  { id: 'audio_music.mastering.quality_control', path: '/dashboard/audio/mastering/quality-control', roles: ['admin', 'staff'], permissions: ['audio:run_qc'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.deliverables.qc_checklists'] },
  { id: 'workflow.pipeline.asset_pipeline', path: '/dashboard/workflow/pipeline/asset-pipeline', roles: ['admin', 'staff'], permissions: ['workflow:manage_pipeline'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'workflow.pipeline.workflow_templates', path: '/dashboard/workflow/pipeline/templates', roles: ['admin'], permissions: ['workflow:manage_templates'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'workflow.pipeline.stage_gates', path: '/dashboard/workflow/pipeline/stage-gates', roles: ['admin', 'staff'], permissions: ['workflow:manage_gates'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['workflow.pipeline.workflow_templates'] },
  { id: 'workflow.pipeline.handoff_tracking', path: '/dashboard/workflow/pipeline/handoffs', roles: ['admin', 'staff', 'vendor'], permissions: ['workflow:track_handoffs'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['workflow.pipeline.stage_gates'] },
  { id: 'workflow.review_approval.dailies_review', path: '/dashboard/workflow/review/dailies', roles: ['admin', 'staff', 'client'], permissions: ['workflow:review_dailies'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['workflow.pipeline.asset_pipeline'] },
  { id: 'workflow.review_approval.client_review', path: '/dashboard/workflow/review/client-sessions', roles: ['admin', 'staff', 'client'], permissions: ['workflow:manage_reviews'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['workflow.review_approval.dailies_review'] },
  { id: 'workflow.review_approval.approval_chains', path: '/dashboard/workflow/review/approval-chains', roles: ['admin', 'executive'], permissions: ['workflow:manage_approvals'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'workflow.review_approval.annotation_tools', path: '/dashboard/workflow/review/annotations', roles: ['admin', 'staff', 'client'], permissions: ['workflow:annotate'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.review_approval.dailies_review'] },
  { id: 'workflow.deliverables.deliverable_specs', path: '/dashboard/workflow/deliverables/specs', roles: ['admin', 'staff'], permissions: ['workflow:manage_specs'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'workflow.deliverables.format_management', path: '/dashboard/workflow/deliverables/formats', roles: ['admin', 'staff'], permissions: ['workflow:manage_formats'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.deliverables.deliverable_specs'] },
  { id: 'workflow.deliverables.qc_checklists', path: '/dashboard/workflow/deliverables/qc', roles: ['admin', 'staff'], permissions: ['workflow:run_qc'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['workflow.deliverables.deliverable_specs'] },
  { id: 'workflow.deliverables.distribution', path: '/dashboard/workflow/deliverables/distribution', roles: ['admin', 'staff', 'client'], permissions: ['workflow:distribute'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.deliverables.qc_checklists'] },
  { id: 'workflow.automation.automation_rules', path: '/dashboard/workflow/automation/rules', roles: ['admin'], permissions: ['workflow:manage_automation'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.pipeline.workflow_templates'] },
  { id: 'workflow.automation.triggers', path: '/dashboard/workflow/automation/triggers', roles: ['admin'], permissions: ['workflow:manage_triggers'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.automation.automation_rules'] },
  { id: 'workflow.automation.notifications', path: '/dashboard/workflow/automation/notifications', roles: ['admin', 'staff'], permissions: ['workflow:manage_notifications'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'workflow.automation.escalation_policies', path: '/dashboard/workflow/automation/escalation', roles: ['admin', 'executive'], permissions: ['workflow:manage_escalation'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['workflow.automation.notifications'] },
  { id: 'talent_crew.crew_database.crew_profiles', path: '/dashboard/talent/crew-database/profiles', roles: ['admin', 'staff'], permissions: ['talent:manage_profiles'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'talent_crew.crew_database.skills_certifications', path: '/dashboard/talent/crew-database/skills', roles: ['admin', 'staff'], permissions: ['talent:manage_skills'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['talent_crew.crew_database.crew_profiles'] },
  { id: 'talent_crew.crew_database.availability', path: '/dashboard/talent/crew-database/availability', roles: ['admin', 'staff'], permissions: ['talent:view_availability', 'talent:manage_availability'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['talent_crew.crew_database.crew_profiles'] },
  { id: 'talent_crew.crew_database.rate_cards', path: '/dashboard/talent/crew-database/rate-cards', roles: ['admin', 'executive'], permissions: ['talent:manage_rates'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['talent_crew.crew_database.crew_profiles'] },
  { id: 'talent_crew.casting.casting_calls', path: '/dashboard/talent/casting/calls', roles: ['admin', 'staff', 'client'], permissions: ['talent:manage_casting'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'talent_crew.casting.audition_scheduling', path: '/dashboard/talent/casting/auditions', roles: ['admin', 'staff'], permissions: ['talent:schedule_auditions'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['talent_crew.casting.casting_calls', 'facilities.rooms.room_booking'] },
  { id: 'talent_crew.casting.talent_management', path: '/dashboard/talent/casting/talent-management', roles: ['admin', 'staff'], permissions: ['talent:manage_talent'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['talent_crew.casting.casting_calls'] },
  { id: 'talent_crew.casting.talent_agreements', path: '/dashboard/talent/casting/agreements', roles: ['admin', 'executive'], permissions: ['talent:manage_agreements'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['talent_crew.casting.talent_management'] },
  { id: 'talent_crew.crew_scheduling.call_sheets', path: '/dashboard/talent/scheduling/call-sheets', roles: ['admin', 'staff'], permissions: ['talent:manage_call_sheets'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['talent_crew.crew_database.availability'] },
  { id: 'talent_crew.crew_scheduling.department_scheduling', path: '/dashboard/talent/scheduling/departments', roles: ['admin', 'staff'], permissions: ['talent:manage_schedules'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['talent_crew.crew_database.availability'] },
  { id: 'talent_crew.crew_scheduling.overtime_tracking', path: '/dashboard/talent/scheduling/overtime', roles: ['admin', 'executive'], permissions: ['talent:track_overtime'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['talent_crew.crew_scheduling.call_sheets'] },
  { id: 'talent_crew.crew_scheduling.meal_breaks', path: '/dashboard/talent/scheduling/meal-breaks', roles: ['admin', 'staff'], permissions: ['talent:manage_breaks'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['talent_crew.crew_scheduling.call_sheets'] },
  { id: 'talent_crew.safety_compliance.safety_inductions', path: '/dashboard/talent/safety/inductions', roles: ['admin', 'staff'], permissions: ['talent:manage_inductions'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'talent_crew.safety_compliance.incident_reporting', path: '/dashboard/talent/safety/incidents', roles: ['admin', 'staff', 'executive'], permissions: ['talent:report_incidents', 'talent:investigate_incidents'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'talent_crew.safety_compliance.first_aid', path: '/dashboard/talent/safety/first-aid', roles: ['admin', 'staff'], permissions: ['talent:manage_first_aid'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['talent_crew.safety_compliance.safety_inductions'] },
  { id: 'talent_crew.safety_compliance.ppe_tracking', path: '/dashboard/talent/safety/ppe', roles: ['admin', 'staff'], permissions: ['talent:manage_ppe'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.equipment.equipment_register'] },
  { id: 'talent_crew.safety_compliance.health_protocols', path: '/dashboard/talent/safety/health-protocols', roles: ['admin', 'staff', 'executive'], permissions: ['talent:manage_health'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'education.programs.course_catalog', path: '/dashboard/education/programs/catalog', roles: ['admin', 'staff', 'guest'], permissions: ['education:manage_catalog'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'education.programs.program_management', path: '/dashboard/education/programs/management', roles: ['admin', 'staff'], permissions: ['education:manage_programs'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['education.programs.course_catalog'] },
  { id: 'education.programs.curriculum_design', path: '/dashboard/education/programs/curriculum', roles: ['admin', 'staff'], permissions: ['education:design_curriculum'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: ['education.programs.program_management'] },
  { id: 'education.programs.accreditation', path: '/dashboard/education/programs/accreditation', roles: ['admin', 'executive'], permissions: ['education:manage_accreditation'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: ['education.programs.program_management'] },
  { id: 'education.students.enrollment', path: '/dashboard/education/students/enrollment', roles: ['admin', 'staff'], permissions: ['education:manage_enrollment'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['education.programs.course_catalog'] },
  { id: 'education.students.progress_tracking', path: '/dashboard/education/students/progress', roles: ['admin', 'staff'], permissions: ['education:track_progress'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['education.students.enrollment'] },
  { id: 'education.students.assessment', path: '/dashboard/education/students/assessment', roles: ['admin', 'staff'], permissions: ['education:manage_assessments'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['education.students.progress_tracking'] },
  { id: 'education.students.certification', path: '/dashboard/education/students/certification', roles: ['admin', 'staff'], permissions: ['education:issue_certificates'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['education.students.assessment'] },
  { id: 'education.internships.internship_programs', path: '/dashboard/education/internships/programs', roles: ['admin', 'staff'], permissions: ['education:manage_internships'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['education.programs.program_management'] },
  { id: 'education.internships.placement_management', path: '/dashboard/education/internships/placements', roles: ['admin', 'staff'], permissions: ['education:manage_placements'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['education.internships.internship_programs'] },
  { id: 'education.internships.mentor_assignment', path: '/dashboard/education/internships/mentors', roles: ['admin', 'staff'], permissions: ['education:assign_mentors'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['education.internships.placement_management', 'talent_crew.crew_database.crew_profiles'] },
  { id: 'education.internships.evaluations', path: '/dashboard/education/internships/evaluations', roles: ['admin', 'staff'], permissions: ['education:manage_evaluations'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['education.internships.mentor_assignment'] },
  { id: 'education.workshops.workshop_scheduling', path: '/dashboard/education/workshops/scheduling', roles: ['admin', 'staff'], permissions: ['education:schedule_workshops'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['facilities.rooms.room_booking'] },
  { id: 'education.workshops.trainer_management', path: '/dashboard/education/workshops/trainers', roles: ['admin', 'staff'], permissions: ['education:manage_trainers'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['talent_crew.crew_database.crew_profiles'] },
  { id: 'education.workshops.materials', path: '/dashboard/education/workshops/materials', roles: ['admin', 'staff'], permissions: ['education:manage_materials'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['education.workshops.workshop_scheduling'] },
  { id: 'education.workshops.participant_tracking', path: '/dashboard/education/workshops/participants', roles: ['admin', 'staff'], permissions: ['education:track_participants'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['education.workshops.workshop_scheduling'] },
  { id: 'education.research.rd_projects', path: '/dashboard/education/research/projects', roles: ['admin', 'staff', 'partner'], permissions: ['education:manage_research'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'education.research.research_partnerships', path: '/dashboard/education/research/partnerships', roles: ['admin', 'executive', 'partner'], permissions: ['education:manage_partnerships'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['education.research.rd_projects'] },
  { id: 'education.research.grants', path: '/dashboard/education/research/grants', roles: ['admin', 'executive'], permissions: ['education:manage_grants'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['education.research.rd_projects'] },
  { id: 'education.research.publications', path: '/dashboard/education/research/publications', roles: ['admin', 'staff', 'partner'], permissions: ['education:manage_publications'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: ['education.research.rd_projects'] },
  { id: 'events_tickets.events.event_calendar', path: '/dashboard/events/events/calendar', roles: ['admin', 'staff', 'client', 'guest'], permissions: ['events:view_calendar'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'events_tickets.events.event_creation', path: '/dashboard/events/events/create', roles: ['admin', 'staff'], permissions: ['events:create_events'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['events_tickets.events.event_calendar'] },
  { id: 'events_tickets.events.logistics', path: '/dashboard/events/events/logistics', roles: ['admin', 'staff', 'vendor'], permissions: ['events:manage_logistics'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['events_tickets.events.event_creation'] },
  { id: 'events_tickets.events.venue_management', path: '/dashboard/events/events/venues', roles: ['admin'], permissions: ['events:manage_venues'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'events_tickets.ticketing.ticket_sales', path: '/dashboard/events/ticketing/sales', roles: ['admin', 'staff'], permissions: ['events:sell_tickets'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['events_tickets.events.event_creation'] },
  { id: 'events_tickets.ticketing.seating_maps', path: '/dashboard/events/ticketing/seating', roles: ['admin'], permissions: ['events:manage_seating'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: ['events_tickets.events.venue_management'] },
  { id: 'events_tickets.ticketing.pricing_tiers', path: '/dashboard/events/ticketing/pricing', roles: ['admin', 'executive'], permissions: ['events:manage_pricing'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'events_tickets.ticketing.promo_codes', path: '/dashboard/events/ticketing/promos', roles: ['admin', 'staff'], permissions: ['events:manage_promos'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['events_tickets.ticketing.ticket_sales'] },
  { id: 'events_tickets.ticketing.refunds', path: '/dashboard/events/ticketing/refunds', roles: ['admin', 'staff'], permissions: ['events:process_refunds'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['events_tickets.ticketing.ticket_sales'] },
  { id: 'events_tickets.tours.tour_bookings', path: '/dashboard/events/tours/bookings', roles: ['admin', 'staff', 'guest'], permissions: ['events:book_tours'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['events_tickets.events.event_calendar'] },
  { id: 'events_tickets.tours.guide_scheduling', path: '/dashboard/events/tours/guides', roles: ['admin', 'staff'], permissions: ['events:schedule_guides'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['events_tickets.tours.tour_bookings', 'talent_crew.crew_database.availability'] },
  { id: 'events_tickets.tours.group_management', path: '/dashboard/events/tours/groups', roles: ['admin', 'staff'], permissions: ['events:manage_groups'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['events_tickets.tours.tour_bookings'] },
  { id: 'events_tickets.tours.accessibility', path: '/dashboard/events/tours/accessibility', roles: ['admin', 'staff'], permissions: ['events:manage_accessibility'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['events_tickets.tours.tour_bookings'] },
  { id: 'events_tickets.experiences.vr_ar', path: '/dashboard/events/experiences/vr-ar', roles: ['admin', 'staff'], permissions: ['events:manage_experiences'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['events_tickets.events.venue_management'] },
  { id: 'events_tickets.experiences.interactive_exhibits', path: '/dashboard/events/experiences/exhibits', roles: ['admin', 'staff'], permissions: ['events:manage_exhibits'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['events_tickets.events.venue_management'] },
  { id: 'events_tickets.experiences.special_events', path: '/dashboard/events/experiences/special', roles: ['admin', 'staff', 'executive'], permissions: ['events:manage_special_events'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['events_tickets.events.event_creation'] },
  { id: 'events_tickets.experiences.package_deals', path: '/dashboard/events/experiences/packages', roles: ['admin', 'executive'], permissions: ['events:manage_packages'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['events_tickets.ticketing.pricing_tiers', 'events_tickets.tours.tour_bookings'] },
  { id: 'finance.revenue.revenue_tracking', path: '/dashboard/finance/revenue/tracking', roles: ['admin', 'executive'], permissions: ['finance:view_revenue'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'finance.revenue.invoicing', path: '/dashboard/finance/revenue/invoicing', roles: ['admin', 'staff'], permissions: ['finance:manage_invoices'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'finance.revenue.collections', path: '/dashboard/finance/revenue/collections', roles: ['admin', 'staff'], permissions: ['finance:manage_collections'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['finance.revenue.invoicing'] },
  { id: 'finance.revenue.revenue_recognition', path: '/dashboard/finance/revenue/recognition', roles: ['admin', 'executive'], permissions: ['finance:manage_recognition'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['finance.revenue.invoicing'] },
  { id: 'finance.budgeting.annual_budgets', path: '/dashboard/finance/budgeting/annual', roles: ['admin', 'executive'], permissions: ['finance:manage_budgets'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'finance.budgeting.departmental_budgets', path: '/dashboard/finance/budgeting/departments', roles: ['admin', 'executive', 'staff'], permissions: ['finance:view_budgets', 'finance:manage_dept_budgets'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['finance.budgeting.annual_budgets'] },
  { id: 'finance.budgeting.variance_analysis', path: '/dashboard/finance/budgeting/variance', roles: ['admin', 'executive'], permissions: ['finance:view_variance'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['finance.budgeting.departmental_budgets', 'finance.revenue.revenue_tracking'] },
  { id: 'finance.budgeting.forecasting', path: '/dashboard/finance/budgeting/forecasting', roles: ['admin', 'executive'], permissions: ['finance:manage_forecasts'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['finance.budgeting.variance_analysis'] },
  { id: 'finance.procurement.purchase_requisitions', path: '/dashboard/finance/procurement/requisitions', roles: ['admin', 'staff'], permissions: ['finance:create_requisitions'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['finance.budgeting.departmental_budgets'] },
  { id: 'finance.procurement.purchase_orders', path: '/dashboard/finance/procurement/orders', roles: ['admin', 'staff'], permissions: ['finance:manage_orders'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['finance.procurement.purchase_requisitions'] },
  { id: 'finance.procurement.approval_workflows', path: '/dashboard/finance/procurement/approvals', roles: ['admin', 'executive'], permissions: ['finance:manage_approvals'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'finance.procurement.spend_analytics', path: '/dashboard/finance/procurement/analytics', roles: ['admin', 'executive'], permissions: ['finance:view_analytics'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['finance.procurement.purchase_orders'] },
  { id: 'finance.expense_management.expense_claims', path: '/dashboard/finance/expenses/claims', roles: ['admin', 'staff'], permissions: ['finance:submit_expenses'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['finance.procurement.approval_workflows'] },
  { id: 'finance.expense_management.corporate_cards', path: '/dashboard/finance/expenses/cards', roles: ['admin', 'executive'], permissions: ['finance:manage_cards'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'finance.expense_management.travel_booking', path: '/dashboard/finance/expenses/travel', roles: ['admin', 'staff'], permissions: ['finance:book_travel'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['finance.expense_management.expense_claims'] },
  { id: 'finance.expense_management.policy_enforcement', path: '/dashboard/finance/expenses/policy', roles: ['admin', 'executive'], permissions: ['finance:manage_policy'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'finance.billing.client_billing', path: '/dashboard/finance/billing/clients', roles: ['admin', 'staff'], permissions: ['finance:manage_billing'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['finance.revenue.invoicing'] },
  { id: 'finance.billing.rate_management', path: '/dashboard/finance/billing/rates', roles: ['admin', 'executive'], permissions: ['finance:manage_rates'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'finance.billing.retainer_tracking', path: '/dashboard/finance/billing/retainers', roles: ['admin', 'staff'], permissions: ['finance:manage_retainers'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['finance.billing.client_billing'] },
  { id: 'finance.billing.payment_gateway', path: '/dashboard/finance/billing/payments', roles: ['admin'], permissions: ['finance:manage_payments'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'inventory.equipment.equipment_register', path: '/dashboard/inventory/equipment/register', roles: ['admin', 'staff'], permissions: ['inventory:manage_equipment'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'inventory.equipment.check_in_out', path: '/dashboard/inventory/equipment/check-in-out', roles: ['admin', 'staff'], permissions: ['inventory:checkout_equipment'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['inventory.equipment.equipment_register'] },
  { id: 'inventory.equipment.maintenance_logs', path: '/dashboard/inventory/equipment/maintenance', roles: ['admin', 'staff'], permissions: ['inventory:manage_maintenance'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['inventory.equipment.equipment_register'] },
  { id: 'inventory.equipment.depreciation', path: '/dashboard/inventory/equipment/depreciation', roles: ['admin', 'executive'], permissions: ['inventory:view_depreciation'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.equipment.equipment_register', 'finance.budgeting.annual_budgets'] },
  { id: 'inventory.consumables.consumables_tracking', path: '/dashboard/inventory/consumables/tracking', roles: ['admin', 'staff'], permissions: ['inventory:manage_consumables'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'inventory.consumables.reorder_alerts', path: '/dashboard/inventory/consumables/reorder', roles: ['admin', 'staff'], permissions: ['inventory:manage_reorders'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.consumables.consumables_tracking'] },
  { id: 'inventory.consumables.vendor_management', path: '/dashboard/inventory/consumables/vendors', roles: ['admin', 'staff'], permissions: ['inventory:manage_vendors'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'inventory.consumables.cost_allocation', path: '/dashboard/inventory/consumables/cost-allocation', roles: ['admin'], permissions: ['inventory:allocate_costs'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.consumables.consumables_tracking', 'finance.budgeting.departmental_budgets'] },
  { id: 'inventory.props_wardrobe.props_inventory', path: '/dashboard/inventory/props-wardrobe/props', roles: ['admin', 'staff'], permissions: ['inventory:manage_props'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'inventory.props_wardrobe.wardrobe_tracking', path: '/dashboard/inventory/props-wardrobe/wardrobe', roles: ['admin', 'staff'], permissions: ['inventory:manage_wardrobe'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'inventory.props_wardrobe.condition_reports', path: '/dashboard/inventory/props-wardrobe/condition', roles: ['admin', 'staff'], permissions: ['inventory:report_condition'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.props_wardrobe.props_inventory', 'inventory.props_wardrobe.wardrobe_tracking'] },
  { id: 'inventory.props_wardrobe.storage_locations', path: '/dashboard/inventory/props-wardrobe/storage', roles: ['admin', 'staff'], permissions: ['inventory:manage_storage'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'inventory.digital_assets_register.dam', path: '/dashboard/inventory/digital-assets/dam', roles: ['admin', 'staff', 'client'], permissions: ['inventory:manage_digital_assets'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'inventory.digital_assets_register.file_storage', path: '/dashboard/inventory/digital-assets/storage', roles: ['admin'], permissions: ['inventory:manage_storage'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'inventory.digital_assets_register.version_control', path: '/dashboard/inventory/digital-assets/versions', roles: ['admin', 'staff'], permissions: ['inventory:manage_versions'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.digital_assets_register.dam'] },
  { id: 'inventory.digital_assets_register.rights_management', path: '/dashboard/inventory/digital-assets/rights', roles: ['admin', 'staff'], permissions: ['inventory:manage_rights'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.digital_assets_register.dam'] },
  { id: 'inventory.fleet.vehicle_management', path: '/dashboard/inventory/fleet/vehicles', roles: ['admin', 'staff'], permissions: ['inventory:manage_fleet'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'inventory.fleet.bookings', path: '/dashboard/inventory/fleet/bookings', roles: ['admin', 'staff'], permissions: ['inventory:book_vehicles'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.fleet.vehicle_management'] },
  { id: 'inventory.fleet.fuel_tracking', path: '/dashboard/inventory/fleet/fuel', roles: ['admin'], permissions: ['inventory:track_fuel'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['inventory.fleet.vehicle_management'] },
  { id: 'inventory.fleet.maintenance', path: '/dashboard/inventory/fleet/maintenance', roles: ['admin', 'staff'], permissions: ['inventory:manage_fleet_maintenance'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['inventory.fleet.vehicle_management'] },
  { id: 'vendors.vendor_directory.supplier_profiles', path: '/dashboard/vendors/directory/profiles', roles: ['admin', 'staff', 'executive'], permissions: ['vendors:read', 'vendors:write'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'vendors.vendor_directory.classifications', path: '/dashboard/vendors/directory/classifications', roles: ['admin', 'staff'], permissions: ['vendors:read', 'vendors:classify'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: ['vendors.vendor_directory.supplier_profiles'] },
  { id: 'vendors.vendor_directory.certifications', path: '/dashboard/vendors/directory/certifications', roles: ['admin', 'staff'], permissions: ['vendors:read', 'vendors:certifications'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['vendors.vendor_directory.supplier_profiles'] },
  { id: 'vendors.vendor_directory.insurance_tracking', path: '/dashboard/vendors/directory/insurance', roles: ['admin', 'staff', 'executive'], permissions: ['vendors:read', 'vendors:insurance'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['vendors.vendor_directory.supplier_profiles'] },
  { id: 'vendors.procurement_portal.rfq_management', path: '/dashboard/vendors/procurement/rfq', roles: ['admin', 'staff', 'executive'], permissions: ['procurement:read', 'procurement:create'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['vendors.vendor_directory.supplier_profiles'] },
  { id: 'vendors.procurement_portal.bid_evaluation', path: '/dashboard/vendors/procurement/bids', roles: ['admin', 'executive', 'staff'], permissions: ['procurement:read', 'procurement:evaluate'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['vendors.procurement_portal.rfq_management'] },
  { id: 'vendors.procurement_portal.award_tracking', path: '/dashboard/vendors/procurement/awards', roles: ['admin', 'staff', 'executive'], permissions: ['procurement:read', 'procurement:award'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: ['vendors.procurement_portal.bid_evaluation'] },
  { id: 'vendors.contracts.vendor_contracts', path: '/dashboard/vendors/contracts/manage', roles: ['admin', 'executive', 'staff'], permissions: ['contracts:read', 'contracts:write'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: ['vendors.procurement_portal.award_tracking'] },
  { id: 'vendors.contracts.sla_management', path: '/dashboard/vendors/contracts/slas', roles: ['admin', 'staff'], permissions: ['contracts:read', 'contracts:sla'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['vendors.contracts.vendor_contracts'] },
  { id: 'vendors.contracts.performance_reviews', path: '/dashboard/vendors/contracts/reviews', roles: ['admin', 'staff', 'executive'], permissions: ['contracts:read', 'contracts:review'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['vendors.contracts.sla_management'] },
  { id: 'vendors.contracts.renewal_management', path: '/dashboard/vendors/contracts/renewals', roles: ['admin', 'staff'], permissions: ['contracts:read', 'contracts:renew'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['vendors.contracts.vendor_contracts'] },
  { id: 'vendors.payments.invoice_processing', path: '/dashboard/vendors/payments/invoices', roles: ['admin', 'staff', 'executive'], permissions: ['payments:read', 'payments:process'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: ['vendors.contracts.vendor_contracts'] },
  { id: 'vendors.payments.payment_scheduling', path: '/dashboard/vendors/payments/schedule', roles: ['admin', 'executive'], permissions: ['payments:read', 'payments:schedule'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['vendors.payments.invoice_processing'] },
  { id: 'vendors.payments.reconciliation', path: '/dashboard/vendors/payments/reconciliation', roles: ['admin', 'staff'], permissions: ['payments:read', 'payments:reconcile'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['vendors.payments.payment_scheduling'] },
  { id: 'vendors.payments.dispute_management', path: '/dashboard/vendors/payments/disputes', roles: ['admin', 'staff', 'vendor'], permissions: ['payments:read', 'payments:dispute'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['vendors.payments.invoice_processing'] },
  { id: 'vendors.compliance.compliance_checks', path: '/dashboard/vendors/compliance/checks', roles: ['admin', 'staff'], permissions: ['compliance:read', 'compliance:verify'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['vendors.vendor_directory.supplier_profiles'] },
  { id: 'vendors.compliance.insurance_verification', path: '/dashboard/vendors/compliance/insurance', roles: ['admin', 'staff'], permissions: ['compliance:read', 'compliance:insurance'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['vendors.vendor_directory.insurance_tracking'] },
  { id: 'vendors.compliance.worksafe_requirements', path: '/dashboard/vendors/compliance/worksafe', roles: ['admin', 'staff', 'government'], permissions: ['compliance:read', 'compliance:worksafe'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: ['vendors.compliance.compliance_checks'] },
  { id: 'vendors.compliance.modern_slavery', path: '/dashboard/vendors/compliance/modern-slavery', roles: ['admin', 'executive', 'government'], permissions: ['compliance:read', 'compliance:modern_slavery'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['vendors.compliance.compliance_checks'] },
  { id: 'campus_ops.building_management.bms_integration', path: '/dashboard/operations/building/bms', roles: ['admin', 'staff'], permissions: ['building:read', 'building:control'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: [] },
  { id: 'campus_ops.building_management.hvac_control', path: '/dashboard/operations/building/hvac', roles: ['admin', 'staff'], permissions: ['building:read', 'building:hvac'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['campus_ops.building_management.bms_integration'] },
  { id: 'campus_ops.building_management.lighting', path: '/dashboard/operations/building/lighting', roles: ['admin', 'staff'], permissions: ['building:read', 'building:lighting'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['campus_ops.building_management.bms_integration'] },
  { id: 'campus_ops.building_management.energy_monitoring', path: '/dashboard/operations/building/energy', roles: ['admin', 'staff', 'executive'], permissions: ['building:read', 'building:energy'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['campus_ops.building_management.bms_integration'] },
  { id: 'campus_ops.security.cctv', path: '/dashboard/operations/security/cctv', roles: ['admin', 'staff'], permissions: ['security:read', 'security:cctv'], status: 'planned', phase: 'design_construct', priority: 'p1', dependencies: [] },
  { id: 'campus_ops.security.access_logs', path: '/dashboard/operations/security/access-logs', roles: ['admin', 'staff', 'executive'], permissions: ['security:read', 'security:access'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'campus_ops.security.visitor_management', path: '/dashboard/operations/security/visitors', roles: ['admin', 'staff', 'client', 'guest'], permissions: ['security:read', 'security:visitors'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'campus_ops.security.incident_response', path: '/dashboard/operations/security/incidents', roles: ['admin', 'staff', 'executive'], permissions: ['security:read', 'security:incidents'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'campus_ops.catering.restaurant_management', path: '/dashboard/operations/catering/restaurant', roles: ['admin', 'staff'], permissions: ['catering:read', 'catering:manage'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'campus_ops.catering.catering_orders', path: '/dashboard/operations/catering/orders', roles: ['admin', 'staff', 'client'], permissions: ['catering:read', 'catering:order'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'campus_ops.catering.menu_planning', path: '/dashboard/operations/catering/menus', roles: ['admin', 'staff'], permissions: ['catering:read', 'catering:menus'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['campus_ops.catering.restaurant_management'] },
  { id: 'campus_ops.cleaning.schedules', path: '/dashboard/operations/cleaning/schedules', roles: ['admin', 'staff'], permissions: ['cleaning:read', 'cleaning:schedule'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'campus_ops.cleaning.service_quality', path: '/dashboard/operations/cleaning/quality', roles: ['admin', 'staff'], permissions: ['cleaning:read', 'cleaning:audit'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['campus_ops.cleaning.schedules'] },
  { id: 'campus_ops.cleaning.contractor_management', path: '/dashboard/operations/cleaning/contractors', roles: ['admin', 'staff', 'vendor'], permissions: ['cleaning:read', 'cleaning:contractors'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['vendors.vendor_directory.supplier_profiles'] },
  { id: 'campus_ops.transport.shuttle_service', path: '/dashboard/operations/transport/shuttle', roles: ['admin', 'staff', 'client', 'guest'], permissions: ['transport:read', 'transport:shuttle'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'campus_ops.transport.parking', path: '/dashboard/operations/transport/parking', roles: ['admin', 'staff', 'client', 'guest'], permissions: ['transport:read', 'transport:parking'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'campus_ops.transport.loading_dock', path: '/dashboard/operations/transport/loading-dock', roles: ['admin', 'staff', 'vendor'], permissions: ['transport:read', 'transport:dock'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'campus_ops.waste.waste_management', path: '/dashboard/operations/waste/manage', roles: ['admin', 'staff'], permissions: ['waste:read', 'waste:manage'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'campus_ops.waste.recycling_tracking', path: '/dashboard/operations/waste/recycling', roles: ['admin', 'staff', 'executive'], permissions: ['waste:read', 'waste:recycling'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['campus_ops.waste.waste_management'] },
  { id: 'campus_ops.waste.sustainability_metrics', path: '/dashboard/operations/waste/sustainability', roles: ['admin', 'staff', 'executive', 'government'], permissions: ['waste:read', 'waste:sustainability'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['campus_ops.waste.recycling_tracking'] },
  { id: 'campus_ops.waste.compliance_reporting', path: '/dashboard/operations/waste/compliance', roles: ['admin', 'executive', 'government'], permissions: ['waste:read', 'waste:compliance'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['campus_ops.waste.waste_management'] },
  { id: 'global_network.campuses.campus_registry', path: '/dashboard/global/campuses/registry', roles: ['admin', 'executive', 'investor'], permissions: ['global:read', 'global:campuses'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'global_network.campuses.status_dashboard', path: '/dashboard/global/campuses/status', roles: ['admin', 'executive'], permissions: ['global:read', 'global:status'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['global_network.campuses.campus_registry'] },
  { id: 'global_network.campuses.comparison_metrics', path: '/dashboard/global/campuses/compare', roles: ['admin', 'executive', 'investor'], permissions: ['global:read', 'global:compare'], status: 'planned', phase: 'expansion', priority: 'p2', dependencies: ['global_network.campuses.status_dashboard'] },
  { id: 'global_network.campuses.expansion_roadmap', path: '/dashboard/global/campuses/roadmap', roles: ['admin', 'executive', 'investor'], permissions: ['global:read', 'global:roadmap'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: ['global_network.campuses.campus_registry'] },
  { id: 'global_network.campuses.site_selection', path: '/dashboard/global/campuses/site-selection', roles: ['admin', 'executive'], permissions: ['global:read', 'global:site_selection'], status: 'planned', phase: 'site_acquisition', priority: 'p1', dependencies: [] },
  { id: 'global_network.interconnect.cross_campus_booking', path: '/dashboard/global/interconnect/booking', roles: ['admin', 'staff', 'client'], permissions: ['global:read', 'global:booking'], status: 'planned', phase: 'expansion', priority: 'p2', dependencies: ['global_network.campuses.campus_registry'] },
  { id: 'global_network.interconnect.resource_sharing', path: '/dashboard/global/interconnect/resources', roles: ['admin', 'staff', 'executive'], permissions: ['global:read', 'global:resources'], status: 'planned', phase: 'expansion', priority: 'p2', dependencies: ['global_network.interconnect.cross_campus_booking'] },
  { id: 'global_network.interconnect.production_transfer', path: '/dashboard/global/interconnect/transfer', roles: ['admin', 'executive', 'client'], permissions: ['global:read', 'global:transfer'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: ['global_network.interconnect.resource_sharing'] },
  { id: 'global_network.interconnect.unified_calendar', path: '/dashboard/global/interconnect/calendar', roles: ['admin', 'staff', 'executive', 'client'], permissions: ['global:read', 'global:calendar'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['global_network.campuses.campus_registry'] },
  { id: 'global_network.standards.brand_standards', path: '/dashboard/global/standards/brand', roles: ['admin', 'executive'], permissions: ['global:read', 'global:standards'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'global_network.standards.service_level_frameworks', path: '/dashboard/global/standards/sla', roles: ['admin', 'executive'], permissions: ['global:read', 'global:sla_framework'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'global_network.standards.quality_benchmarks', path: '/dashboard/global/standards/quality', roles: ['admin', 'executive', 'staff'], permissions: ['global:read', 'global:quality'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['global_network.standards.service_level_frameworks'] },
  { id: 'global_network.cross_border.multi_jurisdiction', path: '/dashboard/global/cross-border/compliance', roles: ['admin', 'executive', 'government'], permissions: ['global:read', 'global:compliance'], status: 'planned', phase: 'expansion', priority: 'p1', dependencies: ['global_network.campuses.campus_registry'] },
  { id: 'global_network.cross_border.currency_management', path: '/dashboard/global/cross-border/currency', roles: ['admin', 'executive'], permissions: ['global:read', 'global:currency'], status: 'planned', phase: 'expansion', priority: 'p1', dependencies: [] },
  { id: 'global_network.cross_border.timezone_coordination', path: '/dashboard/global/cross-border/timezones', roles: ['admin', 'staff', 'executive', 'client'], permissions: ['global:read', 'global:timezones'], status: 'planned', phase: 'expansion', priority: 'p2', dependencies: ['global_network.interconnect.unified_calendar'] },
  { id: 'global_network.cross_border.cross_border_taxation', path: '/dashboard/global/cross-border/tax', roles: ['admin', 'executive'], permissions: ['global:read', 'global:taxation'], status: 'planned', phase: 'expansion', priority: 'p1', dependencies: ['global_network.cross_border.multi_jurisdiction'] },
  { id: 'communications.internal.staff_announcements', path: '/dashboard/comms/internal/announcements', roles: ['admin', 'executive', 'staff'], permissions: ['comms:read', 'comms:announce'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'communications.internal.newsletter', path: '/dashboard/comms/internal/newsletter', roles: ['admin', 'staff'], permissions: ['comms:read', 'comms:newsletter'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'communications.internal.intranet', path: '/dashboard/comms/internal/intranet', roles: ['admin', 'staff', 'executive'], permissions: ['comms:read', 'comms:intranet'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'communications.internal.policy_distribution', path: '/dashboard/comms/internal/policies', roles: ['admin', 'executive'], permissions: ['comms:read', 'comms:policies'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'communications.external.website_cms', path: '/dashboard/comms/external/cms', roles: ['admin', 'staff'], permissions: ['comms:read', 'comms:cms'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'communications.external.social_media', path: '/dashboard/comms/external/social', roles: ['admin', 'staff'], permissions: ['comms:read', 'comms:social'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'communications.external.press_releases', path: '/dashboard/comms/external/press', roles: ['admin', 'executive'], permissions: ['comms:read', 'comms:press'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: [] },
  { id: 'communications.external.media_kit', path: '/dashboard/comms/external/media-kit', roles: ['admin', 'staff', 'guest'], permissions: ['comms:read', 'comms:media_kit'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: [] },
  { id: 'communications.brand.brand_guidelines', path: '/dashboard/comms/brand/guidelines', roles: ['admin', 'staff', 'partner', 'vendor'], permissions: ['comms:read', 'comms:brand'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'communications.brand.asset_library', path: '/dashboard/comms/brand/assets', roles: ['admin', 'staff', 'partner', 'vendor'], permissions: ['comms:read', 'comms:assets'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'communications.brand.template_management', path: '/dashboard/comms/brand/templates', roles: ['admin', 'staff'], permissions: ['comms:read', 'comms:templates'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: ['communications.brand.brand_guidelines'] },
  { id: 'communications.notifications.notification_center', path: '/dashboard/comms/notifications/center', roles: ['admin', 'staff', 'executive', 'client', 'vendor', 'investor'], permissions: ['notifications:read'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: [] },
  { id: 'communications.notifications.alert_management', path: '/dashboard/comms/notifications/alerts', roles: ['admin'], permissions: ['notifications:read', 'notifications:configure'], status: 'planned', phase: 'pre_operations', priority: 'p1', dependencies: ['communications.notifications.notification_center'] },
  { id: 'communications.notifications.escalation_rules', path: '/dashboard/comms/notifications/escalation', roles: ['admin'], permissions: ['notifications:read', 'notifications:escalation'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['communications.notifications.alert_management'] },
  { id: 'communications.notifications.communication_preferences', path: '/dashboard/comms/notifications/preferences', roles: ['admin', 'staff', 'executive', 'client', 'vendor', 'investor'], permissions: ['notifications:read', 'notifications:preferences'], status: 'planned', phase: 'pre_operations', priority: 'p2', dependencies: ['communications.notifications.notification_center'] },
  { id: 'analytics.dashboards.custom_builder', path: '/dashboard/analytics/dashboards/builder', roles: ['admin', 'executive', 'staff'], permissions: ['analytics:read', 'analytics:dashboards'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'analytics.dashboards.kpi_configuration', path: '/dashboard/analytics/dashboards/kpis', roles: ['admin', 'executive'], permissions: ['analytics:read', 'analytics:kpi'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'analytics.dashboards.data_visualization', path: '/dashboard/analytics/dashboards/visualize', roles: ['admin', 'executive', 'staff'], permissions: ['analytics:read', 'analytics:visualize'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'analytics.dashboards.saved_views', path: '/dashboard/analytics/dashboards/views', roles: ['admin', 'executive', 'staff'], permissions: ['analytics:read', 'analytics:views'], status: 'planned', phase: 'operations', priority: 'p3', dependencies: ['analytics.dashboards.custom_builder'] },
  { id: 'analytics.reports.report_templates', path: '/dashboard/analytics/reports/templates', roles: ['admin', 'executive', 'staff'], permissions: ['analytics:read', 'analytics:reports'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'analytics.reports.scheduled_reports', path: '/dashboard/analytics/reports/scheduled', roles: ['admin', 'executive'], permissions: ['analytics:read', 'analytics:schedule'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['analytics.reports.report_templates'] },
  { id: 'analytics.reports.ad_hoc_queries', path: '/dashboard/analytics/reports/adhoc', roles: ['admin', 'executive', 'staff'], permissions: ['analytics:read', 'analytics:query'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'analytics.reports.export_management', path: '/dashboard/analytics/reports/export', roles: ['admin', 'executive', 'staff'], permissions: ['analytics:read', 'analytics:export'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['analytics.reports.report_templates'] },
  { id: 'analytics.business_intelligence.trend_analysis', path: '/dashboard/analytics/bi/trends', roles: ['admin', 'executive'], permissions: ['analytics:read', 'analytics:bi'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'analytics.business_intelligence.predictive_analytics', path: '/dashboard/analytics/bi/predictive', roles: ['admin', 'executive'], permissions: ['analytics:read', 'analytics:predictive'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: ['analytics.business_intelligence.trend_analysis'] },
  { id: 'analytics.business_intelligence.benchmark_comparison', path: '/dashboard/analytics/bi/benchmarks', roles: ['admin', 'executive'], permissions: ['analytics:read', 'analytics:benchmarks'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'analytics.business_intelligence.what_if_modeling', path: '/dashboard/analytics/bi/scenarios', roles: ['admin', 'executive', 'investor'], permissions: ['analytics:read', 'analytics:modeling'], status: 'planned', phase: 'expansion', priority: 'p3', dependencies: ['analytics.business_intelligence.trend_analysis'] },
  { id: 'analytics.operational_metrics.facility_utilization', path: '/dashboard/analytics/operations/utilization', roles: ['admin', 'executive', 'staff'], permissions: ['analytics:read', 'analytics:utilization'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'analytics.operational_metrics.production_throughput', path: '/dashboard/analytics/operations/throughput', roles: ['admin', 'executive'], permissions: ['analytics:read', 'analytics:throughput'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'analytics.operational_metrics.revenue_per_sqm', path: '/dashboard/analytics/operations/revenue-sqm', roles: ['admin', 'executive', 'investor'], permissions: ['analytics:read', 'analytics:revenue'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['analytics.operational_metrics.facility_utilization'] },
  { id: 'analytics.sustainability_metrics.energy_consumption', path: '/dashboard/analytics/sustainability/energy', roles: ['admin', 'executive', 'staff', 'government'], permissions: ['analytics:read', 'analytics:energy'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['campus_ops.building_management.energy_monitoring'] },
  { id: 'analytics.sustainability_metrics.carbon_footprint', path: '/dashboard/analytics/sustainability/carbon', roles: ['admin', 'executive', 'government', 'investor'], permissions: ['analytics:read', 'analytics:carbon'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['analytics.sustainability_metrics.energy_consumption'] },
  { id: 'analytics.sustainability_metrics.waste_diversion', path: '/dashboard/analytics/sustainability/waste', roles: ['admin', 'executive', 'staff', 'government'], permissions: ['analytics:read', 'analytics:waste'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['campus_ops.waste.recycling_tracking'] },
  { id: 'analytics.sustainability_metrics.water_usage', path: '/dashboard/analytics/sustainability/water', roles: ['admin', 'executive', 'staff', 'government'], permissions: ['analytics:read', 'analytics:water'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'analytics.sustainability_metrics.green_certification', path: '/dashboard/analytics/sustainability/certification', roles: ['admin', 'executive', 'government'], permissions: ['analytics:read', 'analytics:certification'], status: 'planned', phase: 'design_construct', priority: 'p2', dependencies: [] },
  { id: 'investor_relations.portfolio.investment_overview', path: '/dashboard/investors/portfolio/overview', roles: ['admin', 'executive', 'investor'], permissions: ['investors:read', 'investors:portfolio'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'investor_relations.portfolio.return_tracking', path: '/dashboard/investors/portfolio/returns', roles: ['admin', 'executive', 'investor'], permissions: ['investors:read', 'investors:returns'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['investor_relations.portfolio.investment_overview'] },
  { id: 'investor_relations.portfolio.valuation_updates', path: '/dashboard/investors/portfolio/valuations', roles: ['admin', 'executive', 'investor'], permissions: ['investors:read', 'investors:valuations'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['investor_relations.portfolio.investment_overview'] },
  { id: 'investor_relations.portfolio.distribution_history', path: '/dashboard/investors/portfolio/distributions', roles: ['admin', 'executive', 'investor'], permissions: ['investors:read', 'investors:distributions'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['investor_relations.distributions.distribution_calculations'] },
  { id: 'investor_relations.reporting.quarterly_reports', path: '/dashboard/investors/reporting/quarterly', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:reporting'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'investor_relations.reporting.annual_reports', path: '/dashboard/investors/reporting/annual', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:annual'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: [] },
  { id: 'investor_relations.reporting.investor_updates', path: '/dashboard/investors/reporting/updates', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:updates'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'investor_relations.reporting.agm_materials', path: '/dashboard/investors/reporting/agm', roles: ['admin', 'executive', 'investor'], permissions: ['investors:read', 'investors:agm'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: [] },
  { id: 'investor_relations.cap_table.cap_table_management', path: '/dashboard/investors/cap-table/manage', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:cap_table'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'investor_relations.cap_table.share_registry', path: '/dashboard/investors/cap-table/registry', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:registry'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['investor_relations.cap_table.cap_table_management'] },
  { id: 'investor_relations.cap_table.option_pool', path: '/dashboard/investors/cap-table/options', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:options'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['investor_relations.cap_table.cap_table_management'] },
  { id: 'investor_relations.cap_table.convertible_notes', path: '/dashboard/investors/cap-table/convertibles', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:convertibles'], status: 'planned', phase: 'company_formation', priority: 'p2', dependencies: ['investor_relations.cap_table.cap_table_management'] },
  { id: 'investor_relations.fundraising.fundraising_rounds', path: '/dashboard/investors/fundraising/rounds', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:fundraising'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'investor_relations.fundraising.investor_pipeline', path: '/dashboard/investors/fundraising/pipeline', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:pipeline'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'investor_relations.fundraising.term_sheets', path: '/dashboard/investors/fundraising/terms', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:terms'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['investor_relations.fundraising.fundraising_rounds'] },
  { id: 'investor_relations.fundraising.due_diligence', path: '/dashboard/investors/fundraising/due-diligence', roles: ['admin', 'executive', 'investor'], permissions: ['investors:read', 'investors:due_diligence'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['investor_relations.fundraising.fundraising_rounds'] },
  { id: 'investor_relations.fundraising.investor_portal', path: '/dashboard/investors/fundraising/portal', roles: ['investor'], permissions: ['investors:read', 'investors:portal'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['investor_relations.portfolio.investment_overview'] },
  { id: 'investor_relations.distributions.distribution_calculations', path: '/dashboard/investors/distributions/calculate', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:distribute'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['investor_relations.cap_table.cap_table_management'] },
  { id: 'investor_relations.distributions.payment_processing', path: '/dashboard/investors/distributions/payments', roles: ['admin', 'executive'], permissions: ['investors:read', 'investors:payments'], status: 'planned', phase: 'operations', priority: 'p1', dependencies: ['investor_relations.distributions.distribution_calculations'] },
  { id: 'investor_relations.distributions.tax_statements', path: '/dashboard/investors/distributions/tax', roles: ['admin', 'executive', 'investor'], permissions: ['investors:read', 'investors:tax'], status: 'planned', phase: 'operations', priority: 'p2', dependencies: ['investor_relations.distributions.distribution_calculations'] },
  { id: 'administration.users.user_management', path: '/dashboard/admin/users/manage', roles: ['admin'], permissions: ['admin:read', 'admin:users'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.users.role_assignment', path: '/dashboard/admin/users/roles', roles: ['admin'], permissions: ['admin:read', 'admin:roles'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.users.user_management'] },
  { id: 'administration.users.permission_management', path: '/dashboard/admin/users/permissions', roles: ['admin'], permissions: ['admin:read', 'admin:permissions'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.users.role_assignment'] },
  { id: 'administration.users.sso_configuration', path: '/dashboard/admin/users/sso', roles: ['admin'], permissions: ['admin:read', 'admin:sso'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.users.user_management'] },
  { id: 'administration.audit.audit_logs', path: '/dashboard/admin/audit/logs', roles: ['admin'], permissions: ['admin:read', 'admin:audit'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.audit.access_reports', path: '/dashboard/admin/audit/access', roles: ['admin'], permissions: ['admin:read', 'admin:access_reports'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.audit.audit_logs'] },
  { id: 'administration.audit.compliance_monitoring', path: '/dashboard/admin/audit/compliance', roles: ['admin'], permissions: ['admin:read', 'admin:compliance'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.audit.audit_logs'] },
  { id: 'administration.audit.data_retention', path: '/dashboard/admin/audit/retention', roles: ['admin'], permissions: ['admin:read', 'admin:retention'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.integrations.api_management', path: '/dashboard/admin/integrations/api', roles: ['admin'], permissions: ['admin:read', 'admin:api'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.integrations.webhook_configuration', path: '/dashboard/admin/integrations/webhooks', roles: ['admin'], permissions: ['admin:read', 'admin:webhooks'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.integrations.third_party', path: '/dashboard/admin/integrations/third-party', roles: ['admin'], permissions: ['admin:read', 'admin:integrations'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.integrations.api_management'] },
  { id: 'administration.integrations.data_sync', path: '/dashboard/admin/integrations/sync', roles: ['admin'], permissions: ['admin:read', 'admin:sync'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.integrations.third_party'] },
  { id: 'administration.settings.system_configuration', path: '/dashboard/admin/settings/system', roles: ['admin'], permissions: ['admin:read', 'admin:settings'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.settings.feature_flags', path: '/dashboard/admin/settings/features', roles: ['admin'], permissions: ['admin:read', 'admin:features'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.settings.locale_management', path: '/dashboard/admin/settings/locales', roles: ['admin'], permissions: ['admin:read', 'admin:locales'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.settings.notification_templates', path: '/dashboard/admin/settings/notifications', roles: ['admin'], permissions: ['admin:read', 'admin:notification_templates'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.settings.branding', path: '/dashboard/admin/settings/branding', roles: ['admin'], permissions: ['admin:read', 'admin:branding'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.security.security_policies', path: '/dashboard/admin/security/policies', roles: ['admin'], permissions: ['admin:read', 'admin:security'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.security.mfa_management', path: '/dashboard/admin/security/mfa', roles: ['admin'], permissions: ['admin:read', 'admin:mfa'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: ['administration.security.security_policies'] },
  { id: 'administration.security.session_management', path: '/dashboard/admin/security/sessions', roles: ['admin'], permissions: ['admin:read', 'admin:sessions'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
  { id: 'administration.security.ip_allowlisting', path: '/dashboard/admin/security/ip-allowlist', roles: ['admin'], permissions: ['admin:read', 'admin:ip_allowlist'], status: 'planned', phase: 'company_formation', priority: 'p1', dependencies: [] },
];