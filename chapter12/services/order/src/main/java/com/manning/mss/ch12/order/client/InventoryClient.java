package com.manning.mss.ch12.order.client;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.manning.mss.ch12.order.model.Item;

@Component
public class InventoryClient {

	@Autowired
	RestTemplate restTemplate;

	public void updateInventory(Item[] items) {
		URI uri = URI.create(System.getProperty("inventory.service"));
		restTemplate.put(uri, items);
	}
}