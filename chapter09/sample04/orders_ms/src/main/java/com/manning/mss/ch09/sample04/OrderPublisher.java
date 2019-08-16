package com.manning.mss.ch09.sample04;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.messaging.Source;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.stereotype.Service;

import com.manning.mss.ch09.sample04.model.Order;

@Service
public class OrderPublisher {

    static {
        javax.net.ssl.HttpsURLConnection.setDefaultHostnameVerifier(
                new javax.net.ssl.HostnameVerifier() {

                    public boolean verify(String hostname,
                                          javax.net.ssl.SSLSession sslSession) {

                        if (hostname.equals("localhost")) {
                            return true;
                        }
                        return false;
                    }
                });
    }

    @Autowired
    private Source source;

    public void publish(Order order) {

        source.output().send(MessageBuilder.withPayload(order).build());
    }

}
