package com.manning.mss.ch03.sample04.filters;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;

import java.io.DataOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import javax.servlet.http.HttpServletRequest;

public class OAuthFilter extends ZuulFilter {

    private static Logger log = LoggerFactory.getLogger(OAuthFilter.class);

    @Autowired
    private Environment env;

    public String filterType() {

        return "pre";
    }

    public int filterOrder() {

        return 1;
    }

    public boolean shouldFilter() {

        return true;
    }

    public Object run() {

        RequestContext requestContext = RequestContext.getCurrentContext();
        HttpServletRequest request = requestContext.getRequest();

        //Avoid checking for authentication for the token endpoint
        if(request.getRequestURI().startsWith("/token")){
            return null;
        }

        //Get the value of the Authorization header.
        String authHeader = request.getHeader("Authorization");

        //If the Authorization  header doesn't exist or is not in a valid format.
        if (StringUtils.isEmpty(authHeader)) {
            log.error("No auth header found");
            //Send error to client
            handleError(requestContext);
            return null;
        }
        else if(authHeader.split("Bearer ").length != 2){
            log.error("Invalid auth header");
            //Send error to client
            handleError(requestContext);
            return null;
        }

        DataOutputStream outputStream = null;

        //Get the value of the token by splitting the Authorization header
        String token = authHeader.split("Bearer ")[1];

        String oauthServerURL = env.getProperty("authserver.introspection.endpoint");

        try {
            URL url = new URL(oauthServerURL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setRequestProperty("Authorization", "Basic YXBwbGljYXRpb24xOmFwcGxpY2F0aW9uMXNlY3JldA==");

            String urlParameters = "token=" + token;

            //Send post request to authorization server to validate token
            connection.setDoOutput(true);
            outputStream = new DataOutputStream(connection.getOutputStream());
            outputStream.writeBytes(urlParameters);

            int responseCode = connection.getResponseCode();

            //If the authorization server doesn't respond with a 200.
            if (responseCode != 200) {
                log.error("Response code from authz server is " + responseCode);
                handleError(requestContext);
            }

        } catch (MalformedURLException e) {
            log.error("Malformed URL: " + oauthServerURL, e);
            handleError(requestContext);
        } catch (IOException e) {
            log.error("IOException occurred ", e);
            handleError(requestContext);
        } finally {
            if (outputStream != null) {
                try {
                    outputStream.flush();
                    outputStream.close();
                } catch (IOException e) {
                    log.error("Could not close or flush the output stream", e);
                }
            }
        }
        return null;
    }

    private void handleError(RequestContext requestContext) {

        requestContext.setResponseStatusCode(HttpStatus.UNAUTHORIZED.value());
        requestContext.setResponseBody("{\"error\": true, \"reason\":\"Authentication Failed\"}");
        requestContext.setSendZuulResponse(false);
    }
}
