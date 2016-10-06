package com.devmind.repository;

import java.util.List;

import com.devmind.model.session.Session;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/**
 * {@link Session}
 */
public interface SessionRepository extends CrudRepository<Session, Long> {

    @Query(value = "SELECT DISTINCT s FROM Session s left join fetch s.speakers sp left join fetch s.votes")
    List<Session> findAllSessions();
}
