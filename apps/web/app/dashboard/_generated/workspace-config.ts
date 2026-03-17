// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.
// @generated

export type CanvasType =
  | 'table'
  | 'board'
  | 'calendar'
  | 'timeline'
  | 'catalog'
  | 'documents'
  | 'charts'
  | 'communications'
  ;

export type WorkspaceId =
  | 'productions'
  | 'facilities'
  | 'finance'
  | 'people'
  | 'campus'
  | 'events'
  | 'education'
  | 'analytics'
  | 'investor-relations'
  | 'partnerships'
  | 'administration'
  ;

export interface WorkspaceTab {
  id: string;
  label: string;
  canvas: CanvasType;
  featureIds: string[];
  wireframeType?: string;
}

export interface WorkspaceConfig {
  id: WorkspaceId;
  label: string;
  icon: string;
  description: string;
  defaultCanvas: CanvasType;
  aiEnabled: boolean;
  tabs: WorkspaceTab[];
  roles: string[];
}

export const WORKSPACE_CONFIG: WorkspaceConfig[] = [
  {
    id: 'productions',
    label: 'Productions',
    icon: 'film',
    description: 'Film, TV, and broadcast production lifecycle',
    defaultCanvas: 'board',
    aiEnabled: true,
    tabs: [
      { id: 'overview', label: 'Overview', canvas: 'board', featureIds: ['productions.active.board', 'productions.active.timeline', 'productions.active.call_sheets', 'productions.active.daily_reports'] },
      { id: 'pre-production', label: 'Pre-Production', canvas: 'board', featureIds: ['productions.pre_production.script_breakdown', 'productions.pre_production.storyboarding', 'productions.pre_production.casting', 'productions.pre_production.location_scouting', 'productions.pre_production.budget_estimation'] },
      { id: 'shooting', label: 'Shooting', canvas: 'calendar', featureIds: ['productions.production.shooting_schedules', 'productions.production.crew_assignments', 'productions.production.daily_logs', 'productions.production.rushes_review'], wireframeType: 'calendar' },
      { id: 'post-production', label: 'Post-Production', canvas: 'timeline', featureIds: ['productions.post_production.editing', 'productions.post_production.color_grading', 'productions.post_production.vfx', 'productions.post_production.sound_mix', 'productions.post_production.deliverables'], wireframeType: 'timeline' },
      { id: 'deliverables', label: 'Deliverables', canvas: 'table', featureIds: ['workflow.deliverables.deliverable_specs', 'workflow.deliverables.format_management', 'workflow.deliverables.qc_checklists', 'workflow.deliverables.distribution'], wireframeType: 'table' },
      { id: 'workflow', label: 'Workflow', canvas: 'board', featureIds: ['workflow.pipeline.asset_pipeline', 'workflow.pipeline.workflow_templates', 'workflow.pipeline.stage_gates', 'workflow.pipeline.handoff_tracking', 'workflow.review_approval.dailies_review', 'workflow.review_approval.client_review', 'workflow.review_approval.approval_chains', 'workflow.review_approval.annotation_tools', 'workflow.automation.automation_rules', 'workflow.automation.triggers', 'workflow.automation.notifications', 'workflow.automation.escalation_policies'], wireframeType: 'board' },
      { id: 'finance', label: 'Production Finance', canvas: 'table', featureIds: ['productions.finance.budgets', 'productions.finance.cost_reports', 'productions.finance.purchase_orders', 'productions.finance.petty_cash', 'productions.finance.completion_guarantor'] },
      { id: 'talent', label: 'Talent & Crew', canvas: 'table', featureIds: ['talent_crew.crew_database.crew_profiles', 'talent_crew.crew_database.skills_certifications', 'talent_crew.crew_database.availability', 'talent_crew.crew_database.rate_cards', 'talent_crew.casting.casting_calls', 'talent_crew.casting.audition_scheduling', 'talent_crew.casting.talent_management', 'talent_crew.casting.talent_agreements', 'talent_crew.crew_scheduling.call_sheets', 'talent_crew.crew_scheduling.department_scheduling', 'talent_crew.crew_scheduling.overtime_tracking', 'talent_crew.crew_scheduling.meal_breaks', 'talent_crew.safety_compliance.safety_inductions', 'talent_crew.safety_compliance.incident_reporting', 'talent_crew.safety_compliance.first_aid', 'talent_crew.safety_compliance.ppe_tracking', 'talent_crew.safety_compliance.health_protocols'] },
    ],
    roles: ['admin', 'executive', 'staff', 'client'],
  },
  {
    id: 'facilities',
    label: 'Facilities',
    icon: 'building',
    description: 'Sound stages, LED volumes, control rooms, and equipment',
    defaultCanvas: 'calendar',
    aiEnabled: true,
    tabs: [
      { id: 'calendar', label: 'Calendar', canvas: 'calendar', featureIds: ['facilities.sound_stages.calendar', 'facilities.sound_stages.booking', 'facilities.rooms.room_booking'] },
      { id: 'sound-stages', label: 'Sound Stages', canvas: 'table', featureIds: ['facilities.sound_stages.pricing', 'facilities.sound_stages.configuration'] },
      { id: 'led-volumes', label: 'LED Volumes', canvas: 'table', featureIds: ['virtual_production.led_volume.configuration', 'virtual_production.led_volume.content_management', 'virtual_production.led_volume.calibration', 'virtual_production.led_volume.show_files', 'virtual_production.previs.previsualization', 'virtual_production.previs.techvis', 'virtual_production.previs.postvis', 'virtual_production.previs.virtual_camera', 'virtual_production.motion_capture.scheduling', 'virtual_production.motion_capture.performers', 'virtual_production.motion_capture.data_processing', 'virtual_production.motion_capture.cleanup', 'virtual_production.realtime_rendering.unreal_projects', 'virtual_production.realtime_rendering.asset_library', 'virtual_production.realtime_rendering.scene_management', 'virtual_production.realtime_rendering.performance', 'virtual_production.digital_assets.library', 'virtual_production.digital_assets.scan_processing', 'virtual_production.digital_assets.digital_twins', 'virtual_production.digital_assets.versioning'] },
      { id: 'control-rooms', label: 'Control Rooms', canvas: 'table', featureIds: ['broadcast.control_room.booking', 'broadcast.control_room.technical_setup', 'broadcast.control_room.signal_routing', 'broadcast.control_room.redundancy'] },
      { id: 'broadcast-theatre', label: 'Broadcast Theatre', canvas: 'table', featureIds: ['facilities.broadcast.theatre_booking', 'facilities.broadcast.control_room_scheduling', 'facilities.broadcast.presets', 'broadcast.live_production.rundown', 'broadcast.live_production.cue_sheets', 'broadcast.live_production.switching', 'broadcast.live_production.graphics', 'broadcast.transmission.uplink', 'broadcast.transmission.cdn', 'broadcast.transmission.multi_platform', 'broadcast.transmission.latency_monitoring', 'broadcast.planning.schedule', 'broadcast.planning.rehearsals', 'broadcast.planning.technical_requirements', 'broadcast.planning.risk_assessment'] },
      { id: 'equipment', label: 'Equipment', canvas: 'table', featureIds: ['inventory.equipment.equipment_register', 'inventory.equipment.check_in_out', 'inventory.equipment.maintenance_logs', 'inventory.equipment.depreciation', 'inventory.consumables.consumables_tracking', 'inventory.consumables.reorder_alerts', 'inventory.consumables.vendor_management', 'inventory.consumables.cost_allocation', 'inventory.props_wardrobe.props_inventory', 'inventory.props_wardrobe.wardrobe_tracking', 'inventory.props_wardrobe.condition_reports', 'inventory.props_wardrobe.storage_locations', 'inventory.digital_assets_register.dam', 'inventory.digital_assets_register.file_storage', 'inventory.digital_assets_register.version_control', 'inventory.digital_assets_register.rights_management', 'inventory.fleet.vehicle_management', 'inventory.fleet.bookings', 'inventory.fleet.fuel_tracking', 'inventory.fleet.maintenance'] },
      { id: 'workshops', label: 'Workshops', canvas: 'table', featureIds: ['facilities.workshops.set_construction', 'facilities.workshops.props', 'facilities.workshops.costume', 'facilities.workshops.paint_shop'] },
      { id: 'recording-studios', label: 'Recording Studios', canvas: 'table', featureIds: ['facilities.recording_studios.booking', 'facilities.recording_studios.session_management', 'facilities.recording_studios.equipment', 'audio_music.recording.session_booking', 'audio_music.recording.engineer_assignment', 'audio_music.recording.track_management', 'audio_music.recording.mix_versions', 'audio_music.sound_design.sfx_library', 'audio_music.sound_design.foley_scheduling', 'audio_music.sound_design.adr_booking', 'audio_music.sound_design.atmos_mixing', 'audio_music.music_production.score_composition', 'audio_music.music_production.music_licensing', 'audio_music.music_production.library_management', 'audio_music.mastering.mastering_sessions', 'audio_music.mastering.deliverable_formats', 'audio_music.mastering.quality_control'] },
      { id: 'support-spaces', label: 'Support Spaces', canvas: 'table', featureIds: ['facilities.support_spaces.dressing_rooms', 'facilities.support_spaces.green_rooms', 'facilities.support_spaces.catering', 'facilities.support_spaces.parking', 'facilities.support_spaces.storage'] },
      { id: 'maintenance', label: 'Maintenance', canvas: 'table', featureIds: ['facilities.maintenance.preventive', 'facilities.maintenance.work_orders', 'facilities.maintenance.asset_lifecycle', 'facilities.maintenance.vendor_scheduling'] },
    ],
    roles: ['admin', 'executive', 'staff', 'client', 'vendor'],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'dollar-sign',
    description: 'Invoicing, budgets, cash flow, and distributions',
    defaultCanvas: 'table',
    aiEnabled: false,
    tabs: [
      { id: 'overview', label: 'Overview', canvas: 'charts', featureIds: ['company_ops.finance.accounts', 'company_ops.finance.cashflow', 'company_ops.finance.reporting', 'company_ops.finance.tax'] },
      { id: 'invoices', label: 'Invoices', canvas: 'table', featureIds: ['finance.revenue.revenue_tracking', 'finance.revenue.invoicing', 'finance.revenue.collections', 'finance.revenue.revenue_recognition'] },
      { id: 'budgets', label: 'Budgets', canvas: 'table', featureIds: ['finance.budgeting.annual_budgets', 'finance.budgeting.departmental_budgets', 'finance.budgeting.variance_analysis', 'finance.budgeting.forecasting'] },
      { id: 'cash-flow', label: 'Cash Flow', canvas: 'charts', featureIds: ['finance.procurement.purchase_requisitions', 'finance.procurement.purchase_orders', 'finance.procurement.approval_workflows', 'finance.procurement.spend_analytics'] },
      { id: 'expenses', label: 'Expenses', canvas: 'table', featureIds: ['finance.expense_management.expense_claims', 'finance.expense_management.corporate_cards', 'finance.expense_management.travel_booking', 'finance.expense_management.policy_enforcement'] },
      { id: 'billing', label: 'Billing', canvas: 'table', featureIds: ['finance.billing.client_billing', 'finance.billing.rate_management', 'finance.billing.retainer_tracking', 'finance.billing.payment_gateway'] },
      { id: 'vendor-payments', label: 'Vendor Payments', canvas: 'table', featureIds: ['vendors.vendor_directory.supplier_profiles', 'vendors.vendor_directory.classifications', 'vendors.vendor_directory.certifications', 'vendors.vendor_directory.insurance_tracking', 'vendors.procurement_portal.rfq_management', 'vendors.procurement_portal.bid_evaluation', 'vendors.procurement_portal.award_tracking', 'vendors.contracts.vendor_contracts', 'vendors.contracts.sla_management', 'vendors.contracts.performance_reviews', 'vendors.contracts.renewal_management', 'vendors.payments.invoice_processing', 'vendors.payments.payment_scheduling', 'vendors.payments.reconciliation', 'vendors.payments.dispute_management', 'vendors.compliance.compliance_checks', 'vendors.compliance.insurance_verification', 'vendors.compliance.worksafe_requirements', 'vendors.compliance.modern_slavery'] },
      { id: 'capital', label: 'Capital', canvas: 'table', featureIds: ['company_ops.capital.cap_table', 'company_ops.capital.fundraising', 'company_ops.capital.shareholder_registry', 'company_ops.capital.sovereign_funds', 'company_ops.capital.investment_docs', 'company_ops.capital.scenario_modelling'] },
      { id: 'insurance', label: 'Insurance', canvas: 'table', featureIds: ['company_ops.insurance.portfolio', 'company_ops.insurance.risk_register', 'company_ops.insurance.bcp', 'company_ops.insurance.claims'] },
    ],
    roles: ['admin', 'executive', 'client', 'investor', 'vendor'],
  },
  {
    id: 'people',
    label: 'People',
    icon: 'users',
    description: 'Staff directory, leave management, payroll, and recruitment',
    defaultCanvas: 'table',
    aiEnabled: true,
    tabs: [
      { id: 'directory', label: 'Directory', canvas: 'table', featureIds: ['company_ops.hr.directory', 'company_ops.hr.org_chart'] },
      { id: 'leave', label: 'Leave Management', canvas: 'table', featureIds: ['company_ops.hr.leave'] },
      { id: 'payroll', label: 'Payroll', canvas: 'table', featureIds: ['company_ops.hr.payroll', 'company_ops.hr.positions'] },
      { id: 'recruitment', label: 'Recruitment', canvas: 'board', featureIds: ['company_ops.hr.recruitment', 'company_ops.hr.onboarding'], wireframeType: 'board' },
      { id: 'performance', label: 'Performance', canvas: 'table', featureIds: ['company_ops.hr.performance', 'company_ops.hr.succession'] },
    ],
    roles: ['admin', 'executive', 'staff'],
  },
  {
    id: 'campus',
    label: 'Campus',
    icon: 'map',
    description: 'Master planning, site acquisition, design, construction, and approvals',
    defaultCanvas: 'timeline',
    aiEnabled: true,
    tabs: [
      { id: 'master-plan', label: 'Master Plan', canvas: 'timeline', featureIds: ['campus_dev.design.master_plan', 'campus_dev.design.architecture', 'campus_dev.design.engineering', 'campus_dev.design.interior', 'campus_dev.design.sustainability'] },
      { id: 'site-acquisition', label: 'Site Acquisition', canvas: 'table', featureIds: ['campus_dev.site_search.identification', 'campus_dev.site_search.due_diligence', 'campus_dev.site_search.feasibility', 'campus_dev.site_search.acquisition'] },
      { id: 'design-construction', label: 'Design & Construction', canvas: 'timeline', featureIds: ['campus_dev.construction.project_management', 'campus_dev.construction.contractor_management', 'campus_dev.construction.progress', 'campus_dev.construction.quality', 'campus_dev.construction.safety', 'campus_dev.commissioning.fitout', 'campus_dev.commissioning.systems_testing', 'campus_dev.commissioning.certification', 'campus_dev.commissioning.punch_lists'] },
      { id: 'approvals', label: 'Approvals', canvas: 'board', featureIds: ['campus_dev.planning.da_applications', 'campus_dev.planning.zoning', 'campus_dev.planning.heritage', 'campus_dev.planning.environmental', 'campus_dev.planning.community_consultation'], wireframeType: 'board' },
      { id: 'heritage', label: 'Heritage', canvas: 'documents', featureIds: ['first_nations.cultural_heritage.surveys', 'first_nations.cultural_heritage.sites', 'first_nations.cultural_heritage.duty_of_care', 'first_nations.cultural_heritage.native_title'], wireframeType: 'document' },
      { id: 'portfolio', label: 'Portfolio', canvas: 'table', featureIds: ['campus_dev.campus_portfolio.overview', 'campus_dev.campus_portfolio.comparison', 'campus_dev.campus_portfolio.expansion_pipeline', 'campus_dev.campus_portfolio.global_standards'] },
      { id: 'operations', label: 'Operations', canvas: 'table', featureIds: ['campus_ops.building_management.bms_integration', 'campus_ops.building_management.hvac_control', 'campus_ops.building_management.lighting', 'campus_ops.building_management.energy_monitoring', 'campus_ops.security.cctv', 'campus_ops.security.access_logs', 'campus_ops.security.visitor_management', 'campus_ops.security.incident_response', 'campus_ops.catering.restaurant_management', 'campus_ops.catering.catering_orders', 'campus_ops.catering.menu_planning', 'campus_ops.cleaning.schedules', 'campus_ops.cleaning.service_quality', 'campus_ops.cleaning.contractor_management', 'campus_ops.transport.shuttle_service', 'campus_ops.transport.parking', 'campus_ops.transport.loading_dock', 'campus_ops.waste.waste_management', 'campus_ops.waste.recycling_tracking', 'campus_ops.waste.sustainability_metrics', 'campus_ops.waste.compliance_reporting'] },
      { id: 'global-network', label: 'Global Network', canvas: 'table', featureIds: ['global_network.campuses.campus_registry', 'global_network.campuses.status_dashboard', 'global_network.campuses.comparison_metrics', 'global_network.campuses.expansion_roadmap', 'global_network.campuses.site_selection', 'global_network.interconnect.cross_campus_booking', 'global_network.interconnect.resource_sharing', 'global_network.interconnect.production_transfer', 'global_network.interconnect.unified_calendar', 'global_network.standards.brand_standards', 'global_network.standards.service_level_frameworks', 'global_network.standards.quality_benchmarks', 'global_network.cross_border.multi_jurisdiction', 'global_network.cross_border.currency_management', 'global_network.cross_border.timezone_coordination', 'global_network.cross_border.cross_border_taxation'] },
    ],
    roles: ['admin', 'executive', 'government', 'partner'],
  },
  {
    id: 'events',
    label: 'Events',
    icon: 'calendar',
    description: 'Events, ticketing, tours, and venue management',
    defaultCanvas: 'calendar',
    aiEnabled: true,
    tabs: [
      { id: 'calendar', label: 'Calendar', canvas: 'calendar', featureIds: ['events_tickets.events.event_calendar', 'events_tickets.events.event_creation', 'events_tickets.events.logistics', 'events_tickets.events.venue_management'] },
      { id: 'ticketing', label: 'Ticketing', canvas: 'table', featureIds: ['events_tickets.ticketing.ticket_sales', 'events_tickets.ticketing.seating_maps', 'events_tickets.ticketing.pricing_tiers', 'events_tickets.ticketing.promo_codes', 'events_tickets.ticketing.refunds'] },
      { id: 'tours', label: 'Tours', canvas: 'catalog', featureIds: ['events_tickets.tours.tour_bookings', 'events_tickets.tours.guide_scheduling', 'events_tickets.tours.group_management', 'events_tickets.tours.accessibility'], wireframeType: 'catalog' },
      { id: 'experiences', label: 'Experiences', canvas: 'table', featureIds: ['events_tickets.experiences.vr_ar', 'events_tickets.experiences.interactive_exhibits', 'events_tickets.experiences.special_events', 'events_tickets.experiences.package_deals'] },
    ],
    roles: ['admin', 'staff', 'guest'],
  },
  {
    id: 'education',
    label: 'Education',
    icon: 'graduation-cap',
    description: 'Training, courses, workshops, and certifications',
    defaultCanvas: 'catalog',
    aiEnabled: true,
    tabs: [
      { id: 'courses', label: 'Courses', canvas: 'catalog', featureIds: ['education.programs.course_catalog', 'education.programs.program_management', 'education.programs.curriculum_design', 'education.programs.accreditation'] },
      { id: 'workshops', label: 'Workshops', canvas: 'catalog', featureIds: ['education.workshops.workshop_scheduling', 'education.workshops.trainer_management', 'education.workshops.materials', 'education.workshops.participant_tracking'] },
      { id: 'certifications', label: 'Certifications', canvas: 'table', featureIds: ['education.students.assessment', 'education.students.certification'] },
      { id: 'enrolments', label: 'Enrolments', canvas: 'table', featureIds: ['education.students.enrollment', 'education.students.progress_tracking'] },
      { id: 'internships', label: 'Internships', canvas: 'table', featureIds: ['education.internships.internship_programs', 'education.internships.placement_management', 'education.internships.mentor_assignment', 'education.internships.evaluations'] },
      { id: 'research', label: 'Research', canvas: 'table', featureIds: ['education.research.rd_projects', 'education.research.research_partnerships', 'education.research.grants', 'education.research.publications'] },
      { id: 'partners', label: 'Partners', canvas: 'table', featureIds: ['partnerships.education_partners.university_programs', 'partnerships.education_partners.internships', 'partnerships.education_partners.curriculum', 'partnerships.education_partners.research'] },
    ],
    roles: ['admin', 'staff', 'guest', 'partner', 'first_nations'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'chart-bar',
    description: 'Operational metrics, economic impact, and reports',
    defaultCanvas: 'charts',
    aiEnabled: true,
    tabs: [
      { id: 'operational', label: 'Operational Metrics', canvas: 'charts', featureIds: ['analytics.operational_metrics.facility_utilization', 'analytics.operational_metrics.production_throughput', 'analytics.operational_metrics.revenue_per_sqm'] },
      { id: 'financial', label: 'Financial Analytics', canvas: 'charts', featureIds: ['analytics.reports.report_templates', 'analytics.reports.scheduled_reports', 'analytics.reports.ad_hoc_queries', 'analytics.reports.export_management'] },
      { id: 'dashboards', label: 'Dashboards', canvas: 'charts', featureIds: ['analytics.dashboards.custom_builder', 'analytics.dashboards.kpi_configuration', 'analytics.dashboards.data_visualization', 'analytics.dashboards.saved_views'] },
      { id: 'business-intelligence', label: 'Business Intelligence', canvas: 'charts', featureIds: ['analytics.business_intelligence.trend_analysis', 'analytics.business_intelligence.predictive_analytics', 'analytics.business_intelligence.benchmark_comparison', 'analytics.business_intelligence.what_if_modeling'] },
      { id: 'sustainability', label: 'Sustainability', canvas: 'charts', featureIds: ['analytics.sustainability_metrics.energy_consumption', 'analytics.sustainability_metrics.carbon_footprint', 'analytics.sustainability_metrics.waste_diversion', 'analytics.sustainability_metrics.water_usage', 'analytics.sustainability_metrics.green_certification'] },
    ],
    roles: ['admin', 'executive', 'government'],
  },
  {
    id: 'investor-relations',
    label: 'Investor Relations',
    icon: 'briefcase',
    description: 'Data room, portfolio, distributions, and investor reports',
    defaultCanvas: 'documents',
    aiEnabled: false,
    tabs: [
      { id: 'portfolio', label: 'Portfolio Overview', canvas: 'charts', featureIds: ['investor_relations.portfolio.investment_overview', 'investor_relations.portfolio.return_tracking', 'investor_relations.portfolio.valuation_updates', 'investor_relations.portfolio.distribution_history'] },
      { id: 'data-room', label: 'Data Room', canvas: 'documents', featureIds: ['data_rooms.investor.financial_documents', 'data_rooms.investor.due_diligence', 'data_rooms.investor.materials', 'data_rooms.investor.access_control', 'data_rooms.government.grant_applications', 'data_rooms.government.compliance', 'data_rooms.government.economic_reports', 'data_rooms.project.per_production', 'data_rooms.project.nda_tracking', 'data_rooms.project.watermarked_access', 'data_rooms.partnership.joint_venture', 'data_rooms.partnership.term_sheets', 'data_rooms.partnership.collaboration_agreements'] },
      { id: 'reports', label: 'Financial Reports', canvas: 'documents', featureIds: ['investor_relations.reporting.quarterly_reports', 'investor_relations.reporting.annual_reports', 'investor_relations.reporting.investor_updates', 'investor_relations.reporting.agm_materials'] },
      { id: 'distributions', label: 'Distributions', canvas: 'table', featureIds: ['investor_relations.distributions.distribution_calculations', 'investor_relations.distributions.payment_processing', 'investor_relations.distributions.tax_statements'] },
      { id: 'cap-table', label: 'Cap Table', canvas: 'table', featureIds: ['investor_relations.cap_table.cap_table_management', 'investor_relations.cap_table.share_registry', 'investor_relations.cap_table.option_pool', 'investor_relations.cap_table.convertible_notes'] },
      { id: 'fundraising', label: 'Fundraising', canvas: 'table', featureIds: ['investor_relations.fundraising.fundraising_rounds', 'investor_relations.fundraising.investor_pipeline', 'investor_relations.fundraising.term_sheets', 'investor_relations.fundraising.due_diligence', 'investor_relations.fundraising.investor_portal'] },
    ],
    roles: ['admin', 'executive', 'investor'],
  },
  {
    id: 'partnerships',
    label: 'Partnerships',
    icon: 'handshake',
    description: 'Technology partners, education partners, First Nations, and government programs',
    defaultCanvas: 'table',
    aiEnabled: true,
    tabs: [
      { id: 'overview', label: 'Overview', canvas: 'table', featureIds: ['partnerships.technology_partners.directory', 'partnerships.technology_partners.integrations', 'partnerships.technology_partners.joint_rd', 'partnerships.technology_partners.ip_sharing', 'partnerships.industry_alliances.co_production', 'partnerships.industry_alliances.facility_sharing', 'partnerships.industry_alliances.cross_campus'] },
      { id: 'technology', label: 'Technology Partners', canvas: 'table', featureIds: ['partnerships.sovereign_funds.government_programs', 'partnerships.sovereign_funds.fund_engagement', 'partnerships.sovereign_funds.economic_tracking'] },
      { id: 'first-nations', label: 'First Nations', canvas: 'table', featureIds: ['first_nations.traditional_owners.groups', 'first_nations.traditional_owners.engagement', 'first_nations.traditional_owners.agreements', 'first_nations.ways.campus_design', 'first_nations.ways.seasonal_calendar', 'first_nations.ways.language', 'first_nations.ways.cultural_spaces', 'first_nations.programs.employment', 'first_nations.programs.suppliers', 'first_nations.programs.artists', 'first_nations.programs.cultural_safety', 'first_nations.rap.plan', 'first_nations.rap.reporting', 'first_nations.advisory.board', 'first_nations.protocols.welcome', 'first_nations.protocols.acknowledgement', 'first_nations.protocols.cultural_ip', 'first_nations.outreach.community', 'first_nations.outreach.screen_industry', 'first_nations.outreach.events'] },
      { id: 'government', label: 'Government Programs', canvas: 'table', featureIds: ['gov_policy.local.councils', 'gov_policy.local.meetings', 'gov_policy.local.correspondence', 'gov_policy.local.da_engagement', 'gov_policy.local.incentives', 'gov_policy.state.ministers', 'gov_policy.state.meetings', 'gov_policy.state.screen_qld', 'gov_policy.state.tiq', 'gov_policy.state.incentives', 'gov_policy.state.crown_lease', 'gov_policy.state.policy', 'gov_policy.federal.ministers', 'gov_policy.federal.incentives', 'gov_policy.federal.arts_office', 'gov_policy.federal.grants', 'gov_policy.international.singapore', 'gov_policy.international.hawaii', 'gov_policy.international.europe', 'gov_policy.international.usa', 'gov_policy.outreach.campaigns', 'gov_policy.outreach.stakeholder_map', 'gov_policy.outreach.briefings'] },
      { id: 'community', label: 'Community', canvas: 'table', featureIds: ['community.stakeholder_engagement.advisory_boards', 'community.stakeholder_engagement.public_consultation', 'community.stakeholder_engagement.feedback_management', 'community.stakeholder_engagement.stakeholder_directory', 'community.social_impact.economic_reporting', 'community.social_impact.employment_metrics', 'community.social_impact.local_business', 'community.cultural_programs.community_events', 'community.cultural_programs.open_days', 'community.cultural_programs.public_art', 'community.cultural_programs.cultural_partnerships', 'community.media_relations.press_releases', 'community.media_relations.media_monitoring', 'community.media_relations.spokesperson', 'community.media_relations.crisis_comms'] },
      { id: 'eoi', label: 'EOI', canvas: 'table', featureIds: ['company_ops.knowledge.wiki', 'company_ops.knowledge.documents', 'company_ops.knowledge.project_mgmt'] },
    ],
    roles: ['admin', 'government', 'partner', 'first_nations'],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: 'settings',
    description: 'Users, roles, permissions, audit, SSO, and system config',
    defaultCanvas: 'table',
    aiEnabled: true,
    tabs: [
      { id: 'users', label: 'Users', canvas: 'table', featureIds: ['administration.users.user_management', 'administration.users.role_assignment', 'administration.users.permission_management', 'administration.users.sso_configuration'] },
      { id: 'roles', label: 'Roles & Permissions', canvas: 'table', featureIds: ['administration.audit.audit_logs', 'administration.audit.access_reports', 'administration.audit.compliance_monitoring', 'administration.audit.data_retention'] },
      { id: 'integrations', label: 'Integrations', canvas: 'table', featureIds: ['administration.integrations.api_management', 'administration.integrations.webhook_configuration', 'administration.integrations.third_party', 'administration.integrations.data_sync'] },
      { id: 'settings', label: 'Settings', canvas: 'table', featureIds: ['administration.settings.system_configuration', 'administration.settings.feature_flags', 'administration.settings.locale_management', 'administration.settings.notification_templates', 'administration.settings.branding'] },
      { id: 'security', label: 'Security', canvas: 'table', featureIds: ['administration.security.security_policies', 'administration.security.mfa_management', 'administration.security.session_management', 'administration.security.ip_allowlisting'] },
      { id: 'legal', label: 'Legal', canvas: 'table', featureIds: ['company_ops.legal.contracts', 'company_ops.legal.ip', 'company_ops.legal.compliance_calendar', 'company_ops.legal.litigation', 'company_ops.legal.counsel', 'company_ops.legal.privacy'] },
      { id: 'board', label: 'Board', canvas: 'table', featureIds: ['company_ops.board.meetings', 'company_ops.board.minutes', 'company_ops.board.directors', 'company_ops.board.governance', 'company_ops.board.company_secretary'] },
      { id: 'communications', label: 'Communications', canvas: 'communications', featureIds: ['communications.internal.staff_announcements', 'communications.internal.newsletter', 'communications.internal.intranet', 'communications.internal.policy_distribution', 'communications.external.website_cms', 'communications.external.social_media', 'communications.external.press_releases', 'communications.external.media_kit', 'communications.brand.brand_guidelines', 'communications.brand.asset_library', 'communications.brand.template_management', 'communications.notifications.notification_center', 'communications.notifications.alert_management', 'communications.notifications.escalation_rules', 'communications.notifications.communication_preferences'] },
    ],
    roles: ['admin'],
  },
];

/** O(1) workspace lookup by ID */
export const WORKSPACE_MAP = new Map<WorkspaceId, WorkspaceConfig>(
  WORKSPACE_CONFIG.map((ws) => [ws.id, ws]),
);