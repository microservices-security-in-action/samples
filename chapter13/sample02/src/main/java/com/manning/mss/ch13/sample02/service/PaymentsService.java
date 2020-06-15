package com.manning.mss.ch13.sample02.service;

import com.manning.mss.ch13.sample02.paymententity.PaymentDetail;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentsService {

    @RequestMapping("/payment")
    public String pay(@RequestBody PaymentDetail paymentDetail) {
        return "Payment Successful";
    }


}
