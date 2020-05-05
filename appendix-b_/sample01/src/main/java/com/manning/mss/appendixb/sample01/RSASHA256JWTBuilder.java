package com.manning.mss.appendixb.sample01;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.interfaces.RSAPrivateKey;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

public class RSASHA256JWTBuilder {

	public static void main(String[] args) throws ParseException, JOSEException, NoSuchAlgorithmException {
		buildRsaSha256SignedJWT(generateKeyPair().getPrivate());
	}
	
	public static KeyPair generateKeyPair() throws NoSuchAlgorithmException {

		// instantiate KeyPairGenerate with RSA algorithm.
		KeyPairGenerator keyGenerator = KeyPairGenerator.getInstance("RSA");

		// set the key size to 1024 bits.
		keyGenerator.initialize(1024);

		// generate and return private/public key pair.
		return keyGenerator.genKeyPair();
	}


	public static String buildRsaSha256SignedJWT(PrivateKey privateKey) throws JOSEException {

		// build audience restriction list.
		List<String> aud = new ArrayList<String>();
		aud.add("*.ecommm.com");

		Date currentTime = new Date();

		// create a claim set.
		JWTClaimsSet jwtClaims = new JWTClaimsSet.Builder().
				// set the value of the issuer.
				issuer("sts.ecomm.com").
				// set the subject value - JWT belongs to this subject.
				subject("peter").
				// set values for audience restriction.
				audience(aud).
				// expiration time set to 10 minutes.
				expirationTime(new Date(new Date().getTime() + 1000 * 60 * 10)).
				// set the valid from time to current time.
				notBeforeTime(currentTime).
				// set issued time to current time.
				issueTime(currentTime).
				// set a generated UUID as the JWT identifier.
				jwtID(UUID.randomUUID().toString()).build();

		// create JWS header with RSA-SHA256 algorithm.
		JWSHeader jswHeader = new JWSHeader(JWSAlgorithm.RS256);

		// create signer with the RSA private key..
		JWSSigner signer = new RSASSASigner((RSAPrivateKey) privateKey);

		// create the signed JWT with the JWS header and the JWT body.
		SignedJWT signedJWT = new SignedJWT(jswHeader, jwtClaims);

		// sign the JWT with HMAC-SHA256.
		signedJWT.sign(signer); 
		

		// serialize into base64-encoded text.
		String jwtInText = signedJWT.serialize();

		// print the value of the JWT.
		System.out.println(jwtInText);

		return jwtInText;
	}

}
