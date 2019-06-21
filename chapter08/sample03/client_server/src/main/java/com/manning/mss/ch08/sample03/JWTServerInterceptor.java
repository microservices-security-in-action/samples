package com.manning.mss.ch08.sample03;

import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;

public class JWTServerInterceptor implements ServerInterceptor {

    private static final ServerCall.Listener NOOP_LISTENER = new ServerCall.Listener() {
    };

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(ServerCall<ReqT, RespT> serverCall,
                                                                 Metadata metadata,
                                                                 ServerCallHandler<ReqT, RespT> serverCallHandler) {
        // Get token from Metadata
        // Capture the JWT token and just print it out.
        String token = metadata.get(Constants.JWT_KEY);
        System.out.println("Received Token: " + token);

        if (!validateJWT(token)) {
            serverCall.close(Status.UNAUTHENTICATED.withDescription("JWT Token is missing from Metadata"), metadata);
            return NOOP_LISTENER;
        }

        return serverCallHandler.startCall(serverCall, metadata);
    }

    private boolean validateJWT(String token){
        //TODO - write code to actually validate the token

        //return true as long as the token has a value.
        return token != null && token.length() > 0;
    }

}
