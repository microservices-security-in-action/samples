package com.manning.mss.ch09.sample01;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Source;

@SpringBootApplication
@EnableBinding(Source.class)
public class OrderProcessingApp {

	public static void main(String[] args) {
		SpringApplication.run(OrderProcessingApp.class, args);
	}
}
