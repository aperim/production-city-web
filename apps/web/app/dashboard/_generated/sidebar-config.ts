// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.
// @generated

export interface SidebarSubsection {
  id: string;
  label: string;
  featureIds: string[];
}

export interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  path: string;
  subsections: SidebarSubsection[];
}

export interface SidebarGroup {
  id: string;
  label: string;
  sections: SidebarSection[];
}

export const SIDEBAR_CONFIG: SidebarGroup[] = [
  {
    id: 'workspace',
    label: 'Your Workspace',
    sections: [
      {
        id: 'home',
        label: 'Dashboard',
        icon: 'home',
        path: '/dashboard',
        subsections: [
          { id: 'home.overview', label: 'Overview', featureIds: ['home.overview.executive', 'home.overview.staff', 'home.overview.client', 'home.overview.investor', 'home.overview.guest', 'home.overview.vendor', 'home.overview.government', 'home.overview.partner', 'home.quick_actions', 'home.activity_feed'] },
        ],
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    sections: [
      {
        id: 'company_ops',
        label: 'Company Operations',
        icon: 'building',
        path: '/dashboard/company',
        subsections: [
          { id: 'company_ops.hr', label: 'Human Resources', featureIds: ['company_ops.hr.directory', 'company_ops.hr.org_chart', 'company_ops.hr.recruitment', 'company_ops.hr.onboarding', 'company_ops.hr.performance', 'company_ops.hr.leave', 'company_ops.hr.payroll', 'company_ops.hr.positions', 'company_ops.hr.succession'] },
          { id: 'company_ops.legal', label: 'Legal', featureIds: ['company_ops.legal.contracts', 'company_ops.legal.ip', 'company_ops.legal.compliance_calendar', 'company_ops.legal.litigation', 'company_ops.legal.counsel', 'company_ops.legal.privacy'] },
          { id: 'company_ops.finance', label: 'Company Finance', featureIds: ['company_ops.finance.accounts', 'company_ops.finance.cashflow', 'company_ops.finance.reporting', 'company_ops.finance.tax'] },
          { id: 'company_ops.capital', label: 'Capital & Investment', featureIds: ['company_ops.capital.cap_table', 'company_ops.capital.fundraising', 'company_ops.capital.shareholder_registry', 'company_ops.capital.sovereign_funds', 'company_ops.capital.investment_docs', 'company_ops.capital.scenario_modelling'] },
          { id: 'company_ops.board', label: 'Board & Governance', featureIds: ['company_ops.board.meetings', 'company_ops.board.minutes', 'company_ops.board.directors', 'company_ops.board.governance', 'company_ops.board.company_secretary'] },
          { id: 'company_ops.insurance', label: 'Insurance & Risk', featureIds: ['company_ops.insurance.portfolio', 'company_ops.insurance.risk_register', 'company_ops.insurance.bcp', 'company_ops.insurance.claims'] },
          { id: 'company_ops.knowledge', label: 'Knowledge & Documents', featureIds: ['company_ops.knowledge.wiki', 'company_ops.knowledge.documents', 'company_ops.knowledge.project_mgmt'] },
        ],
      },
      {
        id: 'gov_policy',
        label: 'Government & Policy',
        icon: 'landmark',
        path: '/dashboard/government',
        subsections: [
          { id: 'gov_policy.local', label: 'Local Government', featureIds: ['gov_policy.local.councils', 'gov_policy.local.meetings', 'gov_policy.local.correspondence', 'gov_policy.local.da_engagement', 'gov_policy.local.incentives'] },
          { id: 'gov_policy.state', label: 'State Government', featureIds: ['gov_policy.state.ministers', 'gov_policy.state.meetings', 'gov_policy.state.screen_qld', 'gov_policy.state.tiq', 'gov_policy.state.incentives', 'gov_policy.state.crown_lease', 'gov_policy.state.policy'] },
          { id: 'gov_policy.federal', label: 'Federal Government', featureIds: ['gov_policy.federal.ministers', 'gov_policy.federal.incentives', 'gov_policy.federal.arts_office', 'gov_policy.federal.grants'] },
          { id: 'gov_policy.international', label: 'International Governments', featureIds: ['gov_policy.international.singapore', 'gov_policy.international.hawaii', 'gov_policy.international.europe', 'gov_policy.international.usa'] },
          { id: 'gov_policy.outreach', label: 'Outreach Campaigns', featureIds: ['gov_policy.outreach.campaigns', 'gov_policy.outreach.stakeholder_map', 'gov_policy.outreach.briefings'] },
        ],
      },
      {
        id: 'first_nations',
        label: 'First Nations',
        icon: 'sun',
        path: '/dashboard/first-nations',
        subsections: [
          { id: 'first_nations.traditional_owners', label: 'Traditional Owner Engagement', featureIds: ['first_nations.traditional_owners.groups', 'first_nations.traditional_owners.engagement', 'first_nations.traditional_owners.agreements'] },
          { id: 'first_nations.cultural_heritage', label: 'Cultural Heritage', featureIds: ['first_nations.cultural_heritage.surveys', 'first_nations.cultural_heritage.sites', 'first_nations.cultural_heritage.duty_of_care', 'first_nations.cultural_heritage.native_title'] },
          { id: 'first_nations.ways', label: 'Ways of Knowing, Being, Doing', featureIds: ['first_nations.ways.campus_design', 'first_nations.ways.seasonal_calendar', 'first_nations.ways.language', 'first_nations.ways.cultural_spaces'] },
          { id: 'first_nations.programs', label: 'First Nations Programs', featureIds: ['first_nations.programs.employment', 'first_nations.programs.suppliers', 'first_nations.programs.artists', 'first_nations.programs.cultural_safety'] },
          { id: 'first_nations.rap', label: 'Reconciliation Action Plan', featureIds: ['first_nations.rap.plan', 'first_nations.rap.reporting'] },
          { id: 'first_nations.advisory', label: 'Advisory Board', featureIds: ['first_nations.advisory.board'] },
          { id: 'first_nations.protocols', label: 'Cultural Protocols', featureIds: ['first_nations.protocols.welcome', 'first_nations.protocols.acknowledgement', 'first_nations.protocols.cultural_ip'] },
          { id: 'first_nations.outreach', label: 'First Nations Outreach', featureIds: ['first_nations.outreach.community', 'first_nations.outreach.screen_industry', 'first_nations.outreach.events'] },
        ],
      },
      {
        id: 'community',
        label: 'Community',
        icon: 'users',
        path: '/dashboard/community',
        subsections: [
          { id: 'community.stakeholder_engagement', label: 'Stakeholder Engagement', featureIds: ['community.stakeholder_engagement.advisory_boards', 'community.stakeholder_engagement.public_consultation', 'community.stakeholder_engagement.feedback_management', 'community.stakeholder_engagement.stakeholder_directory'] },
          { id: 'community.social_impact', label: 'Social Impact', featureIds: ['community.social_impact.economic_reporting', 'community.social_impact.employment_metrics', 'community.social_impact.local_business'] },
          { id: 'community.cultural_programs', label: 'Cultural Programs', featureIds: ['community.cultural_programs.community_events', 'community.cultural_programs.open_days', 'community.cultural_programs.public_art', 'community.cultural_programs.cultural_partnerships'] },
          { id: 'community.media_relations', label: 'Media Relations', featureIds: ['community.media_relations.press_releases', 'community.media_relations.media_monitoring', 'community.media_relations.spokesperson', 'community.media_relations.crisis_comms'] },
        ],
      },
      {
        id: 'partnerships',
        label: 'Partnerships',
        icon: 'handshake',
        path: '/dashboard/partnerships',
        subsections: [
          { id: 'partnerships.technology_partners', label: 'Technology Partners', featureIds: ['partnerships.technology_partners.directory', 'partnerships.technology_partners.integrations', 'partnerships.technology_partners.joint_rd', 'partnerships.technology_partners.ip_sharing'] },
          { id: 'partnerships.education_partners', label: 'Education Partners', featureIds: ['partnerships.education_partners.university_programs', 'partnerships.education_partners.internships', 'partnerships.education_partners.curriculum', 'partnerships.education_partners.research'] },
          { id: 'partnerships.industry_alliances', label: 'Industry Alliances', featureIds: ['partnerships.industry_alliances.co_production', 'partnerships.industry_alliances.facility_sharing', 'partnerships.industry_alliances.cross_campus'] },
          { id: 'partnerships.sovereign_funds', label: 'Sovereign Funds', featureIds: ['partnerships.sovereign_funds.government_programs', 'partnerships.sovereign_funds.fund_engagement', 'partnerships.sovereign_funds.economic_tracking'] },
        ],
      },
      {
        id: 'data_rooms',
        label: 'Data Rooms',
        icon: 'vault',
        path: '/dashboard/data-rooms',
        subsections: [
          { id: 'data_rooms.investor', label: 'Investor Data Room', featureIds: ['data_rooms.investor.financial_documents', 'data_rooms.investor.due_diligence', 'data_rooms.investor.materials', 'data_rooms.investor.access_control'] },
          { id: 'data_rooms.government', label: 'Government Data Room', featureIds: ['data_rooms.government.grant_applications', 'data_rooms.government.compliance', 'data_rooms.government.economic_reports'] },
          { id: 'data_rooms.project', label: 'Project Data Rooms', featureIds: ['data_rooms.project.per_production', 'data_rooms.project.nda_tracking', 'data_rooms.project.watermarked_access'] },
          { id: 'data_rooms.partnership', label: 'Partnership Data Rooms', featureIds: ['data_rooms.partnership.joint_venture', 'data_rooms.partnership.term_sheets', 'data_rooms.partnership.collaboration_agreements'] },
        ],
      },
    ],
  },
  {
    id: 'development',
    label: 'Campus Development',
    sections: [
      {
        id: 'campus_dev',
        label: 'Campus Development',
        icon: 'construction',
        path: '/dashboard/campus',
        subsections: [
          { id: 'campus_dev.site_search', label: 'Site Search', featureIds: ['campus_dev.site_search.identification', 'campus_dev.site_search.due_diligence', 'campus_dev.site_search.feasibility', 'campus_dev.site_search.acquisition'] },
          { id: 'campus_dev.planning', label: 'Planning & Approvals', featureIds: ['campus_dev.planning.da_applications', 'campus_dev.planning.zoning', 'campus_dev.planning.heritage', 'campus_dev.planning.environmental', 'campus_dev.planning.community_consultation'] },
          { id: 'campus_dev.design', label: 'Design', featureIds: ['campus_dev.design.master_plan', 'campus_dev.design.architecture', 'campus_dev.design.engineering', 'campus_dev.design.interior', 'campus_dev.design.sustainability'] },
          { id: 'campus_dev.construction', label: 'Construction', featureIds: ['campus_dev.construction.project_management', 'campus_dev.construction.contractor_management', 'campus_dev.construction.progress', 'campus_dev.construction.quality', 'campus_dev.construction.safety'] },
          { id: 'campus_dev.commissioning', label: 'Commissioning', featureIds: ['campus_dev.commissioning.fitout', 'campus_dev.commissioning.systems_testing', 'campus_dev.commissioning.certification', 'campus_dev.commissioning.punch_lists'] },
          { id: 'campus_dev.campus_portfolio', label: 'Campus Portfolio', featureIds: ['campus_dev.campus_portfolio.overview', 'campus_dev.campus_portfolio.comparison', 'campus_dev.campus_portfolio.expansion_pipeline', 'campus_dev.campus_portfolio.global_standards'] },
        ],
      },
    ],
  },
  {
    id: 'production',
    label: 'Production',
    sections: [
      {
        id: 'productions',
        label: 'Productions',
        icon: 'clapperboard',
        path: '/dashboard/productions',
        subsections: [
          { id: 'productions.active', label: 'Active Productions', featureIds: ['productions.active.board', 'productions.active.timeline', 'productions.active.call_sheets', 'productions.active.daily_reports'] },
          { id: 'productions.pre_production', label: 'Pre-Production', featureIds: ['productions.pre_production.script_breakdown', 'productions.pre_production.storyboarding', 'productions.pre_production.casting', 'productions.pre_production.location_scouting', 'productions.pre_production.budget_estimation'] },
          { id: 'productions.production', label: 'Production', featureIds: ['productions.production.shooting_schedules', 'productions.production.crew_assignments', 'productions.production.daily_logs', 'productions.production.rushes_review'] },
          { id: 'productions.post_production', label: 'Post-Production', featureIds: ['productions.post_production.editing', 'productions.post_production.color_grading', 'productions.post_production.vfx', 'productions.post_production.sound_mix', 'productions.post_production.deliverables'] },
          { id: 'productions.finance', label: 'Production Finance', featureIds: ['productions.finance.budgets', 'productions.finance.cost_reports', 'productions.finance.purchase_orders', 'productions.finance.petty_cash', 'productions.finance.completion_guarantor'] },
        ],
      },
      {
        id: 'facilities',
        label: 'Facilities',
        icon: 'warehouse',
        path: '/dashboard/facilities',
        subsections: [
          { id: 'facilities.sound_stages', label: 'Sound Stages', featureIds: ['facilities.sound_stages.calendar', 'facilities.sound_stages.booking', 'facilities.sound_stages.pricing', 'facilities.sound_stages.configuration'] },
          { id: 'facilities.broadcast', label: 'Broadcast Facilities', featureIds: ['facilities.broadcast.theatre_booking', 'facilities.broadcast.control_room_scheduling', 'facilities.broadcast.presets'] },
          { id: 'facilities.workshops', label: 'Workshops', featureIds: ['facilities.workshops.set_construction', 'facilities.workshops.props', 'facilities.workshops.costume', 'facilities.workshops.paint_shop'] },
          { id: 'facilities.recording_studios', label: 'Recording Studios', featureIds: ['facilities.recording_studios.booking', 'facilities.recording_studios.session_management', 'facilities.recording_studios.equipment'] },
          { id: 'facilities.support_spaces', label: 'Support Spaces', featureIds: ['facilities.support_spaces.dressing_rooms', 'facilities.support_spaces.green_rooms', 'facilities.support_spaces.catering', 'facilities.support_spaces.parking', 'facilities.support_spaces.storage'] },
          { id: 'facilities.maintenance', label: 'Maintenance', featureIds: ['facilities.maintenance.preventive', 'facilities.maintenance.work_orders', 'facilities.maintenance.asset_lifecycle', 'facilities.maintenance.vendor_scheduling'] },
          { id: 'facilities.rooms', label: 'Rooms & Spaces', featureIds: ['facilities.rooms.room_booking'] },
        ],
      },
      {
        id: 'broadcast',
        label: 'Broadcast',
        icon: 'radio',
        path: '/dashboard/broadcast',
        subsections: [
          { id: 'broadcast.live_production', label: 'Live Production', featureIds: ['broadcast.live_production.rundown', 'broadcast.live_production.cue_sheets', 'broadcast.live_production.switching', 'broadcast.live_production.graphics'] },
          { id: 'broadcast.control_room', label: 'Control Room', featureIds: ['broadcast.control_room.booking', 'broadcast.control_room.technical_setup', 'broadcast.control_room.signal_routing', 'broadcast.control_room.redundancy'] },
          { id: 'broadcast.transmission', label: 'Transmission', featureIds: ['broadcast.transmission.uplink', 'broadcast.transmission.cdn', 'broadcast.transmission.multi_platform', 'broadcast.transmission.latency_monitoring'] },
          { id: 'broadcast.planning', label: 'Broadcast Planning', featureIds: ['broadcast.planning.schedule', 'broadcast.planning.rehearsals', 'broadcast.planning.technical_requirements', 'broadcast.planning.risk_assessment'] },
        ],
      },
      {
        id: 'virtual_production',
        label: 'Virtual Production',
        icon: 'cube',
        path: '/dashboard/virtual-production',
        subsections: [
          { id: 'virtual_production.led_volume', label: 'LED Volume', featureIds: ['virtual_production.led_volume.configuration', 'virtual_production.led_volume.content_management', 'virtual_production.led_volume.calibration', 'virtual_production.led_volume.show_files'] },
          { id: 'virtual_production.previs', label: 'Previsualization', featureIds: ['virtual_production.previs.previsualization', 'virtual_production.previs.techvis', 'virtual_production.previs.postvis', 'virtual_production.previs.virtual_camera'] },
          { id: 'virtual_production.motion_capture', label: 'Motion Capture', featureIds: ['virtual_production.motion_capture.scheduling', 'virtual_production.motion_capture.performers', 'virtual_production.motion_capture.data_processing', 'virtual_production.motion_capture.cleanup'] },
          { id: 'virtual_production.realtime_rendering', label: 'Real-Time Rendering', featureIds: ['virtual_production.realtime_rendering.unreal_projects', 'virtual_production.realtime_rendering.asset_library', 'virtual_production.realtime_rendering.scene_management', 'virtual_production.realtime_rendering.performance'] },
          { id: 'virtual_production.digital_assets', label: 'Digital Assets', featureIds: ['virtual_production.digital_assets.library', 'virtual_production.digital_assets.scan_processing', 'virtual_production.digital_assets.digital_twins', 'virtual_production.digital_assets.versioning'] },
        ],
      },
      {
        id: 'audio_music',
        label: 'Audio & Music',
        icon: 'music',
        path: '/dashboard/audio',
        subsections: [
          { id: 'audio_music.recording', label: 'Recording', featureIds: ['audio_music.recording.session_booking', 'audio_music.recording.engineer_assignment', 'audio_music.recording.track_management', 'audio_music.recording.mix_versions'] },
          { id: 'audio_music.sound_design', label: 'Sound Design', featureIds: ['audio_music.sound_design.sfx_library', 'audio_music.sound_design.foley_scheduling', 'audio_music.sound_design.adr_booking', 'audio_music.sound_design.atmos_mixing'] },
          { id: 'audio_music.music_production', label: 'Music Production', featureIds: ['audio_music.music_production.score_composition', 'audio_music.music_production.music_licensing', 'audio_music.music_production.library_management'] },
          { id: 'audio_music.mastering', label: 'Mastering', featureIds: ['audio_music.mastering.mastering_sessions', 'audio_music.mastering.deliverable_formats', 'audio_music.mastering.quality_control'] },
        ],
      },
      {
        id: 'workflow',
        label: 'Workflow',
        icon: 'git-branch',
        path: '/dashboard/workflow',
        subsections: [
          { id: 'workflow.pipeline', label: 'Pipeline', featureIds: ['workflow.pipeline.asset_pipeline', 'workflow.pipeline.workflow_templates', 'workflow.pipeline.stage_gates', 'workflow.pipeline.handoff_tracking'] },
          { id: 'workflow.review_approval', label: 'Review & Approval', featureIds: ['workflow.review_approval.dailies_review', 'workflow.review_approval.client_review', 'workflow.review_approval.approval_chains', 'workflow.review_approval.annotation_tools'] },
          { id: 'workflow.deliverables', label: 'Deliverables', featureIds: ['workflow.deliverables.deliverable_specs', 'workflow.deliverables.format_management', 'workflow.deliverables.qc_checklists', 'workflow.deliverables.distribution'] },
          { id: 'workflow.automation', label: 'Automation', featureIds: ['workflow.automation.automation_rules', 'workflow.automation.triggers', 'workflow.automation.notifications', 'workflow.automation.escalation_policies'] },
        ],
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    sections: [
      {
        id: 'talent_crew',
        label: 'Talent & Crew',
        icon: 'users-cog',
        path: '/dashboard/talent',
        subsections: [
          { id: 'talent_crew.crew_database', label: 'Crew Database', featureIds: ['talent_crew.crew_database.crew_profiles', 'talent_crew.crew_database.skills_certifications', 'talent_crew.crew_database.availability', 'talent_crew.crew_database.rate_cards'] },
          { id: 'talent_crew.casting', label: 'Casting', featureIds: ['talent_crew.casting.casting_calls', 'talent_crew.casting.audition_scheduling', 'talent_crew.casting.talent_management', 'talent_crew.casting.talent_agreements'] },
          { id: 'talent_crew.crew_scheduling', label: 'Crew Scheduling', featureIds: ['talent_crew.crew_scheduling.call_sheets', 'talent_crew.crew_scheduling.department_scheduling', 'talent_crew.crew_scheduling.overtime_tracking', 'talent_crew.crew_scheduling.meal_breaks'] },
          { id: 'talent_crew.safety_compliance', label: 'Safety & Compliance', featureIds: ['talent_crew.safety_compliance.safety_inductions', 'talent_crew.safety_compliance.incident_reporting', 'talent_crew.safety_compliance.first_aid', 'talent_crew.safety_compliance.ppe_tracking', 'talent_crew.safety_compliance.health_protocols'] },
        ],
      },
      {
        id: 'education',
        label: 'Education',
        icon: 'graduation-cap',
        path: '/dashboard/education',
        subsections: [
          { id: 'education.programs', label: 'Programs', featureIds: ['education.programs.course_catalog', 'education.programs.program_management', 'education.programs.curriculum_design', 'education.programs.accreditation'] },
          { id: 'education.students', label: 'Students', featureIds: ['education.students.enrollment', 'education.students.progress_tracking', 'education.students.assessment', 'education.students.certification'] },
          { id: 'education.internships', label: 'Internships', featureIds: ['education.internships.internship_programs', 'education.internships.placement_management', 'education.internships.mentor_assignment', 'education.internships.evaluations'] },
          { id: 'education.workshops', label: 'Workshops', featureIds: ['education.workshops.workshop_scheduling', 'education.workshops.trainer_management', 'education.workshops.materials', 'education.workshops.participant_tracking'] },
          { id: 'education.research', label: 'Research', featureIds: ['education.research.rd_projects', 'education.research.research_partnerships', 'education.research.grants', 'education.research.publications'] },
        ],
      },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    sections: [
      {
        id: 'events_tickets',
        label: 'Events & Tickets',
        icon: 'ticket',
        path: '/dashboard/events',
        subsections: [
          { id: 'events_tickets.events', label: 'Events', featureIds: ['events_tickets.events.event_calendar', 'events_tickets.events.event_creation', 'events_tickets.events.logistics', 'events_tickets.events.venue_management'] },
          { id: 'events_tickets.ticketing', label: 'Ticketing', featureIds: ['events_tickets.ticketing.ticket_sales', 'events_tickets.ticketing.seating_maps', 'events_tickets.ticketing.pricing_tiers', 'events_tickets.ticketing.promo_codes', 'events_tickets.ticketing.refunds'] },
          { id: 'events_tickets.tours', label: 'Tours', featureIds: ['events_tickets.tours.tour_bookings', 'events_tickets.tours.guide_scheduling', 'events_tickets.tours.group_management', 'events_tickets.tours.accessibility'] },
          { id: 'events_tickets.experiences', label: 'Experiences', featureIds: ['events_tickets.experiences.vr_ar', 'events_tickets.experiences.interactive_exhibits', 'events_tickets.experiences.special_events', 'events_tickets.experiences.package_deals'] },
        ],
      },
      {
        id: 'finance',
        label: 'Finance',
        icon: 'dollar-sign',
        path: '/dashboard/finance',
        subsections: [
          { id: 'finance.revenue', label: 'Revenue', featureIds: ['finance.revenue.revenue_tracking', 'finance.revenue.invoicing', 'finance.revenue.collections', 'finance.revenue.revenue_recognition'] },
          { id: 'finance.budgeting', label: 'Budgeting', featureIds: ['finance.budgeting.annual_budgets', 'finance.budgeting.departmental_budgets', 'finance.budgeting.variance_analysis', 'finance.budgeting.forecasting'] },
          { id: 'finance.procurement', label: 'Procurement', featureIds: ['finance.procurement.purchase_requisitions', 'finance.procurement.purchase_orders', 'finance.procurement.approval_workflows', 'finance.procurement.spend_analytics'] },
          { id: 'finance.expense_management', label: 'Expense Management', featureIds: ['finance.expense_management.expense_claims', 'finance.expense_management.corporate_cards', 'finance.expense_management.travel_booking', 'finance.expense_management.policy_enforcement'] },
          { id: 'finance.billing', label: 'Billing', featureIds: ['finance.billing.client_billing', 'finance.billing.rate_management', 'finance.billing.retainer_tracking', 'finance.billing.payment_gateway'] },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: 'boxes',
        path: '/dashboard/inventory',
        subsections: [
          { id: 'inventory.equipment', label: 'Equipment', featureIds: ['inventory.equipment.equipment_register', 'inventory.equipment.check_in_out', 'inventory.equipment.maintenance_logs', 'inventory.equipment.depreciation'] },
          { id: 'inventory.consumables', label: 'Consumables', featureIds: ['inventory.consumables.consumables_tracking', 'inventory.consumables.reorder_alerts', 'inventory.consumables.vendor_management', 'inventory.consumables.cost_allocation'] },
          { id: 'inventory.props_wardrobe', label: 'Props & Wardrobe', featureIds: ['inventory.props_wardrobe.props_inventory', 'inventory.props_wardrobe.wardrobe_tracking', 'inventory.props_wardrobe.condition_reports', 'inventory.props_wardrobe.storage_locations'] },
          { id: 'inventory.digital_assets_register', label: 'Digital Assets Register', featureIds: ['inventory.digital_assets_register.dam', 'inventory.digital_assets_register.file_storage', 'inventory.digital_assets_register.version_control', 'inventory.digital_assets_register.rights_management'] },
          { id: 'inventory.fleet', label: 'Fleet', featureIds: ['inventory.fleet.vehicle_management', 'inventory.fleet.bookings', 'inventory.fleet.fuel_tracking', 'inventory.fleet.maintenance'] },
        ],
      },
      {
        id: 'vendors',
        label: 'Vendors',
        icon: 'truck',
        path: '/dashboard/vendors',
        subsections: [
          { id: 'vendors.vendor_directory', label: 'Vendor Directory', featureIds: ['vendors.vendor_directory.supplier_profiles', 'vendors.vendor_directory.classifications', 'vendors.vendor_directory.certifications', 'vendors.vendor_directory.insurance_tracking'] },
          { id: 'vendors.procurement_portal', label: 'Procurement Portal', featureIds: ['vendors.procurement_portal.rfq_management', 'vendors.procurement_portal.bid_evaluation', 'vendors.procurement_portal.award_tracking'] },
          { id: 'vendors.contracts', label: 'Contracts', featureIds: ['vendors.contracts.vendor_contracts', 'vendors.contracts.sla_management', 'vendors.contracts.performance_reviews', 'vendors.contracts.renewal_management'] },
          { id: 'vendors.payments', label: 'Payments', featureIds: ['vendors.payments.invoice_processing', 'vendors.payments.payment_scheduling', 'vendors.payments.reconciliation', 'vendors.payments.dispute_management'] },
          { id: 'vendors.compliance', label: 'Compliance', featureIds: ['vendors.compliance.compliance_checks', 'vendors.compliance.insurance_verification', 'vendors.compliance.worksafe_requirements', 'vendors.compliance.modern_slavery'] },
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    sections: [
      {
        id: 'campus_ops',
        label: 'Campus Operations',
        icon: 'settings',
        path: '/dashboard/operations',
        subsections: [
          { id: 'campus_ops.building_management', label: 'Building Management', featureIds: ['campus_ops.building_management.bms_integration', 'campus_ops.building_management.hvac_control', 'campus_ops.building_management.lighting', 'campus_ops.building_management.energy_monitoring'] },
          { id: 'campus_ops.security', label: 'Security', featureIds: ['campus_ops.security.cctv', 'campus_ops.security.access_logs', 'campus_ops.security.visitor_management', 'campus_ops.security.incident_response'] },
          { id: 'campus_ops.catering', label: 'Catering', featureIds: ['campus_ops.catering.restaurant_management', 'campus_ops.catering.catering_orders', 'campus_ops.catering.menu_planning'] },
          { id: 'campus_ops.cleaning', label: 'Cleaning', featureIds: ['campus_ops.cleaning.schedules', 'campus_ops.cleaning.service_quality', 'campus_ops.cleaning.contractor_management'] },
          { id: 'campus_ops.transport', label: 'Transport', featureIds: ['campus_ops.transport.shuttle_service', 'campus_ops.transport.parking', 'campus_ops.transport.loading_dock'] },
          { id: 'campus_ops.waste', label: 'Waste Management', featureIds: ['campus_ops.waste.waste_management', 'campus_ops.waste.recycling_tracking', 'campus_ops.waste.sustainability_metrics', 'campus_ops.waste.compliance_reporting'] },
        ],
      },
      {
        id: 'global_network',
        label: 'Global Network',
        icon: 'globe',
        path: '/dashboard/global',
        subsections: [
          { id: 'global_network.campuses', label: 'Campuses', featureIds: ['global_network.campuses.campus_registry', 'global_network.campuses.status_dashboard', 'global_network.campuses.comparison_metrics', 'global_network.campuses.expansion_roadmap', 'global_network.campuses.site_selection'] },
          { id: 'global_network.interconnect', label: 'Interconnect', featureIds: ['global_network.interconnect.cross_campus_booking', 'global_network.interconnect.resource_sharing', 'global_network.interconnect.production_transfer', 'global_network.interconnect.unified_calendar'] },
          { id: 'global_network.standards', label: 'Standards', featureIds: ['global_network.standards.brand_standards', 'global_network.standards.service_level_frameworks', 'global_network.standards.quality_benchmarks'] },
          { id: 'global_network.cross_border', label: 'Cross-Border Operations', featureIds: ['global_network.cross_border.multi_jurisdiction', 'global_network.cross_border.currency_management', 'global_network.cross_border.timezone_coordination', 'global_network.cross_border.cross_border_taxation'] },
        ],
      },
      {
        id: 'communications',
        label: 'Communications',
        icon: 'megaphone',
        path: '/dashboard/comms',
        subsections: [
          { id: 'communications.internal', label: 'Internal Communications', featureIds: ['communications.internal.staff_announcements', 'communications.internal.newsletter', 'communications.internal.intranet', 'communications.internal.policy_distribution'] },
          { id: 'communications.external', label: 'External Communications', featureIds: ['communications.external.website_cms', 'communications.external.social_media', 'communications.external.press_releases', 'communications.external.media_kit'] },
          { id: 'communications.brand', label: 'Brand Management', featureIds: ['communications.brand.brand_guidelines', 'communications.brand.asset_library', 'communications.brand.template_management'] },
          { id: 'communications.notifications', label: 'Notifications', featureIds: ['communications.notifications.notification_center', 'communications.notifications.alert_management', 'communications.notifications.escalation_rules', 'communications.notifications.communication_preferences'] },
        ],
      },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    sections: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'bar-chart',
        path: '/dashboard/analytics',
        subsections: [
          { id: 'analytics.dashboards', label: 'Dashboards', featureIds: ['analytics.dashboards.custom_builder', 'analytics.dashboards.kpi_configuration', 'analytics.dashboards.data_visualization', 'analytics.dashboards.saved_views'] },
          { id: 'analytics.reports', label: 'Reports', featureIds: ['analytics.reports.report_templates', 'analytics.reports.scheduled_reports', 'analytics.reports.ad_hoc_queries', 'analytics.reports.export_management'] },
          { id: 'analytics.business_intelligence', label: 'Business Intelligence', featureIds: ['analytics.business_intelligence.trend_analysis', 'analytics.business_intelligence.predictive_analytics', 'analytics.business_intelligence.benchmark_comparison', 'analytics.business_intelligence.what_if_modeling'] },
          { id: 'analytics.operational_metrics', label: 'Operational Metrics', featureIds: ['analytics.operational_metrics.facility_utilization', 'analytics.operational_metrics.production_throughput', 'analytics.operational_metrics.revenue_per_sqm'] },
          { id: 'analytics.sustainability_metrics', label: 'Sustainability Metrics', featureIds: ['analytics.sustainability_metrics.energy_consumption', 'analytics.sustainability_metrics.carbon_footprint', 'analytics.sustainability_metrics.waste_diversion', 'analytics.sustainability_metrics.water_usage', 'analytics.sustainability_metrics.green_certification'] },
        ],
      },
      {
        id: 'investor_relations',
        label: 'Investor Relations',
        icon: 'trending-up',
        path: '/dashboard/investors',
        subsections: [
          { id: 'investor_relations.portfolio', label: 'Portfolio', featureIds: ['investor_relations.portfolio.investment_overview', 'investor_relations.portfolio.return_tracking', 'investor_relations.portfolio.valuation_updates', 'investor_relations.portfolio.distribution_history'] },
          { id: 'investor_relations.reporting', label: 'Reporting', featureIds: ['investor_relations.reporting.quarterly_reports', 'investor_relations.reporting.annual_reports', 'investor_relations.reporting.investor_updates', 'investor_relations.reporting.agm_materials'] },
          { id: 'investor_relations.cap_table', label: 'Cap Table', featureIds: ['investor_relations.cap_table.cap_table_management', 'investor_relations.cap_table.share_registry', 'investor_relations.cap_table.option_pool', 'investor_relations.cap_table.convertible_notes'] },
          { id: 'investor_relations.fundraising', label: 'Fundraising', featureIds: ['investor_relations.fundraising.fundraising_rounds', 'investor_relations.fundraising.investor_pipeline', 'investor_relations.fundraising.term_sheets', 'investor_relations.fundraising.due_diligence', 'investor_relations.fundraising.investor_portal'] },
          { id: 'investor_relations.distributions', label: 'Distributions', featureIds: ['investor_relations.distributions.distribution_calculations', 'investor_relations.distributions.payment_processing', 'investor_relations.distributions.tax_statements'] },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    sections: [
      {
        id: 'administration',
        label: 'Administration',
        icon: 'shield',
        path: '/dashboard/admin',
        subsections: [
          { id: 'administration.users', label: 'Users', featureIds: ['administration.users.user_management', 'administration.users.role_assignment', 'administration.users.permission_management', 'administration.users.sso_configuration'] },
          { id: 'administration.audit', label: 'Audit', featureIds: ['administration.audit.audit_logs', 'administration.audit.access_reports', 'administration.audit.compliance_monitoring', 'administration.audit.data_retention'] },
          { id: 'administration.integrations', label: 'Integrations', featureIds: ['administration.integrations.api_management', 'administration.integrations.webhook_configuration', 'administration.integrations.third_party', 'administration.integrations.data_sync'] },
          { id: 'administration.settings', label: 'Settings', featureIds: ['administration.settings.system_configuration', 'administration.settings.feature_flags', 'administration.settings.locale_management', 'administration.settings.notification_templates', 'administration.settings.branding'] },
          { id: 'administration.security', label: 'Security', featureIds: ['administration.security.security_policies', 'administration.security.mfa_management', 'administration.security.session_management', 'administration.security.ip_allowlisting'] },
        ],
      },
    ],
  },
];