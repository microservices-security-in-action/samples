# Monitoring Spring Boot Applications with Prometheus and Grafana

In sample 2 of chapter 5 of this book this is an example setup of Prometheus and Grafana to monitor Spring Boot applications.

The project contains a default Grafana Prometheus datasource and scrapes the Spring Boot project and Prometheus server 
for monitoring information.

If you want to login to Grafana you can use the `admin / password` combination.

## Building the project

First build the spring boot application.

```bash
mvn clean install
```

After the application has been built we can start it by executing:

```bash
mvn spring-boot:run
```

Next navigate to the `monitoring` directory and start the Prometheus and Grafana runtimes using the following docker-compose

```bash
docker-compose -f docker-compose.yml up
```

After all services have started successfully, you can navigate to the following urls:

- Spring Boot app - http://localhost:8080/actuator/prometheus
- Prometheus      - http://localhost:9090/
- Grafana         - http://localhost:3000/

