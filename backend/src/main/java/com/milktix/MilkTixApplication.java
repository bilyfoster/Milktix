package com.milktix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MilkTixApplication {

    public static void main(String[] args) {
        SpringApplication.run(MilkTixApplication.class, args);
    }

}