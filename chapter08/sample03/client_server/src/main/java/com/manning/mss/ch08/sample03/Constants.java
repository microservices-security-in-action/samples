package com.manning.mss.ch08.sample03;

import io.grpc.Metadata;

import static io.grpc.Metadata.ASCII_STRING_MARSHALLER;

public class Constants {

    private Constants(){
    }

    public static final Metadata.Key<String> JWT_KEY = Metadata.Key.of("jwt", ASCII_STRING_MARSHALLER);

}
