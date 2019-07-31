FROM openjdk:8-jdk-alpine
ADD target/com.manning.mss.appendixa.sample01-1.0.0.jar /com.manning.mss.appenndixa.sample01-1.0.0.jar
ADD keystores/keystore.jks /keystore.jks
ENTRYPOINT ["java", "-jar", "com.manning.mss.appendixa.sample01-1.0.0.jar"]
