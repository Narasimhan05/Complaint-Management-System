package com.complaint.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRequest {

    @NotNull(message = "Team ID is required")
    private Long teamId;

    private String notes;  // optional notes from admin
}
