package com.complaint.dto.request;

import com.complaint.entity.Complaint;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "New status is required")
    private Complaint.ComplaintStatus newStatus;

    private String remarks;  // optional admin notes on the update
}
