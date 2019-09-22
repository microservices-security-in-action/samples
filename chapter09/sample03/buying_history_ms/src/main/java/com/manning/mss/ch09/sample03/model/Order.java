package com.manning.mss.ch09.sample03.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Order {

	@JsonProperty("customer_id")
	private String customerId;
	@JsonProperty("order_id")
	private String orderId;
	@JsonProperty("payment_method")
	private PaymentMethod paymentMethod;
	@JsonProperty("items")
	private Item[] items;
	@JsonProperty("shipping_address")
	private String shipppingAddress;

	public Order() {

	}

	public Order(String customerId, String orderId, PaymentMethod paymentMethod, Item[] items,
			String shipppingAddress) {
		super();
		this.customerId = customerId;
		this.orderId = orderId;
		this.paymentMethod = paymentMethod;
		this.items = items;
		this.shipppingAddress = shipppingAddress;
	}

	public String getCustomerId() {
		return customerId;
	}

	public void setCustomerId(String customerId) {
		this.customerId = customerId;
	}

	public String getOrderId() {
		return orderId;
	}

	public void setOrderId(String orderId) {
		this.orderId = orderId;
	}

	public PaymentMethod getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(PaymentMethod paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public Item[] getItems() {
		return items;
	}

	public void setItems(Item[] items) {
		this.items = items;
	}

	public String getShipppingAddress() {
		return shipppingAddress;
	}

	public void setShipppingAddress(String shipppingAddress) {
		this.shipppingAddress = shipppingAddress;
	}
}
