package com.manning.mss.appendixb.sample02;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.crypto.NoSuchPaddingException;

import com.nimbusds.jose.EncryptionMethod;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWEAlgorithm;
import com.nimbusds.jose.JWEDecrypter;
import com.nimbusds.jose.JWEEncrypter;
import com.nimbusds.jose.JWEHeader;
import com.nimbusds.jose.crypto.RSADecrypter;
import com.nimbusds.jose.crypto.RSAEncrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;

public class RSAOAEPJWTBuilder {

	public static void main(String[] args) throws ParseException, JOSEException, NoSuchAlgorithmException,
			NoSuchProviderException, NoSuchPaddingException {
		//buildEncryptedJWT(generateKeyPair().getPublic());
		
		decryptJWT();
	}

	public static KeyPair generateKeyPair() throws NoSuchAlgorithmException {

		// instantiate KeyPairGenerate with RSA algorithm.
		KeyPairGenerator keyGenerator = KeyPairGenerator.getInstance("RSA");

		// set the key size to 1024 bits.
		keyGenerator.initialize(1024);

		// generate and return private/public key pair.
		return keyGenerator.genKeyPair();
	}

	public static String buildEncryptedJWT(PublicKey publicKey) throws JOSEException {

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

		// create JWE header with RSA-OAEP and AES/GCM.
		JWEHeader jweHeader = new JWEHeader(JWEAlgorithm.RSA_OAEP, EncryptionMethod.A128GCM);

		// create encrypter with the RSA public key.
		JWEEncrypter encrypter = new RSAEncrypter((RSAPublicKey) publicKey);

		// create the encrypted JWT with the JWE header and the JWT payload.
		EncryptedJWT encryptedJWT = new EncryptedJWT(jweHeader, jwtClaims);

		// encrypt the JWT.
		encryptedJWT.encrypt(encrypter);

		// serialize into base64-encoded text.
		String jwtInText = encryptedJWT.serialize();

		// print the value of the JWT.
		System.out.println(jwtInText);

		return jwtInText;
	}

	public static void decryptJWT() throws NoSuchAlgorithmException, JOSEException, ParseException {

		// generate private/public key pair.
		KeyPair keyPair = generateKeyPair();

		// get the private key - used to decrypt the message.
		PrivateKey privateKey = keyPair.getPrivate();

		// get the public key - used to encrypt the message.
		PublicKey publicKey = keyPair.getPublic();

		// get encrypted JWT in base64-encoded text.
		String jwtInText = buildEncryptedJWT(publicKey);

		// create a decrypter.
		JWEDecrypter decrypter = new RSADecrypter((RSAPrivateKey) privateKey);

		// create the encrypted JWT with the base64-encoded text.
		EncryptedJWT encryptedJWT = EncryptedJWT.parse(jwtInText);

		// decrypt the JWT.
		encryptedJWT.decrypt(decrypter);

		// print the value of JOSE header.

		System.out.println("JWE Header:" + encryptedJWT.getHeader());

		// JWE content encryption key.
		System.out.println("JWE Content Encryption Key: " + encryptedJWT.getEncryptedKey());

		// initialization vector.
		System.out.println("Initialization Vector: " + encryptedJWT.getIV());

		// ciphertext.
		System.out.println("Ciphertext : " + encryptedJWT.getCipherText());

		// authentication tag.
		System.out.println("Authentication Tag: " + encryptedJWT.getAuthTag());

		// print the value of JWT body
		System.out.println("Decrypted Payload: " + encryptedJWT.getPayload());
	}

}
