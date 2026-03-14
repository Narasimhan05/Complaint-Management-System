package com.complaint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the Complaint Management System.
 *
 * @EnableScheduling activates Spring's task scheduling mechanism,
 * required for the SLA escalation job to run automatically.
 */
@SpringBootApplication
@EnableScheduling
public class ComplaintManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComplaintManagementApplication.class, args);
    }
}
