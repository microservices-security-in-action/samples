package com.manning.mss.ch06.sample01;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSession;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OrderProcessingApp {

	static {
//		HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {
//			public boolean verify(String hostname, SSLSession session) {
//				return true;
//			}
//		});
	}

	public static void main(String[] args) {

		SpringApplication.run(OrderProcessingApp.class, args);
	}
}
