import { Notifier, Ledger, JSON, Crypto } from '@klave/sdk';
import { FetchInput, FetchOutput, StoreInput, StoreOutput, SignInput, SignOutput, VerifyInput, VerifyOutput, EncryptInput, EncryptOutput, DecryptInput, DecryptOutput, ErrorMessage } from './types';
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
    Notifier.sendString("pong-ping-boom-bada");
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
* @query
*/
export function encrypt(input: EncryptInput): void {
    const key = Crypto.AES.getKey(input.keyName);

    if (key) {
        const messagCypher = key.encrypt(input.message);
        if (messagCypher) {
            const value = convertToUint8Array(messagCypher);
            const cypherAsString = b64encode(value);

            Notifier.sendJson<EncryptOutput>({
                success: true,
                cypher: cypherAsString
            });
        } else {
            {
                Notifier.sendJson<EncryptOutput>({
                    success: false,
                    cypher: ""
                });
            }
        }
    } else {
        Notifier.sendJson<EncryptOutput>({
            success: false,
            cypher: ""
        });
    }
}

/**
* @query
*/
export function decrypt(input: DecryptInput): void {
    const key = Crypto.AES.getKey(input.keyName);
    const cyph = b64decode(input.cypher);
    const ret = convertToNumberArray(cyph);

    if (key && ret) {
        const messagCypher = key.decrypt(ret);
        Notifier.sendJson<DecryptOutput>({
            success: true,
            message: messagCypher
        });
    } else {
        Notifier.sendJson<DecryptOutput>({
            success: false,
            message: ""
        });
    }
}

/**
* @query
*/
export function sign(input: SignInput): void {
    const key = Crypto.ECDSA.getKey(input.keyName);
    if(key)
    {
        const signature = key.sign(input.message);
        if (signature) {
            const value = convertToUint8Array(signature);
            const signatureAsString = b64encode(value);

            Notifier.sendJson<SignOutput>({
                success: true,
                signature: signatureAsString
            });
        } else {
            {
                Notifier.sendJson<SignOutput>({
                    success: false,
                    signature: ""
                });
            }
        }
    }else {
        Notifier.sendJson<SignOutput>({
            success: false,
            signature: ""
        });
    }
}

/**
* @query
*/
export function verify(input: VerifyInput): void {
    const key = Crypto.ECDSA.getKey(input.keyName);
    const signature = b64decode(input.signature);
    const ret = convertToNumberArray(signature);

    if (key && ret) {
        const isGood = key.verify(input.message, ret);
        Notifier.sendJson<VerifyOutput>({
            success: true,
            isVerified: isGood
        });
    } else {
        Notifier.sendJson<VerifyOutput>({
            success: false,
            isVerified: false
        });
    }
}

/**
* @transaction
*/
export function generateNewEncryptionKey(keyName: string): void {
    const key = Crypto.AES.generateKey(keyName);
    if (key) {
        Notifier.sendJson<string>(`SUCCESS: Key '${keyName}' has been generated`);
    } else {
        Notifier.sendJson<string>(`ERROR: Key '${keyName}' has not been generated`);
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
