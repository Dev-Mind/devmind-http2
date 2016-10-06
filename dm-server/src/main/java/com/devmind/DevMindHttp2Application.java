package com.devmind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.convert.threeten.Jsr310JpaConverters;

/**
 * For this test data are downloaded by {@link DataInitializer}
 */
@SpringBootApplication
@EntityScan(basePackages = "com.devmind", basePackageClasses = Jsr310JpaConverters.class)
public class DevMindHttp2Application {

	public static void main(String[] args) {
		SpringApplication.run(DevMindHttp2Application.class, args);
	}
}
