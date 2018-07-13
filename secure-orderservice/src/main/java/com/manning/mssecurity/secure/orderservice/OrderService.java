package com.manning.mssecurity.secure.orderservice;

import com.manning.mssecurity.secure.orderentity.Invoice;
import com.manning.mssecurity.secure.orderentity.Order;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.provider.authentication.OAuth2AuthenticationManager;
import org.springframework.security.oauth2.provider.token.RemoteTokenServices;
import org.springframework.security.oauth2.provider.token.ResourceServerTokenServices;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;

@EnableResourceServer
@EnableWebSecurity
@RestController
@RequestMapping("/orders")
public class OrderService extends WebSecurityConfigurerAdapter {

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

    @Bean
    public ResourceServerTokenServices tokenServices() {
        RemoteTokenServices tokenServices = new RemoteTokenServices();
        tokenServices.setClientId("applicationid");
        tokenServices.setClientSecret("applicationsecret");
        tokenServices.setCheckTokenEndpointUrl("http://localhost:8085/oauth/check_token");
        return tokenServices;
    }

    @Override
    public AuthenticationManager authenticationManagerBean() {
        OAuth2AuthenticationManager authenticationManager = new OAuth2AuthenticationManager();
        authenticationManager.setTokenServices(tokenServices());
        return authenticationManager;
    }

}
