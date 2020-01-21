package com.manning.mss.ch09.sample05.natssub;

import io.nats.client.Connection;
import io.nats.client.Message;
import io.nats.client.Nats;
import io.nats.client.Subscription;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class NatsSubscriber {

    public static void main(String[] args) {

        Connection natsConnection = null;
        try {
            //Connect to the NATS server
            natsConnection = Nats.connect("nats://localhost:4222");

            //Subscribe to subject "updates"
            Subscription sub = natsConnection.subscribe("updates");
            Message msg = sub.nextMessage(Duration.ZERO);

            //Print the received message.
            String str = new String(msg.getData(), StandardCharsets.UTF_8);
            System.out.print("Received message: ");
            System.out.println(str);

        } catch (IOException | InterruptedException e) {
            System.out.println("Error: Could not connect to NATS server " + e.getMessage());
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
