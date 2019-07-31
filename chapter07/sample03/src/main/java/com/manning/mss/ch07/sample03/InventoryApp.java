package com.manning.mss.ch07.sample03;

import java.io.File;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSession;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;

@SpringBootApplication
@EnableResourceServer
public class InventoryApp {

	static {
		String path = System.getProperty("user.dir");
		System.setProperty("javax.net.ssl.trustStore", path + File.separator + "trust-store.jks");
		System.setProperty("javax.net.ssl.trustStorePassword", "springboot");

		HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {
			public boolean verify(String hostname, SSLSession session) {
				return true;
			}
		});
	}

	public static void main(String[] args) {
		SpringApplication.run(InventoryApp.class, args);
	}
}
