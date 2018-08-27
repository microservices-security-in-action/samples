package com.manning.ch06.sample01;

import java.io.File;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSession;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OrderProcessingApp {

	static {

		String path = System.getProperty("user.dir");

		 System.setProperty("javax.net.ssl.trustStore", path + File.separator +
		 "orderprocessing.jks");
		 System.setProperty("javax.net.ssl.trustStorePassword", "manning123");

		 System.setProperty("javax.net.ssl.keyStore", path + File.separator +
		 "orderprocessing.jks");
		 System.setProperty("javax.net.ssl.keyStorePassword", "manning123");

		HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {
			public boolean verify(String hostname, SSLSession session) {
				return true;
			}
		});
	}

	public static void main(String[] args) {

		SpringApplication.run(OrderProcessingApp.class, args);
	}
}
