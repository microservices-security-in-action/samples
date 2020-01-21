package com.manning.mss.ch09.sample05.natspub;

import io.nats.client.Connection;
import io.nats.client.Nats;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.TimeoutException;

public class NatsPublisher {

    public static void main(String[] args) {

        Connection natsConnection = null;
        try {
            //Connect to the NATS server.
            natsConnection = Nats.connect("nats://localhost:4222");

            //Push message to subject "updates"
            natsConnection.publish("updates", "Welcome to NATS".getBytes(StandardCharsets.UTF_8));

            // Make sure the message goes through before we close
            natsConnection.flush(Duration.ZERO);
        } catch (IOException | InterruptedException e) {
            System.out.println("Error: Could not connect to NATS server " + e.getMessage());
        } catch (TimeoutException e) {
            System.out.println("Error: Message timed out " + e.getMessage());
        } finally {
            if (natsConnection != null) {
                try {
                    natsConnection.close();
                } catch (InterruptedException e) {
                    System.out.println("Error: Could not close connection to NATS " + e.getMessage());
                }
            }
        }
    }

}
