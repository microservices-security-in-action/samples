import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { OAuthModule, AuthConfig, JwksValidationHandler, ValidationHandler, OAuthStorage, OAuthModuleConfig } from 'angular-oauth2-oidc';
import { RouterModule } from '@angular/router';

const config: AuthConfig = {
  issuer: 'http://localhost:8080/',
  loginUrl: 'http://localhost:8081/oauth/authorize',
  tokenEndpoint: 'http://localhost:8081/oauth/token',
  dummyClientSecret: '123456',
  clientId: 'clientapp',
  disablePKCE: true,
  responseType: 'code',
  oidc: true,
  requireHttps: false,
  strictDiscoveryDocumentValidation: false,
  customQueryParams: { audience: 'https://bookstore.app' },
  redirectUri: window.location.origin + '/',
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
  scope: 'openid',
  requestAccessToken: true,
  skipIssuerCheck: true,
  showDebugInformation: true,

};

config.logoutUrl = `${config.issuer}v2/logout?client_id=${config.clientId}&returnTo=${encodeURIComponent(config.redirectUri)}`;

const authModuleConfig: OAuthModuleConfig = {
  // Add the Bearer header for these URLs (APIs).
  resourceServer: {
    allowedUrls: ['http://localhost:8080'],
    sendAccessToken: true,
  },
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OAuthModule.forRoot(authModuleConfig),
    RouterModule.forRoot([
      { path: '', component: AppComponent }])
  ],
  providers: [
    { provide: OAuthModuleConfig, useValue: authModuleConfig },
    { provide: ValidationHandler, useClass: JwksValidationHandler },
    { provide: OAuthStorage, useValue: localStorage },
    { provide: AuthConfig, useValue: config },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
