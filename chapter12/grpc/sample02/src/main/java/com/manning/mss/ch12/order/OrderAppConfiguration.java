package com.manning.mss.ch12.order;


import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class OrderAppConfiguration implements EnvironmentAware {

	@Override
	public void setEnvironment(final Environment environment) {
		String inventory = environment.getProperty("inventory.service");
		System.setProperty("inventory.service", inventory);
		
		String port = environment.getProperty("inventory.port");
		System.setProperty("inventory.port", port);
	}
}