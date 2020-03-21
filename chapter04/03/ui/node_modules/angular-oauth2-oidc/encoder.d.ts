import { HttpParameterCodec } from '@angular/common/http';
/**
 * This custom encoder allows charactes like +, % and / to be used in passwords
 */
export declare class WebHttpUrlEncodingCodec implements HttpParameterCodec {
    encodeKey(k: string): string;
    encodeValue(v: string): string;
    decodeKey(k: string): string;
    decodeValue(v: string): string;
}
