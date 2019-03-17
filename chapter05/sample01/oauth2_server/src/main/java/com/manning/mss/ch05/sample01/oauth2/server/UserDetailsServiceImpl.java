package com.manning.mss.ch05.sample01.oauth2.server;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;

public class UserDetailsServiceImpl implements UserDetailsService {

    private Map<String, User> users;

    public UserDetailsServiceImpl() {

        users = new HashMap<>();

        User nuwan = new User("nuwan", "nuwan123", new String[]{"buyer", "seller", "priv-buyer"});

        users.put(nuwan.getUsername(), nuwan);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        if (!users.containsKey(username)) {
            throw new UsernameNotFoundException("User " + username + " not found!");
        }

        org.springframework.security.core.userdetails.User.UserBuilder builder = null;

        User user = users.get(username);

        builder = org.springframework.security.core.userdetails.User.withUsername(user.getUsername());
        builder.password(new BCryptPasswordEncoder().encode(user.getPassword()));
        builder.roles(user.getRoles());

        return builder.build();
    }

}
