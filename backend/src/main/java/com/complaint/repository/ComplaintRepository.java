package com.complaint.repository;

import com.complaint.entity.Complaint;
import com.complaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // Find all complaints raised by a specific user
    List<Complaint> findByRaisedByOrderByCreatedAtDesc(User user);

    // Find all complaints with a specific status
    List<Complaint> findByStatusOrderByCreatedAtDesc(Complaint.ComplaintStatus status);

    // Find complaints by category
    List<Complaint> findByCategoryOrderByCreatedAtDesc(String category);

    /**
     * JPQL query for the SLA scheduler.
     *
     * Finds all IN_PROGRESS complaints whose latest status history entry
     * was created BEFORE the cutoff time (meaning they've been sitting
     * without resolution for longer than the SLA window).
     *
     * JPQL vs SQL:
     *   - JPQL uses entity/field names: Complaint, latestHistory.createdAt
     *   - SQL uses table/column names: complaints, history_id
     *   - JPQL is database-agnostic (works on MySQL, PostgreSQL, etc.)
     */
    @Query("SELECT c FROM Complaint c " +
           "WHERE c.status = 'IN_PROGRESS' " +
           "AND c.latestHistory.createdAt < :cutoffTime")
    List<Complaint> findComplaintsBreachingSla(@Param("cutoffTime") LocalDateTime cutoffTime);

    // Count by status — useful for dashboard stats
    long countByStatus(Complaint.ComplaintStatus status);

    // Search by title (case-insensitive)
    List<Complaint> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String keyword);
}
