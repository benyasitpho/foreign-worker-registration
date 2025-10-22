ALTER TABLE `workers` ADD `employmentStatus` varchar(50) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `workers` ADD `resignationDate` date;--> statement-breakpoint
ALTER TABLE `workers` ADD `profilePhotoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `workers` ADD `documentsUrl` text;