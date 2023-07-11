
//import { EdKeypair } from "@ucans/ucans"
//import * as ucans from "@ucans/ucans"



// loaded from the user's home database.
export interface Profile {
  user: {
    [key: string]: User
  },
  device: {
    [key: string]: Device
  },
  site: Site[]
  server: {
    [key: string]: Server
  }
}
export const [profile, setProfile] = createSignal<Profile>({
  user: {},
  device: {},
  site: [],
  server: {},
})
interface Server {
  url: string

}
interface Device {
  username: string
  deviceName: string
  publicKey: JsonWebKey
  expires: number
  usefor: string[]
}

// when we logout, should we remove the device key? that would require storing it on the server, a tradeoff.


function init(): Security {
  const a = localStorage.getItem('security')
  if (a) {
    return JSON.parse(a) as Security
  } else {
    return {
      deviceName: "",
      deviceDid: "",
      devicePrivate: "",
      autoconnectUntil: 0,
      registered: false,
    }
  }
}

// true directly after registration
export const [welcome, setWelcome] = createSignal(true)

// set undefined to false to test without webauthn
export const [hasWebAuthn, setHasWebAuthn] = createSignal(undefined as boolean | undefined)
// if login is true we can go to any page.
// export const [login, setLogin] = createSignal(false)
// export const [user, setUser] = createSignal<string>('')
export const [security, setSecurity_] = createSignal<Security>(init())
export const setSecurity = (s: Security) => {
  localStorage.setItem('security', JSON.stringify(s));
  setSecurity_(s)
}
export const login = () =>   !!security().token
export const setLogin = (s: string) => { 
  setSecurity({
    ...security(),
    token: s
  })
}
export const [error, setError] = createSignal("")
export const isMobile: boolean = (navigator as any)?.userAgentData?.mobile ?? false;

(async () => {
  if (hasWebAuthn() == undefined) {
    if (typeof (PublicKeyCredential) != "undefined" && typeof (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) != "undefined") {
      const b = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      setHasWebAuthn(b)
    } else {
      setHasWebAuthn(false)
    }
  }
})()


// export enum StartState {
//   starting = 0,
//   loginNeeded = 2,
//   active = 3
// }
// export const [startState, setStartState] = createSignal<number>(0)



// user name here needs to identify the domain that's tracking it?
// otherwise it won't be unique.
// we could simply use the hash of the private key, but then it could never be changed or revoked. certificate transparency offers solutions here? can datagrove sign the domain?
// 







//         // we have our passphrase now, we can create a certificate and register it
// then we could finish the setup with webauthn. we could even skip it
//        const cert = ucanFromBip39(mn, sec!.did, await ws.did())

// call createUser when we initialize a new device





