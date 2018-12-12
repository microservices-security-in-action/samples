package com.manning.mss.ch03.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manning.mss.ch03.sample01.exceptions.OrderNotFoundException;
import com.manning.mss.ch03.sample01.orderentity.Order;

@RestController
@RequestMapping("/orders")
public class OrderProcessingService {

    private Map<String, Order> orders = new HashMap<>();

    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order) {

        System.out.println("Received Order For " + order.getItems().size() + " Items");
        order.getItems().forEach((lineItem) -> System.out.println("Item: " + lineItem.getItemCode() +
                " Quantity: " + lineItem.getQuantity()));

        String orderId = UUID.randomUUID().toString();
        order.setOrderId(orderId);
        orders.put(orderId, order);
        return new ResponseEntity<Order>(order, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable String id) throws OrderNotFoundException {

        if(orders.containsKey(id)){
            return new ResponseEntity<Order>(orders.get(id), HttpStatus.OK);
        }
        else {
            throw new OrderNotFoundException();
        }
    }
}
