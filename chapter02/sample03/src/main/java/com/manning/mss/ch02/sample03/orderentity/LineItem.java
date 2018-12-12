package com.manning.mss.ch02.sample03.orderentity;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LineItem {

    @JsonProperty("itemCode")
    private String itemCode;

    @JsonProperty("quantity")
    private int quantity;

    public String getItemCode() {

        return itemCode;
    }

    public void setItemCode(String itemCode) {

        this.itemCode = itemCode;
    }

    public int getQuantity() {

        return quantity;
    }

    public void setQuantity(int quantity) {

        this.quantity = quantity;
    }
}
