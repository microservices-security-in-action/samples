package com.manning.mss.ch05.sample01.gateway.filters;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

import javax.servlet.http.HttpServletRequest;

/**
 * Class that does throttling of requests
 */
public class ThrottlingFilter extends ZuulFilter {

    private static Logger log = LoggerFactory.getLogger(ThrottlingFilter.class);

    //Create a counter cache where each entry expires in 1 minute and the cache is cleared every 10 seconds.
    //Maximum number of entries in the cache would be 10000.
    private CounterCache counter = new CounterCache(60, 10, 10000);

    public String filterType() {

        return "pre";
    }

    public int filterOrder() {

        return 2;
    }

    public boolean shouldFilter() {

        return true;
    }

    @Override
    public Object run() {

        log.info("Executing Throttling Filter");

        RequestContext requestContext = RequestContext.getCurrentContext();
        HttpServletRequest request = requestContext.getRequest();

        //Avoid throttling the token endpoint
        if (request.getRequestURI().startsWith("/token")) {
            return null;
        }

        //Get the value of the Authorization header.
        String authHeader = request.getHeader("Authorization");

        //If the Authorization  header doesn't exist or is not in a valid format.
        if (StringUtils.isEmpty(authHeader)) {
            log.warn("No auth header found, not throttling");
            return null;
        }

        //Get the value of the token by splitting the Authorization header
        String key = authHeader.split("Bearer ")[1];

        log.info("Checking key.." + key);

        Object count = counter.get(key);

        //If key doesn't exist in cache.
        if (count == null) {
            log.info("Counter doesn't exist, putting count as 1");
            //Put count to cache as 1
            synchronized (key) {
                counter.put(key, 1);
            }
        }
        //If count is greater than or equal to 5
        else if ((int) count >= 5) {
            log.info("Counter is greater than 5. Returning error");
            //Quota exceeded. Return error
            handleError(requestContext);
        }
        else {
            log.info("Current count is " + (int)count + " incrementing by 1");
            //Increment counter by 1
            synchronized (key) {
                counter.put(key, (int)count + 1);
            }
        }

        return null;
    }

    private void handleError(RequestContext requestContext) {

        requestContext.setResponseStatusCode(HttpStatus.TOO_MANY_REQUESTS.value());
        requestContext.setResponseBody("{\"error\": true, \"reason\":\"Request Throttled.\"}");
        requestContext.setSendZuulResponse(false);
    }
}
