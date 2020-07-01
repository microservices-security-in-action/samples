package com.manning.mss.ch12.grpc.sample01;

import java.util.ArrayList;
import java.util.List;

public class OrderEntity {

    private int orderId;

    private List<LineItemEntity> items = new ArrayList<>();

    public int getOrderId() {

        return orderId;
    }

    public void setOrderId(int orderId) {

        this.orderId = orderId;
    }

    public List<LineItemEntity> getItems() {

        return items;
    }

    public void setItems(List<LineItemEntity> items) {

        this.items = items;
    }
}
