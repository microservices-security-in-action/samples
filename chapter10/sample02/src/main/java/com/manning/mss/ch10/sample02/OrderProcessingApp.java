package com.manning.mss.ch10.sample02;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSession;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;

@SpringBootApplication
@EnableGlobalMethodSecurity(prePostEnabled = true)
@EnableResourceServer
public class OrderProcessingApp {

	static {

//		System.setProperty("javax.net.ssl.trustStore", "/opt/trust-store.jks");
//		System.setProperty("javax.net.ssl.trustStorePassword", "springboot");
//		
//		System.setProperty("javax.net.ssl.keyStore",  "/opt/keystore.jks");
//		System.setProperty("javax.net.ssl.keyStorePassword", System.getenv().get("javax.net.ssl.keyStorePassword"));

		HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {
			public boolean verify(String hostname, SSLSession session) {
				System.out.println("VERIFICATION CALLED " + hostname);
				return true;
			}
		});
	}

	public static void main(String[] args) {
		SpringApplication.run(OrderProcessingApp.class, args);
	}

	@Bean
	public OAuth2RestTemplate oauth2RestTemplate(OAuth2ClientContext oauth2ClientContext,
			OAuth2ProtectedResourceDetails details) {
		return new OAuth2RestTemplate(details, oauth2ClientContext);
	}
}
