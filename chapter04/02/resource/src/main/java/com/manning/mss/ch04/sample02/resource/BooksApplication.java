package com.manning.mss.ch04.sample02.resource;

import com.manning.mss.ch04.sample02.resource.entities.Book;
import com.manning.mss.ch04.sample02.resource.entities.BookRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.stream.Stream;

@SpringBootApplication
public class BooksApplication {

    public static void main(String[] args) {
        SpringApplication.run(BooksApplication.class, args);
    }

    @Bean
    ApplicationRunner init(BookRepository repository) {
        return args -> {
            Stream.of("Microservices Security In Action", "Real World Cryptography", "Core Kubernetes", "Secure By Design",
                    "API Design Patterns", "Kafka Streams In Action", "Docker In Action", "Istio In Action",
                    "Understanding API Security").forEach(name -> {
                Book book = new Book();
                book.setName(name);
                repository.save(book);
            });
            repository.findAll().forEach(System.out::println);
        };
    }
}
