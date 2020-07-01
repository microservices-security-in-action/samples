package com.manning.mss.ch12.grpc.sample01;

public class ProductEntity {

    private int id;

    private String name;

    private String category;

    private float unitPrice;

    public int getId() {

        return id;
    }

    public void setId(int id) {

        this.id = id;
    }

    public String getName() {

        return name;
    }

    public void setName(String name) {

        this.name = name;
    }

    public String getCategory() {

        return category;
    }

    public void setCategory(String category) {

        this.category = category;
    }

    public float getUnitPrice() {

        return unitPrice;
    }

    public void setUnitPrice(float unitPrice) {

        this.unitPrice = unitPrice;
    }
}
