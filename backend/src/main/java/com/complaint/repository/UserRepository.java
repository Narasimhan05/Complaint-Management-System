// ─────────────────────────────────────────────────────────────────
// UserRepository.java
// ─────────────────────────────────────────────────────────────────
package com.complaint.repository;

import com.complaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * JpaRepository<User, Long> gives us 18 free methods:
 * save(), findById(), findAll(), deleteById(), count(), existsById()...
 *
 * Methods below use Spring Data's "method name query" feature:
 * findByUserName → SELECT * FROM users WHERE user_name = ?
 * No SQL needed — Spring generates it from the method name.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserName(String userName);
    Optional<User> findByEmail(String email);
    boolean existsByUserName(String userName);
    boolean existsByEmail(String email);
}
