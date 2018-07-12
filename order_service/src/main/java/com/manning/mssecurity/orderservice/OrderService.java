package com.manning.mssecurity.orderservice;

import com.manning.mssecurity.orderentity.Invoice;
import com.manning.mssecurity.orderentity.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;

@RestController
@RequestMapping("/orders")
public class OrderService {

    @PostMapping
    public ResponseEntity<Invoice> placeOrder(@RequestBody Order order) {

        System.out.println("Order ID " + order.getOrderId());
        order.getItems().forEach((lineItem) -> System.out.println("Item: " + lineItem.getItemCode() +
                                                                    " Quantity: " + lineItem.getQuantity()));

        Random rand = new Random();
        int invoiceId = rand.nextInt(1999 - 1000) + 1000;
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV" + invoiceId);
        invoice.setOrderId(order.getOrderId());
        invoice.setPrice(300.8);
        invoice.setMessage("Order Successful!");
        return new ResponseEntity<Invoice>(invoice, HttpStatus.CREATED);
    }
}
