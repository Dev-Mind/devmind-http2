package com.devmind.web;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import com.devmind.dto.MemberDto;
import com.devmind.repository.SponsorRepository;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sponsors")
public class SponsorController {

    @Autowired
    SponsorRepository sponsorRepository;

    @RequestMapping("/{id}")
    public ResponseEntity<MemberDto> getMember(@PathVariable("id") Long id) {
        return ResponseEntity
                .ok()
                .body(MemberDto.convert(sponsorRepository.findOne(id)));
    }

    @RequestMapping
    @JsonView(MemberDto.MemberList.class)
    public List<MemberDto> getAllSponsors() {
        return StreamSupport.stream(sponsorRepository.findAll().spliterator(), false).map(MemberDto::convert).collect(Collectors.toList());
    }
}