package com.complaint.repository;

import com.complaint.entity.Complaint;
import com.complaint.entity.ComplaintAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintAssignmentRepository extends JpaRepository<ComplaintAssignment, Long> {
    List<ComplaintAssignment> findByComplaintOrderByCreatedAtDesc(Complaint complaint);
    Optional<ComplaintAssignment> findTopByComplaintOrderByCreatedAtDesc(Complaint complaint);
}
