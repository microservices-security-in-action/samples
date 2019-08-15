package com.manning.mss.ch09.sample03;

import com.manning.mss.ch09.sample03.model.Order;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.cloud.stream.messaging.Sink;

@SpringBootApplication
@EnableBinding(Sink.class)
public class BuyingHistoryMicroservice {

	public static void main(String[] args) {
		SpringApplication.run(BuyingHistoryMicroservice.class, args);
	}

	@StreamListener(Sink.INPUT)
	public void updateHistory(Order order) {
		System.out.println("Updated buying history of customer with order: " + order.getOrderId());
	}
}
