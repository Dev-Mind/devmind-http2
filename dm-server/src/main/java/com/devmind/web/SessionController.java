package com.devmind.web;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.devmind.dto.SessionDto;
import com.devmind.model.session.Session;
import com.devmind.repository.SessionRepository;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * In the public API we expose only accepted sessions
 */
@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    SessionRepository sessionRepository;

    @RequestMapping("/{id}")
    public ResponseEntity<SessionDto> getSession(@PathVariable("id") Long id) {
        return ResponseEntity
                .ok()
                .body(SessionDto.convert(sessionRepository.findOne(id)));
    }

    @RequestMapping
    @JsonView(SessionDto.SessionList.class)
    public List<SessionDto> getAllSessions() {
        return sessionRepository.findAllSessions().stream()
                .filter(session -> Objects.nonNull(session.getStart()))
                .sorted(Comparator.comparing(Session::getStart))
                .map(SessionDto::convert)
                .collect(Collectors.toList());
    }

}
