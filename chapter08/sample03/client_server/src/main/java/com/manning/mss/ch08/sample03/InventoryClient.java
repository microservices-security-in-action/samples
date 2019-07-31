package com.manning.mss.ch08.sample03;

import io.grpc.ManagedChannel;
import io.grpc.StatusRuntimeException;
import io.grpc.netty.GrpcSslContexts;
import io.grpc.netty.NegotiationType;
import io.grpc.netty.NettyChannelBuilder;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;

import javax.net.ssl.SSLException;
import java.io.File;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

public class InventoryClient {
    private static final Logger logger = Logger.getLogger(InventoryClient.class.getName());

    private final ManagedChannel channel;
    private final InventoryGrpc.InventoryBlockingStub blockingStub;


    private static SslContext buildSslContext(String trustCertCollectionFilePath,
                                              String clientCertChainFilePath,
                                              String clientPrivateKeyFilePath) throws SSLException {
        SslContextBuilder builder = GrpcSslContexts.forClient();
        if (trustCertCollectionFilePath != null) {
            builder.trustManager(new File(trustCertCollectionFilePath));
        }
        if (clientCertChainFilePath != null && clientPrivateKeyFilePath != null) {
            builder.keyManager(new File(clientCertChainFilePath), new File(clientPrivateKeyFilePath));
        }
        return builder.build();
    }

    /**
     * Construct client connecting to the server at {@code host:port}.
     */
    public InventoryClient(String host,
                           int port,
                           SslContext sslContext,
                           JWTClientInterceptor clientInterceptor) throws SSLException {

        this(NettyChannelBuilder.forAddress(host, port)
                .negotiationType(NegotiationType.TLS)
                .sslContext(sslContext)
                .intercept(clientInterceptor)
                .build());
    }

    /**
     * Construct client for accessing RouteGuide server using the existing channel.
     */
    InventoryClient(ManagedChannel channel) {
        this.channel = channel;
        blockingStub = InventoryGrpc.newBlockingStub(channel);
    }

    public void shutdown() throws InterruptedException {
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
            updateResponse = blockingStub.updateInventory(orderBuilder.build());
        } catch (StatusRuntimeException e) {
            logger.log(Level.WARNING, "RPC failed: {0}", e.getStatus());
            return;
        }

        logger.info("Message: " + updateResponse.getMessage());
    }

    /**
     * Greet server. If provided, the first element of {@code args} is the name to use in the
     * greeting.
     */
    public static void main(String[] args) throws Exception {

        if (args.length < 3 || args.length > 4) {
            System.out.println("Parameters [host] [port] [trustCertCollectionFilePath] are required. [jwt] " +
                    "is optional");
            System.exit(0);
        }

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

        JWTClientInterceptor clientInterceptor = new JWTClientInterceptor();
        if (args.length > 3) {
            clientInterceptor.setTokenValue(args[3]);
        }
        else {
            clientInterceptor.setTokenValue("");
        }

        InventoryClient client;

        client = new InventoryClient(args[0], Integer.parseInt(args[1]),
                buildSslContext(args[2], null, null), clientInterceptor);

        try {
            client.updateInventory(order);
        } finally {
            client.shutdown();
        }
    }
}
