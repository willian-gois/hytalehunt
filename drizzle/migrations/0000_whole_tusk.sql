CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_article" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"image" text,
	"tags" text[],
	"author" text DEFAULT 'HytaleHunt Team' NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fuma_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" varchar(256) NOT NULL,
	"thread" integer,
	"author" varchar(256) NOT NULL,
	"content" json NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuma_rates" (
	"user_id" varchar(256) NOT NULL,
	"comment_id" integer NOT NULL,
	"like" boolean NOT NULL,
	CONSTRAINT "fuma_rates_user_id_comment_id_pk" PRIMARY KEY("user_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "fuma_roles" (
	"user_id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"can_delete" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launch_quota" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"free_count" integer DEFAULT 0 NOT NULL,
	"premium_count" integer DEFAULT 0 NOT NULL,
	"premium_plus_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "launch_quota_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "seo_article" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"image" text,
	"meta_title" text,
	"meta_description" text,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seo_article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "server" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"website_url" text NOT NULL,
	"logo_url" text NOT NULL,
	"cover_image_url" text,
	"product_image" text,
	"github_url" text,
	"twitter_url" text,
	"tech_stack" text[],
	"pricing" text DEFAULT 'free' NOT NULL,
	"platforms" text[],
	"launch_status" text DEFAULT 'scheduled' NOT NULL,
	"scheduled_launch_date" timestamp,
	"launch_type" text DEFAULT 'free',
	"featured_on_homepage" boolean DEFAULT false,
	"daily_ranking" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	CONSTRAINT "server_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "server_to_category" (
	"server_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "server_to_category_server_id_category_id_pk" PRIMARY KEY("server_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "upvote" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"server_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"stripe_customer_id" text,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "waitlist_submission" (
	"id" text PRIMARY KEY NOT NULL,
	"server_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server" ADD CONSTRAINT "server_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_to_category" ADD CONSTRAINT "server_to_category_server_id_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."server"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_to_category" ADD CONSTRAINT "server_to_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvote" ADD CONSTRAINT "upvote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvote" ADD CONSTRAINT "upvote_server_id_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."server"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_article_slug_idx" ON "blog_article" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_article_published_at_idx" ON "blog_article" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "category_name_idx" ON "category" USING btree ("name");--> statement-breakpoint
CREATE INDEX "comment_idx" ON "fuma_rates" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "seo_article_slug_idx" ON "seo_article" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "server_name_idx" ON "server" USING btree ("name");