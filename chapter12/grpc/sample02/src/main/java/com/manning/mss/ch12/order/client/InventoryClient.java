package com.manning.mss.ch12.order.client;

import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.manning.mss.ch12.grpc.sample01.InventoryGrpc;
import com.manning.mss.ch12.grpc.sample01.LineItem;
import com.manning.mss.ch12.grpc.sample01.Order;
import com.manning.mss.ch12.grpc.sample01.Product;
import com.manning.mss.ch12.grpc.sample01.UpdateReply;
import com.manning.mss.ch12.order.model.Item;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

@Component
public class InventoryClient {

	public void updateInventory(Item[] items, String jwt) {

		JWTClientInterceptor clientInterceptor = new JWTClientInterceptor();

		if (jwt != null && !jwt.isEmpty()) {
			clientInterceptor.setTokenValue(jwt);
		}

		ManagedChannel channel = ManagedChannelBuilder
				.forAddress(System.getProperty("inventory.service"),
						Integer.parseInt(System.getProperty("inventory.port")))
				.intercept(clientInterceptor).usePlaintext().build();

		Product product = Product.newBuilder().setCategory("test").setName("test").setUnitPrice(100f).build();
		LineItem lineItem = LineItem.newBuilder().setProduct(product).build();
		Order order = Order.newBuilder().setOrderId(100).addItems(lineItem).build();
		InventoryGrpc.InventoryBlockingStub stub = InventoryGrpc.newBlockingStub(channel);
		UpdateReply reply = stub.updateInventory(order);

		System.out.println(reply.getMessage());
		
		try {
			channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
		}

	}
}