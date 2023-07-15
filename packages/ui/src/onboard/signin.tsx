/* eslint-disable @typescript-eslint/no-unused-vars */

// this needs to provide a way to connect to the go server with the login api

import { component$, useVisibleTask$,  noSerialize} from "@builder.io/qwik"
import { useLogin } from "../provider"
import { LoginApi, ChallengeNotify, LoginInfo, SimplePage, SimpleLogin } from "../login"
import { H2 } from "../theme"
import { $localize, useLocale, L } from "../i18n"
// import { Peer, WsChannel, apiCall } from "../abc"



// export function loginApi(ch: Peer): LoginApi {
//     return apiCall(ch,"loginpassword", "loginpassword2", "register", "registerb", "addpasskey", "addpasskey2", "login2", "login", "recover", "recover2")
// }
// implement the login api for datagrove.
export const Signin = component$(()=>{
    const ch = useLogin()
    useVisibleTask$(({track, cleanup}) => {
        const api : LoginApi = {
            loginpassword: function (user: string, password: string): Promise<[ChallengeNotify, string]> {
                throw new Error("Function not implemented.")
            },
            loginpassword2: function (secret: string): Promise<[LoginInfo, string]> {
                throw new Error("Function not implemented.")
            },
            register: function (name: string): Promise<any> {
                throw new Error("Function not implemented.")
            },
            registerb: function (cred: any): Promise<[string, string]> {
                throw new Error("Function not implemented.")
            },
            addpasskey: function (): Promise<any> {
                throw new Error("Function not implemented.")
            },
            addpasskey2: function (cred: any): Promise<[string, string]> {
                throw new Error("Function not implemented.")
            },
            login2: function (cred: any): Promise<LoginInfo> {
                throw new Error("Function not implemented.")
            },
            login: function (deviceId: string): Promise<any> {
                throw new Error("Function not implemented.")
            },
            recover: function (email: string, phone: string): Promise<void> {
                throw new Error("Function not implemented.")
            },
            recover2: function (otp: string): Promise<void> {
                throw new Error("Function not implemented.")
            }
        }
        ch.api = noSerialize(api)
        //const wss = new Peer(new WsChannel("/ws"))
        //ch.api = loginApi(wss)
    })

    return <SimplePage>
        <H2>{$localize`Sign in`}</H2>
        <SimpleLogin/>
        </SimplePage>
})