export declare type EventType = 'discovery_document_loaded' | 'jwks_load_error' | 'invalid_nonce_in_state' | 'discovery_document_load_error' | 'discovery_document_validation_error' | 'user_profile_loaded' | 'user_profile_load_error' | 'token_received' | 'token_error' | 'code_error' | 'token_refreshed' | 'token_refresh_error' | 'silent_refresh_error' | 'silently_refreshed' | 'silent_refresh_timeout' | 'token_validation_error' | 'token_expires' | 'session_changed' | 'session_error' | 'session_terminated' | 'logout' | 'popup_closed' | 'popup_blocked';
export declare abstract class OAuthEvent {
    readonly type: EventType;
    constructor(type: EventType);
}
export declare class OAuthSuccessEvent extends OAuthEvent {
    readonly info: any;
    constructor(type: EventType, info?: any);
}
export declare class OAuthInfoEvent extends OAuthEvent {
    readonly info: any;
    constructor(type: EventType, info?: any);
}
export declare class OAuthErrorEvent extends OAuthEvent {
    readonly reason: object;
    readonly params: object;
    constructor(type: EventType, reason: object, params?: object);
}
