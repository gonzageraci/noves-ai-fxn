import {
    Keypair,
    PublicKey
} from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';

// Sender service
export async function signMessage(keypair: Keypair, payload: any) {
    try {
        // Convert payload to buffer
        const payloadBuffer = Buffer.from(
            typeof payload === 'string' ? payload : JSON.stringify(payload)
        );

        // Sign the payload
        const signature = nacl.sign.detached(
            payloadBuffer,
            keypair.secretKey
        );

        return {
            signature: bs58.encode(signature),
            publicKey: keypair.publicKey.toBase58()
        };
    } catch (error) {
        console.error('Error signing message:', error);
        throw error;
    }
}

// Receiver service
export async function verifyMessage(
    message: { payload: any, signature: string, publicKey: string }
) {
    try {
        // Convert signature back to Uint8Array
        const signatureUint8 = bs58.decode(message.signature);

        // Convert payload to buffer
        const payloadBuffer = Buffer.from(
            typeof message.payload === 'object' ?
                JSON.stringify(message.payload) :
                String(message.payload)
        );

        // Convert public key string to PublicKey object
        const publicKey = new PublicKey(message.publicKey);

        // Verify the signature
        const isValid = nacl.sign.detached.verify(
            payloadBuffer,
            signatureUint8,
            publicKey.toBytes()
        );

        return {
            isValid,
            publicKey: message.publicKey,
            originalPayload: message.payload
        };
    } catch (error: any) {
        throw new Error(`Failed to verify message: ${error.message}`);
    }
}
