package com.devmind.repository;

import com.devmind.model.member.Sponsor;
import org.springframework.data.repository.CrudRepository;

/**
 * {@link com.devmind.model.member.Sponsor}
 */
public interface SponsorRepository extends CrudRepository<Sponsor, Long> {

}
