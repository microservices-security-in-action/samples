package com.manning.mss.ch06.sample02;

import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class InventoryAppConfiguration implements EnvironmentAware {

	@Override
	public void setEnvironment(final Environment environment) {
		String truststoreLocation = environment.getProperty("server.ssl.key-store");
		String truststorePassword = environment.getProperty("server.ssl.key-store-password");

		if (truststoreLocation != null && truststorePassword != null) {
//			System.setProperty("javax.net.ssl.trustStore", truststoreLocation);
//			System.setProperty("javax.net.ssl.trustStorePassword", truststorePassword);
		}

	}
}
