package com.manning.mss.ch12.sts.config;

import java.security.KeyPair;
import java.security.interfaces.RSAPrivateKey;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.jwt.crypto.sign.RsaSigner;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.util.JsonParser;
import org.springframework.security.oauth2.common.util.JsonParserFactory;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;

public class CustomJWTEncoder extends JwtAccessTokenConverter {

	private JsonParser objectMapper = JsonParserFactory.create();
	final RsaSigner signer;

	public CustomJWTEncoder(KeyPair keyPair) {
		super();
		super.setKeyPair(keyPair);
		this.signer = new RsaSigner((RSAPrivateKey) keyPair.getPrivate());
	}

	@Override
	protected String encode(OAuth2AccessToken accessToken, OAuth2Authentication authentication) {
		String content;
		try {
			content = this.objectMapper
					.formatMap(getAccessTokenConverter().convertAccessToken(accessToken, authentication));
		} catch (Exception ex) {
			throw new IllegalStateException("Cannot convert access token to JSON", ex);
		}
		Map<String, String> customHeaders = Collections.singletonMap("kid", "d7d87567-1840-4f45-9614-49071fca4d21");
		String token = JwtHelper.encode(content, this.signer, customHeaders).getEncoded();
		return token;
	}

}