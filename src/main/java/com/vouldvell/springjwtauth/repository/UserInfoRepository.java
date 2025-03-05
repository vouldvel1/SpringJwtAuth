package com.vouldvell.springjwtauth.repository;

import com.vouldvell.springjwtauth.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo,Integer> {
    Optional<UserInfo> findByEmail(String email);

    @Query
    Optional<UserInfo> findByName(String name);
}
