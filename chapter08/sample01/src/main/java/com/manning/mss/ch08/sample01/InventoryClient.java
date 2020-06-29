package com.manning.mss.ch08.sample01;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;

import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * The inventory client process.
 */
public class InventoryClient {

    private static final Logger logger = Logger.getLogger(InventoryClient.class.getName());

    private final ManagedChannel channel;
    private final InventoryGrpc.InventoryBlockingStub inventoryBlockingStub;

    /**
     * Construct client connecting to InventoryServer
     */
    public InventoryClient(String host, int port) {

        this(ManagedChannelBuilder.forAddress(host, port)
                // Channels are secure by default (via SSL/TLS). For the example we disable TLS to avoid
                // needing certificates.
                .usePlaintext()
                .build());
    }

    /**
     * Main method which calls the update inventory method.
     */
    public static void main(String[] args) throws Exception {

        ProductEntity product = new ProductEntity();
        product.setId(1);
        product.setCategory("books");
        product.setName("Microservices Security In Action");
        product.setUnitPrice(50.0f);

        LineItemEntity item = new LineItemEntity();
        item.setProduct(product);
        item.setQuantity(2);

        OrderEntity order = new OrderEntity();
        order.setOrderId(1);
        order.getItems().add(item);

        String hostname = System.getenv("INVENTORY_HOST");
        if (hostname==null || hostname.isEmpty()) {
            hostname = "localhost";
        }

        String port = System.getenv("INVENTORY_PORT");
        if (port == null || port.isEmpty()){
            port = "50051";
        }
        InventoryClient client = new InventoryClient(hostname, Integer.parseInt(port));

        try {
            client.updateInventory(order);
        } finally {
            client.shutdown();
        }
    }

    /**
     * Construct client for accessing Inventory Server
     */
    private InventoryClient(ManagedChannel channel) {
        this.channel = channel;
        inventoryBlockingStub = InventoryGrpc.newBlockingStub(channel);
    }

    private void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }

    /**
     * Update inventory upon confirming an order
     */
    public void updateInventory(OrderEntity order) {

        Order.Builder orderBuilder = Order.newBuilder().setOrderId(order.getOrderId());

        for(LineItemEntity lineItem : order.getItems()) {

            Product product = Product.newBuilder()
                    .setId(lineItem.getProduct().getId())
                    .setName(lineItem.getProduct().getName())
                    .setCategory(lineItem.getProduct().getCategory())
                    .setUnitPrice(lineItem.getProduct().getUnitPrice())
                    .build();

            orderBuilder.addItems(LineItem.newBuilder().setProduct(product).setQuantity(lineItem.getQuantity()).build());
        }

        UpdateReply updateResponse;
        try {
            updateResponse = inventoryBlockingStub.updateInventory(orderBuilder.build());
        } catch (StatusRuntimeException e) {
            logger.log(Level.WARNING, "RPC failed: {0}", e.getStatus());
            return;
        }

        logger.info("Message: " + updateResponse.getMessage());
    }

}
