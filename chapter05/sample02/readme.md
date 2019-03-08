# Monitoring Spring Boot Applications with Prometheus and Grafana

This small demo project contains an example setup of Prometheus and Grafana to monitor Spring Boot applications.

The project contains a default Grafana Prometheus datasource and scrapes the Spring Boot project and Prometheus server 
for monitoring information.

If you want to login to Grafana you can use the `admin / password` combination.

For monitoring Spring Boot applications I highly recommend the [JVM Micrometer dashboard](https://grafana.com/dashboards/4701) created by [Michael Weirauch](https://twitter.com/emwexx).

## Building the project

First build the spring boot application.

```bash
mvn clean package
```

Now when the application has been build we can start running our services by running:

```bash
docker-compose up
```

After all services have started successfully, you can navigate to the following urls:

- Spring Boot app - http://localhost:8080/
- Prometheus      - http://localhost:9090/
- Grafana         - http://localhost:3000/

