package com.manning.mss.ch08.sample01;

public class LineItemEntity {

    private int quantity;

    private ProductEntity product;

    public int getQuantity() {

        return quantity;
    }

    public void setQuantity(int quantity) {

        this.quantity = quantity;
    }

    public ProductEntity getProduct() {

        return product;
    }

    public void setProduct(ProductEntity product) {

        this.product = product;
    }
}
