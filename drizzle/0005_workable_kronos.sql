ALTER TABLE `users` ADD `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `approvedBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `approvedAt` timestamp;