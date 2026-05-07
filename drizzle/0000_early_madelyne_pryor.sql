CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`genre` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
