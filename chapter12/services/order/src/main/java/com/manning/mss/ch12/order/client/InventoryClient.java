package com.manning.mss.ch12.order.client;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.manning.mss.ch12.order.model.Item;

@Component
public class InventoryClient {

	@Autowired
	RestTemplate restTemplate;

	public void updateInventory(Item[] items, String jwt) {

		try {
			URI uri = URI.create(System.getProperty("inventory.service"));
			HttpHeaders headers = new HttpHeaders();
			if (jwt != null) {
				headers.add("Authorization", jwt);
			}
			HttpEntity<Item[]> entity = new HttpEntity<>(items, headers);
			restTemplate.exchange(uri, HttpMethod.PUT, entity, String.class);
		} catch (Throwable e) {
			System.out.println("ERROR");
			e.printStackTrace();
		}

	}
}