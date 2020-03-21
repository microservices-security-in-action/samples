package com.manning.mss.ch04.sample03.authz.resource;

public class UserProfile {

    private String name;
    private String email;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "UserProfile [name=" + name + ", email=" + email + "]";
    }

}
