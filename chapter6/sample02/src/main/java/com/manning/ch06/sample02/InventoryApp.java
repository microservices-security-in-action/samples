package com.manning.ch06.sample02;

import java.io.File;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventoryApp {

	static {
		String path = System.getProperty("user.dir");
		 System.setProperty("javax.net.ssl.trustStore", path + File.separator
		 + "inventory.jks");
		 System.setProperty("javax.net.ssl.trustStorePassword", "manning123");
	}

	public static void main(String[] args) {
		SpringApplication.run(InventoryApp.class, args);
	}
}
