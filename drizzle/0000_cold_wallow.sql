CREATE TABLE `ad_campaign_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`recorded_date` integer NOT NULL,
	`impressions` integer DEFAULT 0,
	`clicks` integer DEFAULT 0,
	`conversions` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`spend_for_period` real DEFAULT 0,
	`entered_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `ad_campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ad_campaign_metrics_campaign` ON `ad_campaign_metrics` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `idx_ad_campaign_metrics_date` ON `ad_campaign_metrics` (`recorded_date`);--> statement-breakpoint
CREATE TABLE `ad_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`platform` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`objective` text,
	`budget` real,
	`spend` real DEFAULT 0,
	`target_audience` text,
	`creative_url` text,
	`start_date` integer,
	`end_date` integer,
	`notes` text,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ad_campaigns_platform` ON `ad_campaigns` (`platform`);--> statement-breakpoint
CREATE INDEX `idx_ad_campaigns_status` ON `ad_campaigns` (`status`);--> statement-breakpoint
CREATE TABLE `admin_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`content` text NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_notes_entity` ON `admin_notes` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `affiliate` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`commission_rate_basis_points` integer DEFAULT 1000 NOT NULL,
	`status` text DEFAULT 'prospecting' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `affiliate_click` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate_link_id` text NOT NULL,
	`clicked_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_affiliate_click_link` ON `affiliate_click` (`affiliate_link_id`);--> statement-breakpoint
CREATE TABLE `affiliate_conversion` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate_click_id` text NOT NULL,
	`affiliate_id` text NOT NULL,
	`order_value_cents` integer NOT NULL,
	`commission_cents` integer NOT NULL,
	`fraud_flag` integer DEFAULT false NOT NULL,
	`fraud_reason` text,
	`payout_status` text DEFAULT 'not_paid_no_gateway' NOT NULL,
	`converted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_affiliate_conversion_affiliate` ON `affiliate_conversion` (`affiliate_id`);--> statement-breakpoint
CREATE TABLE `affiliate_link` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate_id` text NOT NULL,
	`tracking_code` text NOT NULL,
	`destination_url` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `affiliate_link_tracking_code_unique` ON `affiliate_link` (`tracking_code`);--> statement-breakpoint
CREATE INDEX `idx_affiliate_link_affiliate` ON `affiliate_link` (`affiliate_id`);--> statement-breakpoint
CREATE TABLE `agent_execution_step` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`step_index` integer NOT NULL,
	`phase` text NOT NULL,
	`agent_role` text NOT NULL,
	`input` text,
	`output` text,
	`tokens_used` integer,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `operation_run`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_agent_step_run` ON `agent_execution_step` (`run_id`);--> statement-breakpoint
CREATE INDEX `idx_agent_step_phase` ON `agent_execution_step` (`phase`);--> statement-breakpoint
CREATE TABLE `analysis_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`framework_id` text NOT NULL,
	`project_name` text NOT NULL,
	`assessor_id` text,
	`status` text DEFAULT 'not_started' NOT NULL,
	`overall_score` real,
	`completed_items` integer DEFAULT 0 NOT NULL,
	`total_items` integer NOT NULL,
	`item_scores` text NOT NULL,
	`metadata` text,
	`health_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`framework_id`) REFERENCES `analysis_frameworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_assessments_framework` ON `analysis_assessments` (`framework_id`);--> statement-breakpoint
