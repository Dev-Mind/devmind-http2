
package com.devmind.repository;

import com.devmind.model.member.Member;
import org.springframework.data.repository.CrudRepository;

/**
 * {@link com.devmind.model.member.Member}
 */
public interface MemberRepository extends CrudRepository<Member, Long> {

    Member findByEmail(String email);
}
