FROM openjdk:8-jdk-alpine
ADD target/com.manning.mss.ch10.sample01-1.0.0.jar /com.manning.mss.ch10.sample01-1.0.0.jar
ADD keystores/keystore.jks /keystore.jks
ENTRYPOINT ["java", "-jar", "com.manning.mss.ch10.sample01-1.0.0.jar"]