package com.manning.mss.ch13.sample02.paymententity;

public class PaymentDetail {

    private String cardNo;

    private String expiryDate;

    private int cvc;

    private String amount;

    public String getCardNo() {

        return cardNo;
    }

    public void setCardNo(String cardNo) {

        this.cardNo = cardNo;
    }

    public String getExpiryDate() {

        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {

        this.expiryDate = expiryDate;
    }

    public int getCvc() {

        return cvc;
    }

    public void setCvc(int cvc) {

        this.cvc = cvc;
    }

    public String getAmount() {

        return amount;
    }

    public void setAmount(String amount) {

        this.amount = amount;
    }
}
