package com.manning.mss.ch06.sample01;

import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class OrderAppConfiguration implements EnvironmentAware {

	@Override
	public void setEnvironment(final Environment environment) {
		String keystoreLocation = environment.getProperty("server.ssl.key-store");
		String keystorePassword = environment.getProperty("server.ssl.key-store-password");
		String truststoreLocation = environment.getProperty("server.ssl.key-store");
		String truststorePassword = environment.getProperty("server.ssl.key-store-password");
		String inventory = environment.getProperty("inventory.service");

		if (truststoreLocation != null && truststorePassword != null) {
//			System.setProperty("javax.net.ssl.trustStore", truststoreLocation);
//			System.setProperty("javax.net.ssl.trustStorePassword", truststorePassword);
		}

		if (keystoreLocation != null && keystorePassword != null) {
//			System.setProperty("javax.net.ssl.keyStore", keystoreLocation);
//			System.setProperty("javax.net.ssl.keyStorePassword", keystorePassword);
		}

		if (inventory != null) {
			System.setProperty("inventory.service", inventory);
		}

	}
}
