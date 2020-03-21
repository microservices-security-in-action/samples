export interface ValidationParams {
    idToken: string;
    accessToken: string;
    idTokenHeader: object;
    idTokenClaims: object;
    jwks: object;
    loadKeys: () => Promise<object>;
}
/**
 * Interface for Handlers that are hooked in to
 * validate tokens.
 */
export declare abstract class ValidationHandler {
    /**
     * Validates the signature of an id_token.
     */
    abstract validateSignature(validationParams: ValidationParams): Promise<any>;
    /**
     * Validates the at_hash in an id_token against the received access_token.
     */
    abstract validateAtHash(validationParams: ValidationParams): Promise<boolean>;
}
/**
 * This abstract implementation of ValidationHandler already implements
 * the method validateAtHash. However, to make use of it,
 * you have to override the method calcHash.
 */
export declare abstract class AbstractValidationHandler implements ValidationHandler {
    /**
     * Validates the signature of an id_token.
     */
    abstract validateSignature(validationParams: ValidationParams): Promise<any>;
    /**
     * Validates the at_hash in an id_token against the received access_token.
     */
    validateAtHash(params: ValidationParams): Promise<boolean>;
    /**
     * Infers the name of the hash algorithm to use
     * from the alg field of an id_token.
     *
     * @param jwtHeader the id_token's parsed header
     */
    protected inferHashAlgorithm(jwtHeader: object): string;
    /**
     * Calculates the hash for the passed value by using
     * the passed hash algorithm.
     *
     * @param valueToHash
     * @param algorithm
     */
    protected abstract calcHash(valueToHash: string, algorithm: string): Promise<string>;
}
