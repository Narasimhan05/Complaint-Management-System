package com.complaint.service;

import com.complaint.dto.request.AssignRequest;
import com.complaint.dto.request.ComplaintRequest;
import com.complaint.dto.request.StatusUpdateRequest;
import com.complaint.dto.response.ComplaintResponse;
import com.complaint.entity.*;
import com.complaint.repository.*;
import com.complaint.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core business logic for complaint management.
 *
 * @Transactional ensures all DB operations in a method succeed or fail together.
 * If an exception occurs mid-method, everything rolls back — no partial data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ComplaintService {

    private final ComplaintRepository           complaintRepo;
    private final StatusHistoryRepository       historyRepo;
    private final ComplaintAssignmentRepository assignmentRepo;
    private final TeamRepository                teamRepo;
    private final NotificationService           notificationService;

    // ── USER: Raise a new complaint ───────────────────────────────────────

    public ComplaintResponse raiseComplaint(ComplaintRequest req) {
        User user = currentUser();

        var complaint = Complaint.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .priority(req.getPriority() != null ? req.getPriority() : Complaint.Priority.MEDIUM)
                .status(Complaint.ComplaintStatus.RAISED)
                .raisedBy(user)
                .build();

        complaint = complaintRepo.save(complaint);

        // Create first status history entry
        var history = createHistoryEntry(complaint, user, null,
                null, Complaint.ComplaintStatus.RAISED, null);

        complaint.setLatestHistory(history);
        complaintRepo.save(complaint);

        notificationService.createInAppNotification(
            user, complaint,
            "✅ Complaint #" + complaint.getComplaintID() + " raised: \"" + complaint.getTitle() + "\"");

        log.info("Complaint #{} raised by {}", complaint.getComplaintID(), user.getUserName());
        return toResponse(complaint);
    }

    // ── USER: Get own complaints ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints() {
        return complaintRepo
                .findByRaisedByOrderByCreatedAtDesc(currentUser())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── ADMIN: Get all complaints ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepo.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── ADMIN: Assign complaint to a team ─────────────────────────────────

    public ComplaintResponse assignComplaint(Long complaintId, AssignRequest req) {
        User admin     = currentUser();
        var  complaint = findById(complaintId);
        var  team      = teamRepo.findById(req.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + req.getTeamId()));

        // Transition to IN_PROGRESS
        advanceStatus(complaint, admin, Complaint.ComplaintStatus.IN_PROGRESS, team);

        // Record the assignment
        var assignment = ComplaintAssignment.builder()
                .complaint(complaint)
                .team(team)
                .assignedBy(admin)
                .status(ComplaintAssignment.AssignmentStatus.ASSIGNED)
                .notes(req.getNotes())
                .build();
        assignmentRepo.save(assignment);

        // Notify the complaint owner
        notificationService.createInAppNotification(
            complaint.getRaisedBy(), complaint,
            "📋 Your complaint #" + complaintId + " has been assigned to team: " + team.getTeamName());

        // Email the team lead if configured
        if (team.getTeamLead() != null) {
            notificationService.sendEmailNotification(
                team.getTeamLead(), complaint,
                "New Complaint Assigned: #" + complaintId,
                "Complaint \"" + complaint.getTitle() + "\" has been assigned to your team."
            );
        }

        log.info("Complaint #{} assigned to team {} by admin {}",
                 complaintId, team.getTeamName(), admin.getUserName());
        return toResponse(complaint);
    }

    // ── ADMIN: Update complaint status ────────────────────────────────────

    public ComplaintResponse updateStatus(Long complaintId, StatusUpdateRequest req) {
        User admin     = currentUser();
        var  complaint = findById(complaintId);

        advanceStatus(complaint, admin, req.getNewStatus(), null);

        String message = buildStatusMessage(complaintId, req.getNewStatus());
        notificationService.createInAppNotification(complaint.getRaisedBy(), complaint, message);

        log.info("Complaint #{} status → {} by {}", complaintId, req.getNewStatus(), admin.getUserName());
        return toResponse(complaint);
    }

    // ── SCHEDULER: Auto-escalate (called by SlaEscalationScheduler) ──────

    /**
     * Called automatically when SLA is breached.
     * No authenticated user in this context (scheduler thread),
     * so changedBy = null.
     */
    public void escalate(Complaint complaint) {
        advanceStatus(complaint, null, Complaint.ComplaintStatus.ESCALATED, null);

        notificationService.createInAppNotification(
            complaint.getRaisedBy(), complaint,
            "⚠️ Complaint #" + complaint.getComplaintID() +
            " has been ESCALATED — unresolved for over 48 hours!");

        notificationService.sendEmailNotification(
            complaint.getRaisedBy(), complaint,
            "Complaint Escalated: #" + complaint.getComplaintID(),
            "Your complaint \"" + complaint.getTitle() + "\" has been escalated due to SLA breach."
        );

        log.warn("Complaint #{} ESCALATED (SLA breach)", complaint.getComplaintID());
    }

    // ── History ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StatusHistory> getHistory(Long complaintId) {
        var complaint = findById(complaintId);
        return historyRepo.findByComplaintOrderByCreatedAtDesc(complaint);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    /**
     * Core status transition method.
     * 1. Deactivates the current history entry (activeFlag = false)
     * 2. Creates a new history entry (activeFlag = true)
     * 3. Updates the complaint status and latestHistory pointer
     */
    private void advanceStatus(Complaint complaint, User changedBy,
                                Complaint.ComplaintStatus newStatus, Team team) {

        // Deactivate current history entry
        historyRepo.findByComplaintAndActiveFlagTrue(complaint)
                .ifPresent(h -> { h.setActiveFlag(false); historyRepo.save(h); });

        var oldStatus = complaint.getStatus();
        complaint.setStatus(newStatus);

        var history = createHistoryEntry(complaint, changedBy, team, oldStatus, newStatus, null);
        complaint.setLatestHistory(history);
        complaintRepo.save(complaint);
    }

    private StatusHistory createHistoryEntry(Complaint complaint, User changedBy, Team team,
                                              Complaint.ComplaintStatus oldStatus,
                                              Complaint.ComplaintStatus newStatus,
                                              String remarks) {
        var history = StatusHistory.builder()
                .complaint(complaint)
                .changedBy(changedBy)
                .team(team)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .activeFlag(true)
                .escalationTime(newStatus == Complaint.ComplaintStatus.ESCALATED ? LocalDateTime.now() : null)
                .resolutionTime(newStatus == Complaint.ComplaintStatus.RESOLVED ? LocalDateTime.now() : null)
                .build();

        return historyRepo.save(history);
    }

    private Complaint findById(Long id) {
        return complaintRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
    }

    /**
     * Gets the currently authenticated user from Spring Security context.
     * Works because JwtAuthFilter sets authentication before this is called.
     */
    private User currentUser() {
        var principal = (CustomUserDetails)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser();
    }

    private String buildStatusMessage(Long id, Complaint.ComplaintStatus status) {
        return switch (status) {
            case IN_PROGRESS -> "🔧 Complaint #" + id + " is now IN PROGRESS";
            case ESCALATED   -> "⚠️ Complaint #" + id + " has been ESCALATED";
            case RESOLVED    -> "✅ Complaint #" + id + " has been RESOLVED";
            case CLOSED      -> "🔒 Complaint #" + id + " has been CLOSED";
            default          -> "Complaint #" + id + " status updated to " + status;
        };
    }

    // ── DTO Mapper ────────────────────────────────────────────────────────

    private ComplaintResponse toResponse(Complaint c) {
        return ComplaintResponse.builder()
                .complaintID(c.getComplaintID())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .priority(c.getPriority()  != null ? c.getPriority().name()  : null)
                .status(c.getStatus()      != null ? c.getStatus().name()    : null)
                .raisedBy(c.getRaisedBy()  != null ? c.getRaisedBy().getUserName() : null)
                .raisedByUserId(c.getRaisedBy() != null ? c.getRaisedBy().getUserID() : null)
                .assignedTeam(c.getLatestHistory() != null && c.getLatestHistory().getTeam() != null
                    ? c.getLatestHistory().getTeam().getTeamName() : null)
                .createdAt(c.getCreatedAt())
                .lastUpdatedAt(c.getLatestHistory() != null ? c.getLatestHistory().getCreatedAt() : null)
                .build();
    }
}
