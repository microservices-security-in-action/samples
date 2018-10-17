package com.manning.mssecurity;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.manning.mssecurity.entity.LineItem;
import com.manning.mssecurity.entity.Order;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
@EnableResourceServer
public class ResourceApplication {

    static List<Order> orders = new ArrayList<Order>();

    @RequestMapping("/")
    public Message home() {

        return new Message("Hello World");
    }

    @GetMapping("/orders")
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
        order1.setShippingAddress("No 5, Light Street, Colombo, Sri Lanka.");

        Order order2 = new Order();
        order2.setOrderId("00002");
        order2.addItem(new LineItem("IT001", 7));
        order2.addItem(new LineItem("IT003", 1));
        order2.setShippingAddress("No 18, Hyde Park, Colombo, Sri Lanka.");

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
