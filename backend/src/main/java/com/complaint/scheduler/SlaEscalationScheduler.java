package com.complaint.scheduler;

import com.complaint.repository.ComplaintRepository;
import com.complaint.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Automatically escalates complaints that breach the SLA window.
 *
 * How it works:
 *   Every hour, this job asks: "Are there any IN_PROGRESS complaints
 *   that have been sitting for more than 48 hours?"
 *   For each one found → status changes to ESCALATED and user is notified.
 *
 * Interview talking point:
 *   "@Scheduled with fixedRate runs regardless of previous execution time.
 *    fixedDelay would wait for previous execution to finish first.
 *    For a periodic health-check job, fixedRate is appropriate."
 *
 * Testing tip: Set app.sla.escalation-hours=0 and fixedRate=10000 (10s)
 * to see escalation happen immediately in development.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SlaEscalationScheduler {

    private final ComplaintRepository complaintRepo;
    private final ComplaintService    complaintService;

    @Value("${app.sla.escalation-hours:48}")
    private int slaHours;

    /**
     * fixedRate = 3_600_000 ms = 1 hour
     *
     * For development/testing, change to:
     *   @Scheduled(fixedRate = 60_000)   // every 1 minute
     * and set app.sla.escalation-hours=0 in properties.
     */
    @Scheduled(fixedRate = 3_600_000)
    public void runSlaCheck() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(slaHours);

        var toEscalate = complaintRepo.findComplaintsBreachingSla(cutoff);

        if (toEscalate.isEmpty()) {
            log.debug("SLA check: no breaches found at {}", LocalDateTime.now());
            return;
        }

        log.warn("SLA check: {} complaint(s) breaching SLA, escalating...", toEscalate.size());

        for (var complaint : toEscalate) {
            try {
                complaintService.escalate(complaint);
            } catch (Exception e) {
                // Log and continue — one failure shouldn't stop the rest
                log.error("Failed to escalate complaint #{}: {}",
                          complaint.getComplaintID(), e.getMessage());
            }
        }

        log.warn("SLA check complete: {} complaint(s) escalated", toEscalate.size());
    }
}
