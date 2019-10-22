package com.manning.mss.ch10.sample04.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.manning.mss.ch10.sample04.model.Item;

@RestController
@RequestMapping(value = "/inventory")
public class Inventory {

	@RequestMapping(method = RequestMethod.PUT)
	public ResponseEntity<?> updateItems(@RequestBody Item[] items) {

		if (items == null || items.length == 0) {
			return ResponseEntity.badRequest().build();
		}
		for (Item item : items) {
			if (item != null) {
				System.out.println(item.getCode());
			}
		}
		return ResponseEntity.noContent().build();
	}
}