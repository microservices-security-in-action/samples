package com.manning.mss.ch08.sample02;

import io.grpc.Server;
import io.grpc.netty.GrpcSslContexts;
import io.grpc.netty.NettyServerBuilder;
import io.grpc.stub.StreamObserver;
import io.netty.handler.ssl.ClientAuth;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.SslProvider;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.logging.Logger;

public class InventoryServer {
    private static final Logger logger = Logger.getLogger(InventoryServer.class.getName());

    private Server server;

    private final String host;
    private final int port;
    private final String certChainFilePath;
    private final String privateKeyFilePath;
    private final String trustCertCollectionFilePath;

    public InventoryServer(String host,
                           int port,
                           String certChainFilePath,
                           String privateKeyFilePath,
                           String trustCertCollectionFilePath) {
        this.host = host;
        this.port = port;
        this.certChainFilePath = certChainFilePath;
        this.privateKeyFilePath = privateKeyFilePath;
        this.trustCertCollectionFilePath = trustCertCollectionFilePath;
    }

    private SslContextBuilder getSslContextBuilder() {
        SslContextBuilder sslClientContextBuilder = SslContextBuilder.forServer(new File(certChainFilePath),
                new File(privateKeyFilePath));
        if (trustCertCollectionFilePath != null) {
            sslClientContextBuilder.trustManager(new File(trustCertCollectionFilePath));
            sslClientContextBuilder.clientAuth(ClientAuth.REQUIRE);
        }
        return GrpcSslContexts.configure(sslClientContextBuilder,
                SslProvider.OPENSSL);
    }

    private void start() throws IOException {
        server = NettyServerBuilder.forAddress(new InetSocketAddress(host, port))
                .addService(new InventoryImpl())
                .sslContext(getSslContextBuilder().build())
                .build()
                .start();
        logger.info("Server started, listening on " + port);
        Runtime.getRuntime().addShutdownHook(new Thread() {
            @Override
            public void run() {
                // Use stderr here since the logger may have been reset by its JVM shutdown hook.
                System.err.println("*** shutting down gRPC server since JVM is shutting down");
                InventoryServer.this.stop();
                System.err.println("*** server shut down");
            }
        });
    }

    private void stop() {
        if (server != null) {
            server.shutdown();
        }
    }

    /**
     * Await termination on the main thread since the grpc library uses daemon threads.
     */
    private void blockUntilShutdown() throws InterruptedException {
        if (server != null) {
            server.awaitTermination();
        }
    }

    /**
     * Main launches the server from the command line.
     */
    public static void main(String[] args) throws IOException, InterruptedException {

        if (args.length < 4 || args.length > 5) {
            System.out.println(
                    "USAGE: InventoryServer host port certChainFilePath privateKeyFilePath " +
                    "[trustCertCollectionFilePath]\n  Note: You only need to supply trustCertCollectionFilePath if you want " +
                    "to enable Mutual TLS.");
            System.exit(0);
        }

        final InventoryServer server = new InventoryServer(args[0],
                Integer.parseInt(args[1]),
                args[2],
                args[3],
                args.length == 5 ? args[4] : null);
        server.start();
        server.blockUntilShutdown();
    }

    static class InventoryImpl extends InventoryGrpc.InventoryImplBase {

        /**
         * Method that updates the inventory upon receiving a message.
         * @param req - The request
         * @param responseObserver - A handle to the response
         */
        @Override
        public void updateInventory(Order req, StreamObserver<UpdateReply> responseObserver) {

            UpdateReply updateReply = UpdateReply.newBuilder().setMessage("Updated inventory for " + req.getItemsCount()
                    + " products").build();
            responseObserver.onNext(updateReply);
            responseObserver.onCompleted();
        }
    }
}
