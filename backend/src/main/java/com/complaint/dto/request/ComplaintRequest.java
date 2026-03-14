package com.complaint.dto.request;

import com.complaint.entity.Complaint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ComplaintRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be under 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @Size(max = 100, message = "Category must be under 100 characters")
    private String category;

    private Complaint.Priority priority = Complaint.Priority.MEDIUM;
}
