package com.manning.mss.ch08.sample04;

import static io.grpc.MethodDescriptor.generateFullMethodName;
import static io.grpc.stub.ClientCalls.asyncBidiStreamingCall;
import static io.grpc.stub.ClientCalls.asyncClientStreamingCall;
import static io.grpc.stub.ClientCalls.asyncServerStreamingCall;
import static io.grpc.stub.ClientCalls.asyncUnaryCall;
import static io.grpc.stub.ClientCalls.blockingServerStreamingCall;
import static io.grpc.stub.ClientCalls.blockingUnaryCall;
import static io.grpc.stub.ClientCalls.futureUnaryCall;
import static io.grpc.stub.ServerCalls.asyncBidiStreamingCall;
import static io.grpc.stub.ServerCalls.asyncClientStreamingCall;
import static io.grpc.stub.ServerCalls.asyncServerStreamingCall;
import static io.grpc.stub.ServerCalls.asyncUnaryCall;
import static io.grpc.stub.ServerCalls.asyncUnimplementedStreamingCall;
import static io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall;

/**
 * <pre>
 *The inventory service
 * </pre>
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.20.0)",
    comments = "Source: inventory.proto")
public final class InventoryGrpc {

  private InventoryGrpc() {}

  public static final String SERVICE_NAME = "sample03.Inventory";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<com.manning.mss.ch08.sample04.Order,
      com.manning.mss.ch08.sample04.UpdateReply> getUpdateInventoryMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "UpdateInventory",
      requestType = com.manning.mss.ch08.sample04.Order.class,
      responseType = com.manning.mss.ch08.sample04.UpdateReply.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.manning.mss.ch08.sample04.Order,
      com.manning.mss.ch08.sample04.UpdateReply> getUpdateInventoryMethod() {
    io.grpc.MethodDescriptor<com.manning.mss.ch08.sample04.Order, com.manning.mss.ch08.sample04.UpdateReply> getUpdateInventoryMethod;
    if ((getUpdateInventoryMethod = InventoryGrpc.getUpdateInventoryMethod) == null) {
      synchronized (InventoryGrpc.class) {
        if ((getUpdateInventoryMethod = InventoryGrpc.getUpdateInventoryMethod) == null) {
          InventoryGrpc.getUpdateInventoryMethod = getUpdateInventoryMethod = 
              io.grpc.MethodDescriptor.<com.manning.mss.ch08.sample04.Order, com.manning.mss.ch08.sample04.UpdateReply>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(
                  "sample03.Inventory", "UpdateInventory"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.manning.mss.ch08.sample04.Order.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.manning.mss.ch08.sample04.UpdateReply.getDefaultInstance()))
                  .setSchemaDescriptor(new InventoryMethodDescriptorSupplier("UpdateInventory"))
                  .build();
          }
        }
     }
     return getUpdateInventoryMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static InventoryStub newStub(io.grpc.Channel channel) {
    return new InventoryStub(channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static InventoryBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    return new InventoryBlockingStub(channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static InventoryFutureStub newFutureStub(
      io.grpc.Channel channel) {
    return new InventoryFutureStub(channel);
  }

  /**
   * <pre>
   *The inventory service
   * </pre>
   */
  public static abstract class InventoryImplBase implements io.grpc.BindableService {

    /**
     */
    public void updateInventory(com.manning.mss.ch08.sample04.Order request,
        io.grpc.stub.StreamObserver<com.manning.mss.ch08.sample04.UpdateReply> responseObserver) {
      asyncUnimplementedUnaryCall(getUpdateInventoryMethod(), responseObserver);
    }

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return io.grpc.ServerServiceDefinition.builder(getServiceDescriptor())
          .addMethod(
            getUpdateInventoryMethod(),
            asyncUnaryCall(
              new MethodHandlers<
                com.manning.mss.ch08.sample04.Order,
                com.manning.mss.ch08.sample04.UpdateReply>(
                  this, METHODID_UPDATE_INVENTORY)))
          .build();
    }
  }

  /**
   * <pre>
   *The inventory service
   * </pre>
   */
  public static final class InventoryStub extends io.grpc.stub.AbstractStub<InventoryStub> {
    private InventoryStub(io.grpc.Channel channel) {
      super(channel);
    }

    private InventoryStub(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected InventoryStub build(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      return new InventoryStub(channel, callOptions);
    }

    /**
     */
    public void updateInventory(com.manning.mss.ch08.sample04.Order request,
        io.grpc.stub.StreamObserver<com.manning.mss.ch08.sample04.UpdateReply> responseObserver) {
      asyncUnaryCall(
          getChannel().newCall(getUpdateInventoryMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * <pre>
   *The inventory service
   * </pre>
   */
  public static final class InventoryBlockingStub extends io.grpc.stub.AbstractStub<InventoryBlockingStub> {
    private InventoryBlockingStub(io.grpc.Channel channel) {
      super(channel);
    }

    private InventoryBlockingStub(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected InventoryBlockingStub build(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      return new InventoryBlockingStub(channel, callOptions);
    }

    /**
     */
    public com.manning.mss.ch08.sample04.UpdateReply updateInventory(com.manning.mss.ch08.sample04.Order request) {
      return blockingUnaryCall(
          getChannel(), getUpdateInventoryMethod(), getCallOptions(), request);
    }
  }

  /**
   * <pre>
   *The inventory service
   * </pre>
   */
  public static final class InventoryFutureStub extends io.grpc.stub.AbstractStub<InventoryFutureStub> {
    private InventoryFutureStub(io.grpc.Channel channel) {
      super(channel);
    }

    private InventoryFutureStub(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected InventoryFutureStub build(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      return new InventoryFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.manning.mss.ch08.sample04.UpdateReply> updateInventory(
        com.manning.mss.ch08.sample04.Order request) {
      return futureUnaryCall(
          getChannel().newCall(getUpdateInventoryMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_UPDATE_INVENTORY = 0;

  private static final class MethodHandlers<Req, Resp> implements
      io.grpc.stub.ServerCalls.UnaryMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ServerStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ClientStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.BidiStreamingMethod<Req, Resp> {
    private final InventoryImplBase serviceImpl;
    private final int methodId;

    MethodHandlers(InventoryImplBase serviceImpl, int methodId) {
      this.serviceImpl = serviceImpl;
      this.methodId = methodId;
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public void invoke(Req request, io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        case METHODID_UPDATE_INVENTORY:
          serviceImpl.updateInventory((com.manning.mss.ch08.sample04.Order) request,
              (io.grpc.stub.StreamObserver<com.manning.mss.ch08.sample04.UpdateReply>) responseObserver);
          break;
        default:
          throw new AssertionError();
      }
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public io.grpc.stub.StreamObserver<Req> invoke(
        io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        default:
          throw new AssertionError();
      }
    }
  }

  private static abstract class InventoryBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    InventoryBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return com.manning.mss.ch08.sample04.InventoryProto.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("Inventory");
    }
  }

  private static final class InventoryFileDescriptorSupplier
      extends InventoryBaseDescriptorSupplier {
    InventoryFileDescriptorSupplier() {}
  }

  private static final class InventoryMethodDescriptorSupplier
      extends InventoryBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final String methodName;

    InventoryMethodDescriptorSupplier(String methodName) {
      this.methodName = methodName;
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.MethodDescriptor getMethodDescriptor() {
      return getServiceDescriptor().findMethodByName(methodName);
    }
  }

  private static volatile io.grpc.ServiceDescriptor serviceDescriptor;

  public static io.grpc.ServiceDescriptor getServiceDescriptor() {
    io.grpc.ServiceDescriptor result = serviceDescriptor;
    if (result == null) {
      synchronized (InventoryGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new InventoryFileDescriptorSupplier())
              .addMethod(getUpdateInventoryMethod())
              .build();
        }
      }
    }
    return result;
  }
}
