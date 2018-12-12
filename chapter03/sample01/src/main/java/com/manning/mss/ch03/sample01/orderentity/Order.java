package com.manning.mss.ch03.sample01.orderentity;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Order {

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("items")
    private List<LineItem> items;

    @JsonProperty("shippingAddress")
    private String shippingAddress;

    public String getOrderId() {

        return orderId;
    }

    public void setOrderId(String orderId) {

        this.orderId = orderId;
    }

    public List<LineItem> getItems() {

        return items;
    }

    public void setItems(List<LineItem> items) {

        this.items = items;
    }

    public String getShippingAddress() {

        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {

        this.shippingAddress = shippingAddress;
    }
}
