-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 03, 2026 at 07:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gabay-ix`
--

-- --------------------------------------------------------

--
-- Table structure for table `sub_allotments`
--

CREATE TABLE `sub_allotments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `saa_number` varchar(255) NOT NULL,
  `date_received` date NOT NULL,
  `program_id` bigint(20) UNSIGNED DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sub_allotments`
--

INSERT INTO `sub_allotments` (`id`, `saa_number`, `date_received`, `program_id`, `total_amount`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'SAA-2025-01', '2025-12-04', 4, 1000000.00, 'Regular TDP Funds', 'Active', '2025-12-03 23:10:23', '2025-12-03 23:10:23'),
(2, 'SAA-2025-02', '2025-12-04', 3, 500000.00, 'Monitoring Funds', 'Active', '2025-12-03 23:10:23', '2025-12-03 23:10:23'),
(3, 'SUB-AA-2025-01-001', '2025-12-09', NULL, 1000000.00, 'General Fund 2025', 'Active', '2025-12-09 06:41:30', '2025-12-09 06:41:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sub_allotments`
--
ALTER TABLE `sub_allotments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sub_allotments_saa_number_unique` (`saa_number`),
  ADD KEY `sub_allotments_program_id_foreign` (`program_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `sub_allotments`
--
ALTER TABLE `sub_allotments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sub_allotments`
--
ALTER TABLE `sub_allotments`
  ADD CONSTRAINT `sub_allotments_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
