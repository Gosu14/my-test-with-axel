import { Notifier, Ledger, JSON, Crypto } from '@klave/sdk';
import { FetchInput, FetchOutput, StoreInput, StoreOutput, ErrorMessage } from './types';
import { encode as b64encode, decode as b64decode } from 'as-base64/assembly';

const convertToNumberArray = function (input: Uint8Array): u8[] {
    let ret: u8[] = []
    for (let i = 0; i < input.length; ++i)
        ret[i] = input[i];

    return ret; 
}

const convertToUint8Array = function (input: u8[]): Uint8Array {
    let value = new Uint8Array(input.length);
    for (let i = 0; i < input.length; ++i)
        value[i] = input[i];

    return value;
    
}

const myTableName = "my_storage_table";

/**
 * @query
 */
export function ping(): void {
    Notifier.sendString("pong-ping-boom");
}

/**
* @query
*/
export function digest(input: string): void {
    const digest = Crypto.SHA.digest(input);
    if(digest)
    {
        const value = convertToUint8Array(digest);
        const digestAsString = b64encode(value);
        Notifier.sendJson<string>(digestAsString);
    }else{
        Notifier.sendJson<string>("ERROR: Generating SHA256 issue");
    }
}

/**
 * @query
 * @param {FetchInput} input - A parsed input argument
 */
export function fetchValue(input: FetchInput): void {

    let value = Ledger.getTable(myTableName).get(input.key);
    if (value.length === 0) {
        Notifier.sendJson<ErrorMessage>({
            success: false,
            message: `key '${input.key}' not found in table`
        });
    } else {
        Notifier.sendJson<FetchOutput>({
            success: true,
            value
        });
    }
}

/**
* @transaction
*/
export function generateNewSigningKey(keyName: string): void {
    const key = Crypto.ECDSA.generateKey(keyName);
    if (key) {
        Notifier.sendJson<string>(`SUCCESS: Key '${keyName}' has been generated`);
    } else {
        Notifier.sendJson<string>(`ERROR: Key '${keyName}' has not been generated`);
    }
}

/**
 * @transaction
 * @param {StoreInput} input - A parsed input argument
 */
export function storeValue(input: StoreInput): void {

    if (input.key && input.value) {
        Ledger.getTable(myTableName).set(input.key, input.value);
        Notifier.sendJson<StoreOutput>({
            success: true
        });
        return;
    }

    Notifier.sendJson<ErrorMessage>({
        success: false,
        message: `Missing value arguments`
    });
}
