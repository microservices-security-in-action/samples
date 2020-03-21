package com.manning.mss.ch04.sample02.resource;

import com.manning.mss.ch04.sample02.resource.entities.Book;
import com.manning.mss.ch04.sample02.resource.entities.BookRepository;
import com.manning.mss.ch04.sample02.resource.entities.OIDCConfig;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
public class BookController {

    private BookRepository repository;

    public BookController(BookRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/books")
    public Collection<Book> getBooks() {
        System.out.println("Executing GET /books");
        return repository.findAll();
    }

    @GetMapping("/.well-known/openid-configuration")
    public OIDCConfig getOIDCConfig() {

        OIDCConfig oidcConfig = new OIDCConfig();

        oidcConfig.setToken_endpoint("http://localhost:8081/oauth/token");
        oidcConfig.setIssuer("http://localhost:8081/");
        oidcConfig.setAuthorization_endpoint("http://localhost:8081/oauth/authorize");
        oidcConfig.setUserinfo_endpoint("http://localhost:8081/api/users/me");

        return oidcConfig;
    }

}
