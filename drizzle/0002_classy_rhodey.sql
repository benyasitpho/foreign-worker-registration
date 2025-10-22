ALTER TABLE `workers` ADD `title` varchar(50);--> statement-breakpoint
ALTER TABLE `workers` ADD `fullName` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `workers` DROP COLUMN `titleTh`;--> statement-breakpoint
ALTER TABLE `workers` DROP COLUMN `firstNameTh`;--> statement-breakpoint
ALTER TABLE `workers` DROP COLUMN `lastNameTh`;--> statement-breakpoint
ALTER TABLE `workers` DROP COLUMN `titleEn`;--> statement-breakpoint
ALTER TABLE `workers` DROP COLUMN `firstNameEn`;--> statement-breakpoint
ALTER TABLE `workers` DROP COLUMN `lastNameEn`;