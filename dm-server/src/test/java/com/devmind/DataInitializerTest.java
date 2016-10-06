package com.devmind;

import com.devmind.dto.MemberDto;
import com.devmind.dto.SessionDto;
import com.devmind.model.member.Speaker;
import com.devmind.model.session.Session;
import com.devmind.repository.SessionRepository;
import com.devmind.repository.SpeakerRepository;
import com.devmind.repository.SponsorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.ResourceLoader;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test {@link DataInitializer}
 */
public class DataInitializerTest {

    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();
    @Rule
    public TemporaryFolder folder = new TemporaryFolder();

    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private ResourceLoader resourceLoader;
    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private SpeakerRepository speakerRepository;
    @Mock
    private SponsorRepository sponsorRepository;
    @InjectMocks
    private DataInitializer dataInitializer;

    @Test
    public void notLoadDataWhenDatabaseIsNotEmpty() {
        when(sessionRepository.count()).thenReturn(2L);
        dataInitializer.init();
        verifyZeroInteractions(resourceLoader);
    }

    @Test
    public void loadDataWhenDatabaseIsEmpty() throws Exception {
        File file = folder.newFile("myfile.txt");
        TypeFactory typeFactory = TypeFactory.defaultInstance();
        when(sessionRepository.count()).thenReturn(0L);
        when(resourceLoader.getResource(anyString())).thenReturn(new FileSystemResource(file));
        when(objectMapper.getTypeFactory()).thenReturn(typeFactory);
        when(objectMapper.readValue(file, typeFactory.constructCollectionType(List.class, MemberDto.class)))
                .thenReturn(Arrays.asList(new MemberDto().setLogin("guillaume")))
                .thenReturn(Arrays.asList(new MemberDto().setLogin("devmind")));
        when(objectMapper.readValue(file, typeFactory.constructCollectionType(List.class, SessionDto.class))).thenReturn(Arrays.asList(new SessionDto()));

        dataInitializer.init();

        verify(speakerRepository).save(any(Speaker.class));
        verify(sessionRepository, atLeast(2)).save(any(Session.class));
    }

}