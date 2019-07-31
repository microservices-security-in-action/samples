package com.manning.mss.ch04.sample02.rs;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.manning.mss.ch04.sample02.rs.entity.LineItem;
import com.manning.mss.ch04.sample02.rs.entity.Order;

@SpringBootApplication
@RestController
public class ResourceApplication {

    static List<Order> orders = new ArrayList<Order>();

    @RequestMapping("/")
    @CrossOrigin(origins = "*", maxAge = 3600)
    public Message home() {

        return new Message("Hello World");
    }

    @GetMapping("/orders")
    @CrossOrigin(origins = "http://localhost:8080",
                 allowedHeaders = "x-requested-with",
                 methods = RequestMethod.GET,
                 maxAge = 3600)
    public List<Order> getOrders() {

        System.out.println("Returning " + orders.size() + " orders");
        return orders;
    }

    public static void main(String[] args) {

        Order order1 = new Order();
        order1.setOrderId("00001");
        order1.addItem(new LineItem("IT001", 3));
        order1.addItem(new LineItem("IT002", 5));
        order1.addItem(new LineItem("IT003", 4));
        order1.setShippingAddress("No 5, Castro Street, Mountain View, CA, USA.");

        Order order2 = new Order();
        order2.setOrderId("00002");
        order2.addItem(new LineItem("IT001", 7));
        order2.addItem(new LineItem("IT003", 1));
        order2.setShippingAddress("No 20, 2nd Street, San Jose, CA, USA.");

        orders.add(order1);
        orders.add(order2);

        SpringApplication.run(ResourceApplication.class, args);
    }

}

class Message {

    private String id = UUID.randomUUID().toString();
    private String content;

    Message() {

    }

    public Message(String content) {

        this.content = content;
    }

    public String getId() {

        return id;
    }

    public String getContent() {

        return content;
    }
}