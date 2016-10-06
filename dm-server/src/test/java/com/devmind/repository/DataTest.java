package com.devmind.repository;


import static com.ninja_squad.dbsetup.Operations.deleteAllFrom;
import static com.ninja_squad.dbsetup.Operations.insertInto;

import com.devmind.model.session.Level;
import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.generator.ValueGenerators;
import com.ninja_squad.dbsetup.operation.Operation;

class DataTest {

    static final Operation DELETE_ALL = deleteAllFrom("Session_Member", "Vote", "Session", "Member");

    static Operation INSERT_MEMBER = Operations.sequenceOf(
            insertInto("Member")
                    .withGeneratedValue("id", ValueGenerators.sequence())
                    .columns("DTYPE", "login", "firstname", "lastname", "company", "email")
                    .values("Speaker", "guillaume", "Guillaume", "EHRET", "Dev-Mind", "guillaume@dev-mind.fr")
                    .values("Member", "avatar", "Avatar", "AVATAR", "Dev-Mind", "avatar@dev-mind.fr")
                    .build()
    );



    public static Operation INSERT_SESSION = Operations.sequenceOf(
            INSERT_MEMBER,
            insertInto("Session")
                    .withGeneratedValue("id", ValueGenerators.sequence())
                    .columns("title", "DESCRIPTION", "level")
                    .values("My session", "My session", Level.Beginner)
                    .values("My workshop", "My workshop", Level.Expert)
                    .build(),
            insertInto("Session_Member")
                    .columns("SESSIONS_ID", "SPEAKERS_ID")
                    .values(1, 1)
                    .values(2, 1)
                    .build());


}
