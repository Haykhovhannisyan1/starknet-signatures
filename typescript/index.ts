import { Account, ec, encode, TypedData, Signer, typedData, WeierstrassSignatureType, RpcProvider, cairo } from 'starknet';

async function main() {
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/Tl9Eoq7xWPNCz3TCvW1HQ381lmKIMeFpc' });
    const privateKey = '0xa711f973af75cfb5813b26c80e092312ead9180ef1a8bc7b327c9b6d8e88e9';
    const starknetPublicKey = ec.starkCurve.getStarkKey(privateKey);
    const signer = new Signer(privateKey);
    const account = new Account(provider, starknetPublicKey, privateKey);

    const fullPublicKey = encode.addHexPrefix(
        encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))
    );
    const Y = encode.addHexPrefix(fullPublicKey.slice(68));

    console.log("Full public key: ", fullPublicKey)
    console.log("Coordinates of the public key: x=", starknetPublicKey, ", y=", Y)

    const lockMessage: TypedData = {
        types: {
            StarkNetDomain: [
                { name: "name", type: "felt" },
                { name: "chainId", type: "felt" },
                { name: "version", type: "felt" },
            ],
            Message: [
                { name: "Id", type: "u256" },
                { name: "hashlock", type: "u256" },
                { name: "timelock", type: "u64" },
            ],
            u256: [
                { name: "low", type: "felt" },
                { name: "high", type: "felt" },
            ],
        },
        primaryType: "Message",
        domain: {
            name: "LayerswapV8",
            chainId: "StarkNet",
            version: "1",
        },
        message: {
            Id: {
                low: '0xb779a0b9221ccf812563255c8b37b38e',
                high: '0x725175f0914ba625971f8bc39c90bec1',
            },
            hashlock: {
                low: '0x064a62282e241f27696c475a0fbece39',
                high: '0x0eaa55cd755940d5fd1466fcbd515999',
            },
            timelock: 232145342212,
        },
    };

    const messageHash = typedData.getMessageHash(lockMessage, BigInt(starknetPublicKey));
    console.log("Message hash: ", messageHash);

    const signature = (await signer.signMessage(lockMessage, starknetPublicKey)) as WeierstrassSignatureType;
    const isValid = ec.starkCurve.verify(signature, messageHash, fullPublicKey);
    // const signature2 = (await account.signMessage(lockMessage)) as WeierstrassSignatureType;
    // const result = await account.verifyMessage(lockMessage, signature2);
    // const result2 = await account.verifyMessageHash(messageHash, signature2);

    console.log(signature)
    console.log("Signature is valid: ", isValid)
    // console.log(signature2)
    // console.log("result is valid: ", result)
}
main()
