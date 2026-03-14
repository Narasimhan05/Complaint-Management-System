package com.complaint.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintResponse {
    private Long   complaintID;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String raisedBy;
    private Long   raisedByUserId;
    private String assignedTeam;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;
}
