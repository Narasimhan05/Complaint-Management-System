package com.complaint.repository;

import com.complaint.entity.Complaint;
import com.complaint.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    // Full audit trail for one complaint, newest first
    List<StatusHistory> findByComplaintOrderByCreatedAtDesc(Complaint complaint);

    // Get the current active status entry for a complaint
    Optional<StatusHistory> findByComplaintAndActiveFlagTrue(Complaint complaint);
}
