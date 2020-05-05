FROM openjdk:8-jdk-alpine
ADD target/com.manning.mss.appendixe.sample01-1.0.0.jar \
/com.manning.mss.appendixe.sample01-1.0.0.jar
ADD keystores/keystore.jks /opt/keystore.jks
ADD keystores/jwt.jks /opt/jwt.jks
ENTRYPOINT ["java", "-jar", \
"com.manning.mss.appendixe.sample01-1.0.0.jar"]
