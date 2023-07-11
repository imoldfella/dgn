
// return this from login process? anything else? a screen name
export interface LoginInfo {
    home: string,
    email: string,
    phone: string,
    cookies: string[],
    options: number

    deviceDid: string
    devicePrivate: string
    deviceName: string
  
    registered: boolean
    autoconnectUntil: number
    token?: string

    name: string,
    did: string
    private: string
    ucanLogin: string
    bip39: boolean
}


export interface ChallengeNotify {
    challenge_type: number
    challenge_sent_to: string
    other_options: number
    login_info?: LoginInfo
    passkey_nag?: boolean
}

export interface LoginApi {
    loginpassword: (user: string, password: string) => Promise<[ChallengeNotify,string]>
    loginpassword2: (secret: string) => Promise<[LoginInfo,string]>
    register(name: string): Promise<any>
    registerb(cred: any): Promise<[string,string]>
    addpasskey(): Promise<any>
    addpasskey2(cred:any): Promise<[string,string]>
    login2(cred: any): Promise<LoginInfo>
    login(deviceId: string) : Promise<any>
    recover(email: string, phone: string) : Promise<void>
    recover2(otp: string) : Promise<void>
}


export interface LoginConfig {
    api: LoginApi
    createAccount?: string
    recoverUser?: string
    recoverPassword?: string
    afterLogin?: string
    setLogin: (sec: LoginInfo) => void
}

interface Option {
    name: string
    default: boolean
    allowed: boolean
}

interface PasswordRules {
    kinds: number
    length: number
}

interface SecurityPolicy {
    options: {
        [key: string]: Option
    }
    passwordRules: PasswordRules
}
