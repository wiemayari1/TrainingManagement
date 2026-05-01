package com.isi.gf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GfApplication {
    public static void main(String[] args) {
        SpringApplication.run(GfApplication.class, args);
    }
}