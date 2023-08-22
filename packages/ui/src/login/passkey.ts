/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    parseCreationOptionsFromJSON,
    create,
    get as getPasskey,
    parseRequestOptionsFromJSON,
} from "@github/webauthn-json/browser-ponyfill";

import { Signin  } from "./api"
import { Peer, apiCall } from "../abc";

export interface LoginInfo {
    home: string,
    email: string,
    phone: string,
    cookies: string[],
    options: number
}
export interface ChallengeNotify {
    challenge_type: number
    challenge_sent_to: string
    other_options: number
    login_info?: LoginInfo
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
export function loginApi(ch: Peer): LoginApi {
    return apiCall(ch,"loginpassword", "loginpassword2", "register", "registerb", "addpasskey", "addpasskey2", "login2", "login", "recover", "recover2")
}
// only instantiated on the client, only during login (lazy load all the things)
export class ClientState {
    abort = new AbortController()
    error = ""

    constructor(public api: LoginApi, public onLogin: (x: LoginInfo)=>void, public onError: (x: string)=>void) {
    }
    destroy() {
        this.abort.abort()
    }


    // we need to abort the wait before we can register a new key.
    async webauthnLogin(crox: any) { // id: string, not needed?
        this.abort.abort()
        const o = await getPasskey(crox)
        const reg = this.api.login2(o)
        return reg
        //setLogin(reg)
        // instead of navigate we need get the site first
        // then we can navigate in it. the site might tell us the first url

    }

        // when we set this up we need to start a promise to gather passkeys that are offered
    // This points out the case that we get a passkey that we don't know
    // in this case we still need to get the user name and password
    async watchPasskey() {
        try {
            const i = await this.initPasskey()
            if (i) {
                this.onLogin(i)
            }
            else console.log("passkey watch cancelled")
        }
        catch (e) {
            this.onError (e + "")
        }
    }


    // returns null if the login is aborted
    async initPasskey() {
        if (!window.PublicKeyCredential
            // @ts-ignore
            || !PublicKeyCredential.isConditionalMediationAvailable
            // @ts-ignore
            || !await PublicKeyCredential.isConditionalMediationAvailable()
        ) {
            return null
        }
        this.abort.abort()
        this.abort = new AbortController()
        //const ws = createWs()

        // if we loop here, do we need to do first  part twice
        // this will return nil if the user is not registered?
        // that doesn't seem right
        {
            try {
                const o2 = await this.api.login(sec.deviceDid)
                // await ws.rpcj<any>("login", {
                //     device: sec.deviceDid,
                // })

                const cro = parseRequestOptionsFromJSON(o2)

                console.log("waiting for sign")
                const o = await getPasskey({
                    publicKey: cro.publicKey,
                    signal: this.abort.signal,
                    // @ts-ignore
                    mediation: 'conditional'
                })
                console.log("got sign")
                if (this.abort.signal.aborted) {
                    console.log("aborted")
                    return null
                }


                // token is not the socket challenge, it can be shared across tabs.
                // we need to get back the site store here, does it also keep a token?
                // we will eventually write the store into opfs
                // rejected if the key is not registered. loop back then to get another?
                return await ws.rpcj<LoginInfo>("login2", o.toJSON())
            } catch (e: any) {
                // don't show error here, we probably just aborted the signal
                console.log("error", e)
            }
        }
        // instead of navigate we need get the site first
        // then we can navigate in it. the site might tell us the first url
        return null
    }

}