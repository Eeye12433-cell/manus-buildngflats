CREATE TABLE `buildingSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buildingName` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100),
	`governorate` varchar(100),
	`postalCode` varchar(20),
	`phoneNumber` varchar(20),
	`email` varchar(320),
	`managerName` varchar(255),
	`totalFloors` int NOT NULL DEFAULT 15,
	`unitsPerFloor` int NOT NULL DEFAULT 4,
	`additionalInfo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buildingSettings_id` PRIMARY KEY(`id`)
);
