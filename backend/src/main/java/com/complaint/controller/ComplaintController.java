package com.complaint.controller;

import com.complaint.dto.request.ComplaintRequest;
import com.complaint.dto.response.ApiResponse;
import com.complaint.dto.response.ComplaintResponse;
import com.complaint.entity.StatusHistory;
import com.complaint.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "2. Complaints (User)", description = "Raise and track complaints — requires USER token")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Raise a new complaint")
    public ResponseEntity<ApiResponse<ComplaintResponse>> raise(
            @Valid @RequestBody ComplaintRequest req) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint raised successfully",
                        complaintService.raiseComplaint(req)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get all my complaints")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> myComplaints() {

        return ResponseEntity.ok(
                ApiResponse.success("Complaints retrieved",
                        complaintService.getMyComplaints()));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "View full status history for a complaint")
    public ResponseEntity<ApiResponse<List<StatusHistory>>> history(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success("History retrieved",
                        complaintService.getHistory(id)));
    }
}
