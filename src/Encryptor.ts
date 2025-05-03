import JSEncrypt from 'jsencrypt'

export const Encrypt = (data: string, encryptionKey: string | null): string | false => {
    if (encryptionKey == null) {
        return false
    }
    
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(encryptionKey)
    return encryptor.encrypt(data)
}