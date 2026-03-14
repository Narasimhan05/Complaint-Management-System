package com.complaint.controller;

import com.complaint.dto.request.AssignRequest;
import com.complaint.dto.request.StatusUpdateRequest;
import com.complaint.dto.response.ApiResponse;
import com.complaint.dto.response.ComplaintResponse;
import com.complaint.entity.Team;
import com.complaint.repository.TeamRepository;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")          // applies to ALL methods in this class
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "3. Admin", description = "Complaint management — requires ADMIN token")
public class AdminController {

    private final ComplaintService complaintService;
    private final TeamRepository   teamRepository;

    // ── Complaints ─────────────────────────────────────────────────────

    @GetMapping("/complaints")
    @Operation(summary = "Get all complaints (admin view)")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> allComplaints() {
        return ResponseEntity.ok(
                ApiResponse.success("All complaints", complaintService.getAllComplaints()));
    }

    @PostMapping("/complaints/{id}/assign")
    @Operation(summary = "Assign complaint to a team → status becomes IN_PROGRESS")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assign(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest req) {

        return ResponseEntity.ok(
                ApiResponse.success("Complaint assigned",
                        complaintService.assignComplaint(id, req)));
    }

    @PutMapping("/complaints/{id}/status")
    @Operation(summary = "Update complaint status (RESOLVED, CLOSED, etc.)")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest req) {

        return ResponseEntity.ok(
                ApiResponse.success("Status updated",
                        complaintService.updateStatus(id, req)));
    }

    // ── Teams ──────────────────────────────────────────────────────────

    @GetMapping("/teams")
    @Operation(summary = "Get all teams")
    public ResponseEntity<ApiResponse<List<Team>>> allTeams() {
        return ResponseEntity.ok(
                ApiResponse.success("Teams retrieved", teamRepository.findAll()));
    }

    @PostMapping("/teams")
    @Operation(summary = "Create a new team")
    public ResponseEntity<ApiResponse<Team>> createTeam(@RequestBody Team team) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team created", teamRepository.save(team)));
    }

    @PutMapping("/teams/{id}")
    @Operation(summary = "Update team details")
    public ResponseEntity<ApiResponse<Team>> updateTeam(
            @PathVariable Long id, @RequestBody Team updates) {

        var team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found: " + id));
        team.setTeamName(updates.getTeamName());
        team.setDescription(updates.getDescription());
        team.setContactEmail(updates.getContactEmail());
        return ResponseEntity.ok(ApiResponse.success("Team updated", teamRepository.save(team)));
    }

    @DeleteMapping("/teams/{id}")
    @Operation(summary = "Delete a team")
    public ResponseEntity<ApiResponse<Void>> deleteTeam(@PathVariable Long id) {
        teamRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Team deleted"));
    }
}