CREATE INDEX `idx_assessments_project` ON `analysis_assessments` (`project_name`);--> statement-breakpoint
CREATE INDEX `idx_assessments_status` ON `analysis_assessments` (`status`);--> statement-breakpoint
CREATE TABLE `analysis_frameworks` (
	`id` text PRIMARY KEY NOT NULL,
	`category_key` text NOT NULL,
	`category_name` text NOT NULL,
	`description` text,
	`analysis_types` text NOT NULL,
	`total_items` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analysis_frameworks_category_key_unique` ON `analysis_frameworks` (`category_key`);--> statement-breakpoint
CREATE INDEX `idx_frameworks_key` ON `analysis_frameworks` (`category_key`);--> statement-breakpoint
CREATE TABLE `analytics_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`health_score` integer NOT NULL,
	`open_rate_score` integer NOT NULL,
	`click_rate_score` integer NOT NULL,
	`bounce_rate_score` integer NOT NULL,
	`contact_health_score` integer NOT NULL,
	`input_snapshot` text NOT NULL,
	`triggered_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analytics_snapshots_created` ON `analytics_snapshots` (`created_at`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`action` text NOT NULL,
	`user_id` text,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_created_at` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `banners` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`placement` text DEFAULT 'top' NOT NULL,
	`severity` text DEFAULT 'info' NOT NULL,
	`cta_text` text,
	`cta_url` text,
	`media_id` text,
	`start_date` integer,
	`end_date` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`priority` integer DEFAULT 0,
	`health_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_banners_placement` ON `banners` (`placement`);--> statement-breakpoint
CREATE INDEX `idx_banners_active` ON `banners` (`is_active`);--> statement-breakpoint
CREATE TABLE `blog_authors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`social_links` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `blog_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`color` text,
	`sort_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_name_unique` ON `blog_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_slug_unique` ON `blog_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_post_categories` (
	`post_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `category_id`),
	FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blog_post_tags` (
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `blog_tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_post_tags_tag` ON `blog_post_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`cover_image` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false,
	`author_id` text,
	`meta_title` text,
	`meta_description` text,
	`seo_readiness_score` integer,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `blog_authors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_status` ON `blog_posts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_posts_published_at` ON `blog_posts` (`published_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_author` ON `blog_posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_featured` ON `blog_posts` (`featured`);--> statement-breakpoint
CREATE TABLE `blog_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`subscribed_at` integer NOT NULL,
	`unsubscribed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_subscribers_email_unique` ON `blog_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `blog_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_tags_name_unique` ON `blog_tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `blog_tags_slug_unique` ON `blog_tags` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_views` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`session_id` text NOT NULL,
	`viewed_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_views_post` ON `blog_views` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_views_session` ON `blog_views` (`post_id`,`session_id`);--> statement-breakpoint
CREATE TABLE `brand_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`file_path` text,
	`description` text,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_brand_assets_category` ON `brand_assets` (`category`);--> statement-breakpoint
CREATE TABLE `brand_health_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_date` integer NOT NULL,
	`health_score` integer NOT NULL,
	`total_mentions` integer DEFAULT 0 NOT NULL,
	`positive_mentions` integer DEFAULT 0 NOT NULL,
	`neutral_mentions` integer DEFAULT 0 NOT NULL,
	`negative_mentions` integer DEFAULT 0 NOT NULL,
	`competitors_tracked` integer DEFAULT 0 NOT NULL,
	`campaign_id` text,
	`label` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_brand_health_snapshots_campaign` ON `brand_health_snapshots` (`campaign_id`);--> statement-breakpoint
CREATE TABLE `brand_mentions` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`source_name` text,
	`excerpt` text NOT NULL,
	`url` text,
	`collected_at` integer NOT NULL,
	`sentiment` text,
	`sentiment_explanation` text,
	`topics` text,
	`created_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_brand_mentions_source` ON `brand_mentions` (`source`);--> statement-breakpoint
CREATE INDEX `idx_brand_mentions_sentiment` ON `brand_mentions` (`sentiment`);--> statement-breakpoint
CREATE TABLE `broadcasts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`html_content` text NOT NULL,
	`profile_id` text,
	`audience_type` text DEFAULT 'list' NOT NULL,
	`audience_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`scheduled_at` integer,
	`started_at` integer,
	`completed_at` integer,
	`throttle_per_minute` integer DEFAULT 60,
	`total_sent` integer DEFAULT 0,
	`total_failed` integer DEFAULT 0,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `email_profiles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_broadcasts_status` ON `broadcasts` (`status`);--> statement-breakpoint
CREATE TABLE `business_partner` (
	`id` text PRIMARY KEY NOT NULL,
	`partner_name` text NOT NULL,
	`partner_type` text NOT NULL,
	`relationship_status` text DEFAULT 'prospecting' NOT NULL,
	`contact_name` text,
	`contact_email` text,
	`notes` text,
	`started_at` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_business_partner_status` ON `business_partner` (`relationship_status`);--> statement-breakpoint
CREATE TABLE `campaign_recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message_id` text,
	`sent_at` integer,
	`opened_at` integer,
	`clicked_at` integer,
	`bounced_at` integer,
	`error` text,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_campaign_recipients_campaign` ON `campaign_recipients` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `idx_campaign_recipients_contact` ON `campaign_recipients` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_campaign_recipients_status` ON `campaign_recipients` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_campaign_recipients_campaign_contact` ON `campaign_recipients` (`campaign_id`,`contact_id`);--> statement-breakpoint
CREATE TABLE `campaign_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`name` text NOT NULL,
	`subject` text,
	`template_id` text,
	`percentage` integer DEFAULT 50,
	`recipient_count` integer DEFAULT 0,
	`open_count` integer DEFAULT 0,
	`click_count` integer DEFAULT 0,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_campaign_variants_campaign` ON `campaign_variants` (`campaign_id`);--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'email' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`audience_type` text,
	`audience_id` text,
	`audience_count` integer DEFAULT 0,
	`email_profile_id` text,
	`template_id` text,
	`subject` text,
	`scheduled_at` integer,
	`started_at` integer,
	`completed_at` integer,
	`throttle_per_minute` integer DEFAULT 60,
	`total_sent` integer DEFAULT 0,
	`total_opened` integer DEFAULT 0,
	`total_clicked` integer DEFAULT 0,
	`total_bounced` integer DEFAULT 0,
	`total_unsubscribed` integer DEFAULT 0,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_campaigns_status` ON `campaigns` (`status`);--> statement-breakpoint
CREATE TABLE `case_study` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`client_context` text NOT NULL,
	`challenge` text NOT NULL,
	`solution_text` text NOT NULL,
	`outcome` text NOT NULL,
	`evidence_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`evidence_id`) REFERENCES `evidence_record`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_case_study_status` ON `case_study` (`status`);--> statement-breakpoint
CREATE TABLE `chat_message_evals` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`eval_type` text NOT NULL,
	`score` integer,
	`passed` integer NOT NULL,
	`details` text,
	`evaluated_at` integer NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_chat_evals_message` ON `chat_message_evals` (`message_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_evals_type` ON `chat_message_evals` (`eval_type`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`request_id` text,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`is_edited` integer DEFAULT false,
	`edited_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`request_id`) REFERENCES `chat_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_chat_messages_session` ON `chat_messages` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_request` ON `chat_messages` (`request_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_role` ON `chat_messages` (`role`);--> statement-breakpoint
CREATE TABLE `chat_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`contact_id` text,
	`subject` text,
	`category` text,
	`status` text DEFAULT 'new' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`assigned_to` text,
	`resolved_at` integer,
	`closed_at` integer,
	`response_quality_score` integer,
	`qualification_score` integer,
	`qualification_tier` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_chat_requests_session` ON `chat_requests` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_requests_status` ON `chat_requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_chat_requests_assigned` ON `chat_requests` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `idx_chat_requests_priority` ON `chat_requests` (`priority`);--> statement-breakpoint
CREATE INDEX `idx_chat_requests_qualification_tier` ON `chat_requests` (`qualification_tier`);--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_email` text,
	`visitor_name` text,
	`session_token` text NOT NULL,
	`ip_hash` text,
	`user_agent` text,
	`status` text DEFAULT 'active' NOT NULL,
	`email_captured_at` integer,
	`started_at` integer NOT NULL,
	`last_message_at` integer,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chat_sessions_session_token_unique` ON `chat_sessions` (`session_token`);--> statement-breakpoint
CREATE INDEX `idx_chat_sessions_token` ON `chat_sessions` (`session_token`);--> statement-breakpoint
CREATE INDEX `idx_chat_sessions_status` ON `chat_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_chat_sessions_email` ON `chat_sessions` (`visitor_email`);--> statement-breakpoint
CREATE TABLE `competitor_analysis` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`competitor_name` text NOT NULL,
	`competitor_website` text,
	`offering_summary` text,
	`pricing_notes` text,
	`strengths_weaknesses` text,
	`sample_deliverables` text,
	`status` text DEFAULT 'needs_research' NOT NULL,
	`is_template` integer DEFAULT false NOT NULL,
	`last_researched_at` integer,
	`researched_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_competitor_analysis_service` ON `competitor_analysis` (`service_id`);--> statement-breakpoint
CREATE INDEX `idx_competitor_analysis_status` ON `competitor_analysis` (`status`);--> statement-breakpoint
CREATE TABLE `competitor_benchmark_score` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_type` text NOT NULL,
	`competitor_id` text,
	`dimension` text NOT NULL,
	`score` integer NOT NULL,
	`notes` text,
	`scored_by` text,
	`scored_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`competitor_id`) REFERENCES `competitor_analysis`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_competitor_benchmark_score_competitor` ON `competitor_benchmark_score` (`competitor_id`);--> statement-breakpoint
CREATE INDEX `idx_competitor_benchmark_score_dimension` ON `competitor_benchmark_score` (`dimension`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_competitor_benchmark_score_subject_dim` ON `competitor_benchmark_score` (`subject_type`,`competitor_id`,`dimension`);--> statement-breakpoint
CREATE TABLE `competitor_campaign_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`competitor_id` text NOT NULL,
	`observed_at` integer NOT NULL,
	`channel` text NOT NULL,
	`campaign_type` text NOT NULL,
	`description` text NOT NULL,
	`evidence_url` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`competitor_id`) REFERENCES `competitor_analysis`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_competitor_campaign_obs_competitor` ON `competitor_campaign_observations` (`competitor_id`);--> statement-breakpoint
CREATE INDEX `idx_competitor_campaign_obs_observed_at` ON `competitor_campaign_observations` (`observed_at`);--> statement-breakpoint
CREATE TABLE `contact_events` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`event_type` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_contact_events_contact` ON `contact_events` (`contact_id`);--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text NOT NULL,
	`role` text,
	`industry` text NOT NULL,
	`interest_areas` text NOT NULL,
	`project_stage` text NOT NULL,
	`budget_range` text,
	`timeline` text NOT NULL,
	`message` text NOT NULL,
	`consent` integer DEFAULT false NOT NULL,
	`lead_score` integer DEFAULT 0,
	`lead_tier` text DEFAULT 'cold',
	`qualification_stage` text DEFAULT 'unqualified',
	`assigned_to` text,
	`alert_sent_at` integer,
	`status` text DEFAULT 'new' NOT NULL,
	`ip_hash` text,
	`user_agent` text,
	`source_page` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contact_status` ON `contact_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_contact_lead_tier` ON `contact_submissions` (`lead_tier`);--> statement-breakpoint
CREATE INDEX `idx_contact_qualification_stage` ON `contact_submissions` (`qualification_stage`);--> statement-breakpoint
CREATE INDEX `idx_contact_industry` ON `contact_submissions` (`industry`);--> statement-breakpoint
CREATE INDEX `idx_contact_created_at` ON `contact_submissions` (`created_at`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`company` text,
	`phone` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`tags` text,
	`custom_fields` text,
	`lead_score` integer DEFAULT 0,
	`status` text DEFAULT 'active' NOT NULL,
	`subscribed_at` integer,
	`unsubscribed_at` integer,
	`lifecycle_stage` text DEFAULT 'new',
	`activation_score` integer,
	`last_engaged_at` integer,
	`date_of_birth` integer,
	`customer_anniversary_date` integer,
	`country` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contacts_email_unique` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `idx_contacts_email` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `idx_contacts_status` ON `contacts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_contacts_source` ON `contacts` (`source`);--> statement-breakpoint
CREATE INDEX `idx_contacts_lifecycle_stage` ON `contacts` (`lifecycle_stage`);--> statement-breakpoint
CREATE INDEX `idx_contacts_dob` ON `contacts` (`date_of_birth`);--> statement-breakpoint
CREATE INDEX `idx_contacts_anniversary` ON `contacts` (`customer_anniversary_date`);--> statement-breakpoint
CREATE TABLE `content_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text,
	`asset_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`slides` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`cover_image` text,
	`metadata` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `marketing_content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_assets_type` ON `content_assets` (`asset_type`);--> statement-breakpoint
CREATE INDEX `idx_assets_status` ON `content_assets` (`status`);--> statement-breakpoint
CREATE TABLE `content_engagement_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`recorded_date` integer NOT NULL,
	`views` integer DEFAULT 0,
	`leads_generated` integer DEFAULT 0,
	`entered_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `marketing_content`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_content_engagement_content` ON `content_engagement_metrics` (`content_id`);--> statement-breakpoint
CREATE TABLE `content_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`page_slug` text NOT NULL,
	`section` text NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`is_active` integer DEFAULT true NOT NULL,
	`updated_by` text,
	`safety_score` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_content_overrides_page` ON `content_overrides` (`page_slug`);--> statement-breakpoint
CREATE TABLE `content_personas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`tone_notes` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`persona_id` text,
	`title` text NOT NULL,
	`target_content_type` text NOT NULL,
	`scheduled_date` integer,
	`status` text DEFAULT 'proposed' NOT NULL,
	`generated_content_id` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`persona_id`) REFERENCES `content_personas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`generated_content_id`) REFERENCES `marketing_content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_content_topics_status` ON `content_topics` (`status`);--> statement-breakpoint
CREATE TABLE `content_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`changed_by` text,
	`change_note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `marketing_content`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_content_ver_content` ON `content_versions` (`content_id`);--> statement-breakpoint
CREATE TABLE `cro_friction_finding` (
	`id` text PRIMARY KEY NOT NULL,
	`page_url` text NOT NULL,
	`friction_type` text NOT NULL,
	`severity` integer NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`observed_at` integer NOT NULL,
	`observed_by` text,
	`fixed_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cro_friction_status` ON `cro_friction_finding` (`status`);--> statement-breakpoint
CREATE INDEX `idx_cro_friction_page` ON `cro_friction_finding` (`page_url`);--> statement-breakpoint
CREATE TABLE `customer_lifecycle` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_email` text NOT NULL,
	`stage` text DEFAULT 'unknown' NOT NULL,
	`churn_risk` text DEFAULT 'unknown' NOT NULL,
	`days_since_last_activity` integer,
	`computed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_lifecycle_contact_email_unique` ON `customer_lifecycle` (`contact_email`);--> statement-breakpoint
CREATE INDEX `idx_customer_lifecycle_stage` ON `customer_lifecycle` (`stage`);--> statement-breakpoint
CREATE TABLE `demo_showcase` (
	`id` text PRIMARY KEY NOT NULL,
	`demo_key` text NOT NULL,
	`source_num` integer,
	`page_route` text,
	`name` text NOT NULL,
	`flow_summary` text NOT NULL,
	`value_story` text NOT NULL,
	`backing_module_keys` text NOT NULL,
	`readiness` text DEFAULT 'not_started' NOT NULL,
	`gaps_disclosed` text,
	`last_verified_at` integer,
	`verified_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demo_showcase_demo_key_unique` ON `demo_showcase` (`demo_key`);--> statement-breakpoint
CREATE TABLE `email_compose_log` (
	`id` text PRIMARY KEY NOT NULL,
	`to` text NOT NULL,
	`subject` text NOT NULL,
	`html_length` integer NOT NULL,
	`profile_id` text,
	`readiness_score` integer,
	`sent` integer DEFAULT false NOT NULL,
	`error_message` text,
	`triggered_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_email_compose_log_created` ON `email_compose_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `email_events` (
	`id` text PRIMARY KEY NOT NULL,
	`email_message_id` text,
	`recipient_id` text,
	`contact_id` text NOT NULL,
	`campaign_id` text,
	`event_type` text NOT NULL,
	`link_url` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`email_message_id`) REFERENCES `email_messages`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`recipient_id`) REFERENCES `campaign_recipients`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_email_events_contact` ON `email_events` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_email_events_campaign` ON `email_events` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `idx_email_events_type` ON `email_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `idx_email_events_recipient` ON `email_events` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `idx_email_events_created` ON `email_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `email_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient_id` text,
	`contact_id` text NOT NULL,
	`campaign_id` text,
	`profile_id` text,
	`subject` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`sent_at` integer,
	`message_id` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `campaign_recipients`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`profile_id`) REFERENCES `email_profiles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_email_messages_contact` ON `email_messages` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_email_messages_campaign` ON `email_messages` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `idx_email_messages_status` ON `email_messages` (`status`);--> statement-breakpoint
CREATE TABLE `email_profile_smtp` (
	`profile_id` text NOT NULL,
	`smtp_config_id` text NOT NULL,
	PRIMARY KEY(`profile_id`, `smtp_config_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `email_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`smtp_config_id`) REFERENCES `smtp_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `email_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`from_name` text NOT NULL,
	`from_email` text NOT NULL,
	`reply_to` text,
	`signature` text,
	`is_default` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`readiness_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `email_template_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`version` integer NOT NULL,
	`subject` text NOT NULL,
	`html_content` text NOT NULL,
	`text_content` text,
	`changed_by` text,
	`changed_at` integer NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_template_versions_template` ON `email_template_versions` (`template_id`);--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`subject` text NOT NULL,
	`html_content` text NOT NULL,
	`text_content` text,
	`variables` text,
	`is_active` integer DEFAULT true NOT NULL,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_routes` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`profile_id` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `email_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_routes_event_type_unique` ON `event_routes` (`event_type`);--> statement-breakpoint
CREATE TABLE `evidence_record` (
	`id` text PRIMARY KEY NOT NULL,
	`module_key` text NOT NULL,
	`claim_class` text NOT NULL,
	`claim_text` text NOT NULL,
	`source_ref` text NOT NULL,
	`source_table` text,
	`confidence` text,
	`observed_at` integer NOT NULL,
	`valid_until` integer,
	`created_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_evidence_record_module` ON `evidence_record` (`module_key`);--> statement-breakpoint
CREATE INDEX `idx_evidence_record_class` ON `evidence_record` (`claim_class`);--> statement-breakpoint
CREATE INDEX `idx_evidence_record_source` ON `evidence_record` (`source_ref`);--> statement-breakpoint
CREATE TABLE `feature_flag_active` (
	`flag_id` text PRIMARY KEY NOT NULL,
	`version_id` text NOT NULL,
	`activated_at` integer NOT NULL,
	`activated_by` text,
	FOREIGN KEY (`flag_id`) REFERENCES `feature_flags`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`version_id`) REFERENCES `feature_flag_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `feature_flag_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`flag_id` text NOT NULL,
	`version` integer NOT NULL,
	`config` text,
	`changed_by` text,
	`changed_at` integer NOT NULL,
	FOREIGN KEY (`flag_id`) REFERENCES `feature_flags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_flag_versions_flag` ON `feature_flag_versions` (`flag_id`);--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`module` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0,
	`readiness_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_flags_key_unique` ON `feature_flags` (`key`);--> statement-breakpoint
CREATE INDEX `idx_feature_flags_key` ON `feature_flags` (`key`);--> statement-breakpoint
CREATE INDEX `idx_feature_flags_module` ON `feature_flags` (`module`);--> statement-breakpoint
CREATE TABLE `festival_calendar` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`occasion_date` integer NOT NULL,
	`country` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `festival_calendar_code_unique` ON `festival_calendar` (`code`);--> statement-breakpoint
CREATE INDEX `idx_festival_calendar_date` ON `festival_calendar` (`occasion_date`);--> statement-breakpoint
CREATE INDEX `idx_festival_calendar_country` ON `festival_calendar` (`country`);--> statement-breakpoint
CREATE TABLE `geo_mention_observation` (
	`id` text PRIMARY KEY NOT NULL,
	`engine` text NOT NULL,
	`query_text` text NOT NULL,
	`talentshill_mentioned` integer NOT NULL,
	`mention_position` integer,
	`competitors_also_mentioned` text,
	`notes` text,
	`observed_at` integer NOT NULL,
	`observed_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_geo_mention_engine` ON `geo_mention_observation` (`engine`);--> statement-breakpoint
CREATE INDEX `idx_geo_mention_observed` ON `geo_mention_observation` (`observed_at`);--> statement-breakpoint
CREATE TABLE `golden_path` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`evidence_doc_path` text NOT NULL,
	`verified_at` integer NOT NULL,
	`verified_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `golden_path_code_unique` ON `golden_path` (`code`);--> statement-breakpoint
CREATE TABLE `group_members` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_group_members_user` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_name_unique` ON `groups` (`name`);--> statement-breakpoint
CREATE TABLE `growth_brief` (
	`id` text PRIMARY KEY NOT NULL,
	`brief_text` text NOT NULL,
	`top_opportunity_dimension` text,
	`growth_readiness_score` real,
	`evidence_count` integer NOT NULL,
	`generated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_growth_brief_generated` ON `growth_brief` (`generated_at`);--> statement-breakpoint
CREATE TABLE `growth_readiness_snapshot` (
	`id` text PRIMARY KEY NOT NULL,
	`score` real,
	`dimensions_included` integer NOT NULL,
	`dimensions_excluded` integer NOT NULL,
	`confidence` text NOT NULL,
	`computed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_growth_readiness_computed` ON `growth_readiness_snapshot` (`computed_at`);--> statement-breakpoint
CREATE TABLE `health_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`health_score` integer NOT NULL,
	`job_runner_score` integer NOT NULL,
	`recent_errors_score` integer NOT NULL,
	`job_failure_rate_score` integer NOT NULL,
	`db_size_score` integer NOT NULL,
	`input_snapshot` text NOT NULL,
	`triggered_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_health_snapshots_created` ON `health_snapshots` (`created_at`);--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`file_name` text NOT NULL,
	`total_rows` integer DEFAULT 0,
	`processed_rows` integer DEFAULT 0,
	`imported_count` integer DEFAULT 0,
	`duplicate_count` integer DEFAULT 0,
	`error_count` integer DEFAULT 0,
	`status` text DEFAULT 'pending' NOT NULL,
	`column_mapping` text,
	`errors` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_import_jobs_status` ON `import_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_import_jobs_created` ON `import_jobs` (`created_at`);--> statement-breakpoint
CREATE TABLE `industries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`description` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`content_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `industries_slug_unique` ON `industries` (`slug`);--> statement-breakpoint
CREATE TABLE `influencer_campaign_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`recorded_date` integer NOT NULL,
	`reach` integer DEFAULT 0,
	`clicks` integer DEFAULT 0,
	`sales` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`entered_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `influencer_campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_influencer_campaign_metrics_campaign` ON `influencer_campaign_metrics` (`campaign_id`);--> statement-breakpoint
CREATE TABLE `influencer_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`influencer_name` text NOT NULL,
	`platform` text NOT NULL,
	`status` text DEFAULT 'prospecting' NOT NULL,
	`deliverables` text,
	`agreed_fee` real,
	`contact_email` text,
	`readiness_score` integer,
	`audience_fit_score` integer,
	`campaign_feedback_notes` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_influencer_campaigns_status` ON `influencer_campaigns` (`status`);--> statement-breakpoint
CREATE TABLE `integration_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`integration_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'disconnected' NOT NULL,
	`credentials` text,
	`settings` text,
	`connected_by` text,
	`connected_at` integer,
	`last_sync_at` integer,
	`error_message` text,
	`readiness_score` integer,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_int_accounts_integration` ON `integration_accounts` (`integration_id`);--> statement-breakpoint
CREATE INDEX `idx_int_accounts_status` ON `integration_accounts` (`status`);--> statement-breakpoint
CREATE TABLE `integration_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `integration_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_int_creds_account` ON `integration_credentials` (`account_id`);--> statement-breakpoint
CREATE TABLE `integration_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`action` text NOT NULL,
	`status` text NOT NULL,
	`request` text,
	`response` text,
	`duration_ms` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `integration_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_int_logs_account` ON `integration_logs` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_int_logs_action` ON `integration_logs` (`action`);--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`icon_url` text,
	`is_available` integer DEFAULT true,
	`config_schema` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `integrations_provider_key_unique` ON `integrations` (`provider_key`);--> statement-breakpoint
CREATE TABLE `job_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`level` text DEFAULT 'info' NOT NULL,
	`message` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_job_logs_job` ON `job_logs` (`job_id`);--> statement-breakpoint
CREATE TABLE `job_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`result` text,
	`error` text,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_job_runs_job` ON `job_runs` (`job_id`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payload` text,
	`priority` integer DEFAULT 0,
	`max_retries` integer DEFAULT 3,
	`attempts` integer DEFAULT 0,
	`scheduled_at` integer,
	`started_at` integer,
	`completed_at` integer,
	`error` text,
	`created_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_jobs_status` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_jobs_type` ON `jobs` (`type`);--> statement-breakpoint
CREATE INDEX `idx_jobs_scheduled` ON `jobs` (`scheduled_at`);--> statement-breakpoint
CREATE TABLE `kpi_snapshot` (
	`id` text PRIMARY KEY NOT NULL,
	`dimension` text NOT NULL,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`value` real,
	`sample_size` integer DEFAULT 0 NOT NULL,
	`confidence` text DEFAULT 'unknown' NOT NULL,
	`unit` text NOT NULL,
	`computed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_kpi_snapshot_dimension` ON `kpi_snapshot` (`dimension`);--> statement-breakpoint
CREATE INDEX `idx_kpi_snapshot_period` ON `kpi_snapshot` (`period_start`,`period_end`);--> statement-breakpoint
CREATE TABLE `lead_next_best_action` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text NOT NULL,
	`tier` text NOT NULL,
	`score` integer NOT NULL,
	`computed_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `contact_submissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lead_nba_submission` ON `lead_next_best_action` (`submission_id`);--> statement-breakpoint
CREATE INDEX `idx_lead_nba_action` ON `lead_next_best_action` (`action`);--> statement-breakpoint
CREATE TABLE `list_members` (
	`list_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`list_id`, `contact_id`),
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_list_members_list` ON `list_members` (`list_id`);--> statement-breakpoint
CREATE INDEX `idx_list_members_contact` ON `list_members` (`contact_id`);--> statement-breakpoint
CREATE TABLE `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'static' NOT NULL,
	`segment_rules` text,
	`member_count` integer DEFAULT 0,
	`last_synced_at` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `maintenance_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`score` integer NOT NULL,
	`enabled` integer NOT NULL,
	`enforcement_matches_expected` integer NOT NULL,
	`observed_status_code` integer,
	`scheduled_end_valid` integer,
	`message_substantive` integer NOT NULL,
	`triggered_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_maintenance_checks_created` ON `maintenance_checks` (`created_at`);--> statement-breakpoint
CREATE TABLE `market_research_briefs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`topic` text NOT NULL,
	`source_notes` text,
	`findings` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`readiness_score` integer,
	`som_estimate_usd` integer,
	`competition_level` text,
	`risk_level` text,
	`strategic_fit_score` integer,
	`opportunity_score` integer,
	`opportunity_rank` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_market_research_status` ON `market_research_briefs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_market_research_opportunity_score` ON `market_research_briefs` (`opportunity_score`);--> statement-breakpoint
CREATE TABLE `marketing_activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`demo_key` text NOT NULL,
	`channel` text NOT NULL,
	`action` text NOT NULL,
	`outcome_metric_name` text,
	`outcome_metric_value` real,
	`notes` text,
	`logged_by` text NOT NULL,
	`logged_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_marketing_activity_log_demo_key` ON `marketing_activity_log` (`demo_key`);--> statement-breakpoint
CREATE TABLE `marketing_content` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content_type` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`excerpt` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`tags` text,
	`category` text,
	`cover_image` text,
	`author_id` text,
	`metadata` text,
	`readiness_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `marketing_content_slug_unique` ON `marketing_content` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_mktg_content_type` ON `marketing_content` (`content_type`);--> statement-breakpoint
CREATE INDEX `idx_mktg_content_status` ON `marketing_content` (`status`);--> statement-breakpoint
CREATE INDEX `idx_mktg_content_slug` ON `marketing_content` (`slug`);--> statement-breakpoint
CREATE TABLE `marketing_workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`current_step` integer DEFAULT 0 NOT NULL,
	`content_id` text,
	`asset_id` text,
	`share_link_ids` text,
	`list_id` text,
	`campaign_id` text,
	`approved_by` text,
	`approved_at` integer,
	`scheduled_at` integer,
	`completed_at` integer,
	`metadata` text,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `marketing_content`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_id`) REFERENCES `content_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_workflows_status` ON `marketing_workflows` (`status`);--> statement-breakpoint
CREATE INDEX `idx_workflows_step` ON `marketing_workflows` (`current_step`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`path` text NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`tags` text,
	`folder` text,
	`uploaded_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`readiness_score` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `module_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`module_key` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`built_status` text DEFAULT 'not_yet_cataloged' NOT NULL,
	`api_route_count` integer DEFAULT 0 NOT NULL,
	`has_admin_ui` integer DEFAULT false NOT NULL,
	`missing_items` text,
	`source_doc` text,
	`last_verified_at` integer,
	`verified_by` text,
	`drift_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `module_registry_module_key_unique` ON `module_registry` (`module_key`);--> statement-breakpoint
CREATE INDEX `idx_module_registry_status` ON `module_registry` (`built_status`);--> statement-breakpoint
CREATE TABLE `occasion_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`occasion_type` text NOT NULL,
	`festival_code` text,
	`template_id` text,
	`channel` text NOT NULL,
	`subject` text,
	`message_body` text NOT NULL,
	`status` text DEFAULT 'logged' NOT NULL,
	`failure_reason` text,
	`triggered_at` integer NOT NULL,
	`triggered_date` text NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`festival_code`) REFERENCES `festival_calendar`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `occasion_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_occasion_messages_contact` ON `occasion_messages` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_occasion_messages_type` ON `occasion_messages` (`occasion_type`);--> statement-breakpoint
CREATE INDEX `idx_occasion_messages_triggered_at` ON `occasion_messages` (`triggered_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_occasion_messages_contact_type_day` ON `occasion_messages` (`contact_id`,`occasion_type`,`festival_code`,`triggered_date`);--> statement-breakpoint
CREATE TABLE `occasion_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`occasion_type` text NOT NULL,
	`festival_code` text,
	`channel` text NOT NULL,
	`name` text NOT NULL,
	`subject` text,
	`body` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`festival_code`) REFERENCES `festival_calendar`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_occasion_templates_type` ON `occasion_templates` (`occasion_type`);--> statement-breakpoint
CREATE INDEX `idx_occasion_templates_festival` ON `occasion_templates` (`festival_code`);--> statement-breakpoint
CREATE TABLE `operation_run` (
	`id` text PRIMARY KEY NOT NULL,
	`module_key` text NOT NULL,
	`operation_name` text NOT NULL,
	`execution_mode` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`input_payload` text,
	`output_payload` text,
	`error_message` text,
	`tokens_used` integer,
	`triggered_by` text,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_operation_run_module` ON `operation_run` (`module_key`);--> statement-breakpoint
CREATE INDEX `idx_operation_run_status` ON `operation_run` (`status`);--> statement-breakpoint
CREATE INDEX `idx_operation_run_mode` ON `operation_run` (`execution_mode`);--> statement-breakpoint
CREATE TABLE `operation_run_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`status` text NOT NULL,
	`changed_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `operation_run`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_run_status_history_run` ON `operation_run_status_history` (`run_id`);--> statement-breakpoint
CREATE TABLE `opportunity_candidate` (
	`id` text PRIMARY KEY NOT NULL,
	`dimension` text NOT NULL,
	`gap_type` text NOT NULL,
	`kpi_snapshot_id` text,
	`impact_score` integer NOT NULL,
	`feasibility_score` integer NOT NULL,
	`confidence_weight` real NOT NULL,
	`rank_score` real NOT NULL,
	`recommended_module_key` text NOT NULL,
	`rationale` text NOT NULL,
	`computed_at` integer NOT NULL,
	FOREIGN KEY (`kpi_snapshot_id`) REFERENCES `kpi_snapshot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_opportunity_candidate_dimension` ON `opportunity_candidate` (`dimension`);--> statement-breakpoint
CREATE INDEX `idx_opportunity_candidate_rank` ON `opportunity_candidate` (`rank_score`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE INDEX `idx_permissions_resource` ON `permissions` (`resource`);--> statement-breakpoint
CREATE TABLE `pmf_survey_response` (
	`id` text PRIMARY KEY NOT NULL,
	`respondent_email` text NOT NULL,
	`how_would_you_feel` text NOT NULL,
	`main_benefit` text,
	`who_would_benefit` text,
	`responded_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `positioning_statement` (
	`id` text PRIMARY KEY NOT NULL,
	`for_who` text NOT NULL,
	`who_need` text NOT NULL,
	`category_name` text NOT NULL,
	`key_benefit` text NOT NULL,
	`unlike_alternative` text NOT NULL,
	`differentiator` text NOT NULL,
	`confirmed_by` text NOT NULL,
	`confirmed_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rag_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`query_hash` text NOT NULL,
	`query` text NOT NULL,
	`results` text NOT NULL,
	`hit_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rag_cache_query_hash_unique` ON `rag_cache` (`query_hash`);--> statement-breakpoint
CREATE TABLE `rag_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`content` text NOT NULL,
	`token_count` integer,
	`metadata` text,
	`hash` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `rag_documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_rag_chunks_doc` ON `rag_chunks` (`document_id`);--> statement-breakpoint
CREATE TABLE `rag_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`config` text NOT NULL,
	`is_active` integer DEFAULT false,
	`changed_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rag_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`source_type` text NOT NULL,
	`source_url` text,
	`file_path` text,
	`mime_type` text,
	`size` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`chunk_count` integer DEFAULT 0,
	`metadata` text,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rag_docs_status` ON `rag_documents` (`status`);--> statement-breakpoint
CREATE INDEX `idx_rag_docs_source_type` ON `rag_documents` (`source_type`);--> statement-breakpoint
CREATE TABLE `rag_embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`chunk_id` text NOT NULL,
	`model` text NOT NULL,
	`dimensions` integer NOT NULL,
	`vector` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chunk_id`) REFERENCES `rag_chunks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_rag_embed_chunk` ON `rag_embeddings` (`chunk_id`);--> statement-breakpoint
CREATE TABLE `rag_run_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`metric_name` text NOT NULL,
	`value` real NOT NULL,
	`details` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `rag_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_rag_metrics_run` ON `rag_run_metrics` (`run_id`);--> statement-breakpoint
CREATE TABLE `rag_run_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`step_name` text NOT NULL,
	`status` text NOT NULL,
	`input` text,
	`output` text,
	`duration_ms` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `rag_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_rag_steps_run` ON `rag_run_steps` (`run_id`);--> statement-breakpoint
CREATE TABLE `rag_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`config` text,
	`document_ids` text,
	`started_at` integer,
	`completed_at` integer,
	`error` text,
	`created_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rag_runs_type` ON `rag_runs` (`type`);--> statement-breakpoint
CREATE INDEX `idx_rag_runs_status` ON `rag_runs` (`status`);--> statement-breakpoint
CREATE TABLE `re_engagement_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`channel` text NOT NULL,
	`trigger_reason` text NOT NULL,
	`message_body` text NOT NULL,
	`phone_number_snapshot` text,
	`status` text DEFAULT 'logged' NOT NULL,
	`failure_reason` text,
	`triggered_at` integer NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_re_engagement_contact` ON `re_engagement_messages` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_re_engagement_channel` ON `re_engagement_messages` (`channel`);--> statement-breakpoint
CREATE INDEX `idx_re_engagement_triggered_at` ON `re_engagement_messages` (`triggered_at`);--> statement-breakpoint
CREATE TABLE `reels` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`platform` text NOT NULL,
	`status` text DEFAULT 'idea' NOT NULL,
	`scheduled_at` integer,
	`published_at` integer,
	`asset_url` text,
	`caption` text,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reels_status` ON `reels` (`status`);--> statement-breakpoint
CREATE INDEX `idx_reels_platform` ON `reels` (`platform`);--> statement-breakpoint
CREATE TABLE `report_share_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`module_key` text NOT NULL,
	`report_type` text NOT NULL,
	`entity_id` text,
	`created_by` text,
	`expires_at` integer,
	`revoked` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `report_share_tokens_token_unique` ON `report_share_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `idx_report_share_tokens_token` ON `report_share_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `idx_report_share_tokens_module` ON `report_share_tokens` (`module_key`);--> statement-breakpoint
CREATE TABLE `research_assessment` (
	`id` text PRIMARY KEY NOT NULL,
	`methodology_num` integer NOT NULL,
	`subject_name` text NOT NULL,
	`dimension_scores` text NOT NULL,
	`composite_score` real NOT NULL,
	`assessed_by` text NOT NULL,
	`assessed_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_research_assessment_methodology` ON `research_assessment` (`methodology_num`);--> statement-breakpoint
CREATE TABLE `research_calculation` (
	`id` text PRIMARY KEY NOT NULL,
	`methodology_num` integer NOT NULL,
	`subject_name` text NOT NULL,
	`inputs_json` text NOT NULL,
	`result_json` text NOT NULL,
	`assessed_by` text NOT NULL,
	`assessed_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_research_calculation_methodology` ON `research_calculation` (`methodology_num`);--> statement-breakpoint
CREATE TABLE `research_methodology_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`num` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`typical_output` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`last_verified_at` integer,
	`verified_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `research_methodology_catalog_num_unique` ON `research_methodology_catalog` (`num`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false NOT NULL,
	`hygiene_score` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `run_events` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`event_type` text NOT NULL,
	`message` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_run_events_run` ON `run_events` (`run_id`);--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`entity_id` text,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`config` text,
	`started_at` integer,
	`completed_at` integer,
	`created_by` text,
	`health_score` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_runs_type` ON `runs` (`type`);--> statement-breakpoint
CREATE INDEX `idx_runs_status` ON `runs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_runs_entity` ON `runs` (`entity_id`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`short_desc` text,
	`long_desc` text,
	`icon` text,
	`tags` text,
	`use_cases` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`content_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `share_links` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text,
	`asset_id` text,
	`campaign_id` text,
	`title` text NOT NULL,
	`original_url` text NOT NULL,
	`short_code` text NOT NULL,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`utm_term` text,
	`utm_content` text,
	`click_count` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true,
	`expires_at` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `marketing_content`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_id`) REFERENCES `content_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `share_links_short_code_unique` ON `share_links` (`short_code`);--> statement-breakpoint
CREATE INDEX `idx_links_short_code` ON `share_links` (`short_code`);--> statement-breakpoint
CREATE INDEX `idx_links_active` ON `share_links` (`is_active`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_by` text,
	`quality_score` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `smtp_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`host` text NOT NULL,
	`port` integer DEFAULT 587 NOT NULL,
	`secure` integer DEFAULT false NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `survey_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`response_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer_value` text NOT NULL,
	`score_value` integer DEFAULT 0,
	FOREIGN KEY (`response_id`) REFERENCES `survey_responses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_survey_answers_response` ON `survey_answers` (`response_id`);--> statement-breakpoint
CREATE TABLE `survey_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_name` text,
	`email` text,
	`company` text,
	`industry` text,
	`company_size` text,
	`role` text,
	`total_score` integer DEFAULT 0 NOT NULL,
	`maturity_level` text DEFAULT 'beginner' NOT NULL,
	`recommended_path` text,
	`segmentation_tags` text,
	`outreach_priority` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_survey_maturity` ON `survey_responses` (`maturity_level`);--> statement-breakpoint
CREATE INDEX `idx_survey_industry` ON `survey_responses` (`industry`);--> statement-breakpoint
CREATE INDEX `idx_survey_created_at` ON `survey_responses` (`created_at`);--> statement-breakpoint
CREATE TABLE `test_execution` (
	`id` text PRIMARY KEY NOT NULL,
	`module_key` text NOT NULL,
	`execution_mode` text,
	`case_name` text NOT NULL,
	`description` text,
	`expected_result` text NOT NULL,
	`actual_result` text NOT NULL,
	`status` text NOT NULL,
	`test_data` text,
	`log_output` text,
	`executed_at` integer NOT NULL,
	`executed_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_test_execution_module` ON `test_execution` (`module_key`);--> statement-breakpoint
CREATE INDEX `idx_test_execution_status` ON `test_execution` (`status`);--> statement-breakpoint
CREATE TABLE `unsubscribe_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`token` text NOT NULL,
	`campaign_id` text,
	`is_used` integer DEFAULT false NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unsubscribe_tokens_token_unique` ON `unsubscribe_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `idx_unsubscribe_tokens_token` ON `unsubscribe_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `idx_unsubscribe_tokens_contact` ON `unsubscribe_tokens` (`contact_id`);--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`assigned_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_user_roles_user` ON `user_roles` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_roles_role` ON `user_roles` (`role_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`security_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vertical_pack` (
	`id` text PRIMARY KEY NOT NULL,
	`vertical_key` text NOT NULL,
	`vertical_name` text NOT NULL,
	`description` text NOT NULL,
	`real_kpi_dimensions` text NOT NULL,
	`confirmed_by` text NOT NULL,
	`confirmed_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vertical_pack_vertical_key_unique` ON `vertical_pack` (`vertical_key`);--> statement-breakpoint
CREATE TABLE `video_clip_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`source_project_id` text NOT NULL,
	`title` text NOT NULL,
	`start_seconds` integer NOT NULL,
	`end_seconds` integer NOT NULL,
	`target_platform` text NOT NULL,
	`target_aspect_ratio` text NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`output_url` text,
	`notes` text,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_video_clip_plans_source` ON `video_clip_plans` (`source_project_id`);--> statement-breakpoint
CREATE INDEX `idx_video_clip_plans_status` ON `video_clip_plans` (`status`);--> statement-breakpoint
CREATE TABLE `video_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`tool` text NOT NULL,
	`status` text DEFAULT 'planning' NOT NULL,
	`strategy_notes` text,
	`output_url` text,
	`duration_seconds` integer,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_video_projects_status` ON `video_projects` (`status`);--> statement-breakpoint
CREATE TABLE `video_script` (
	`id` text PRIMARY KEY NOT NULL,
	`clip_plan_id` text,
	`topic` text NOT NULL,
	`target_platform` text NOT NULL,
	`script_text` text NOT NULL,
	`model` text NOT NULL,
	`prompt_tokens` integer NOT NULL,
	`completion_tokens` integer NOT NULL,
	`generated_at` integer NOT NULL,
	FOREIGN KEY (`clip_plan_id`) REFERENCES `video_clip_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_video_script_clip_plan` ON `video_script` (`clip_plan_id`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`video_url` text NOT NULL,
	`provider` text DEFAULT 'youtube',
	`thumbnail` text,
	`tags` text,
	`category` text,
	`duration` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`content_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `voice_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`content` text,
	`file_path` text,
	`duration_seconds` integer,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_voice_assets_type` ON `voice_assets` (`type`);--> statement-breakpoint
CREATE TABLE `voice_call_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text,
	`direction` text NOT NULL,
	`phone_number` text,
	`transcript` text NOT NULL,
	`duration_seconds` integer,
	`call_date` integer NOT NULL,
	`qualification_score` integer,
	`qualification_tier` text,
	`consent_recorded` integer,
	`consent_notes` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_voice_call_logs_contact` ON `voice_call_logs` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_voice_call_logs_tier` ON `voice_call_logs` (`qualification_tier`);--> statement-breakpoint
CREATE INDEX `idx_voice_call_logs_date` ON `voice_call_logs` (`call_date`);--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`secret` text,
	`events` text,
	`is_active` integer DEFAULT true,
	`last_triggered_at` integer,
	`fail_count` integer DEFAULT 0,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `integration_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `webinar_registrants` (
	`id` text PRIMARY KEY NOT NULL,
	`webinar_id` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`consent` integer DEFAULT false NOT NULL,
	`registered_at` integer NOT NULL,
	`attended` integer,
	`engagement_notes` text,
	`qualification_score` integer,
	`qualification_tier` text,
	`contact_submission_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`webinar_id`) REFERENCES `webinars`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contact_submission_id`) REFERENCES `contact_submissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_webinar_registrants_webinar` ON `webinar_registrants` (`webinar_id`);--> statement-breakpoint
CREATE INDEX `idx_webinar_registrants_tier` ON `webinar_registrants` (`qualification_tier`);--> statement-breakpoint
CREATE TABLE `webinars` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`topic` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`duration_minutes` integer,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_webinars_status` ON `webinars` (`status`);--> statement-breakpoint
CREATE TABLE `workflow_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`user_id` text,
	`content` text NOT NULL,
	`step_index` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `marketing_workflows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_wf_comments_workflow` ON `workflow_comments` (`workflow_id`);--> statement-breakpoint
CREATE TABLE `youtube_channel_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_date` integer NOT NULL,
	`subscriber_count` integer NOT NULL,
	`total_views` integer NOT NULL,
	`total_watch_time_minutes` integer,
	`notes` text,
	`created_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_youtube_channel_snapshots_date` ON `youtube_channel_snapshots` (`snapshot_date`);--> statement-breakpoint
CREATE TABLE `youtube_videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`external_video_id` text,
	`scheduled_at` integer,
	`published_at` integer,
	`tags` text,
	`readiness_score` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_youtube_videos_status` ON `youtube_videos` (`status`);