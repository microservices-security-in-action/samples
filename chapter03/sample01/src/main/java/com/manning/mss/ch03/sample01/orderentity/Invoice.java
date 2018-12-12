package com.manning.mss.ch03.sample01.orderentity;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Invoice {

    @JsonProperty("invoiceId")
    private String invoiceId;

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("price")
    private double price;

    @JsonProperty("message")
    private String message;

    public String getInvoiceId() {

        return invoiceId;
    }

    public void setInvoiceId(String invoiceId) {

        this.invoiceId = invoiceId;
    }

    public String getOrderId() {

        return orderId;
    }

    public void setOrderId(String orderId) {

        this.orderId = orderId;
    }

    public double getPrice() {

        return price;
    }

    public void setPrice(double price) {

        this.price = price;
    }

    public String getMessage() {

        return message;
    }

    public void setMessage(String message) {

        this.message = message;
    }
}
