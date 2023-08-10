

// return this from login process? anything else? a screen name

// we need a name, an email (could be apple fake), 


export interface UserBasic {
    name: string
    id: number
    avatar: string   // data url for pngs, should we use data urls for everything?
}
export interface Signin extends UserBasic {

    // list of remembered logins
    alt?: UserBasic[]
}
// this is initalized by loading the login page.
export const testUser = 1

// user descriptions are urls that are /u/id -> graphic with the name in a header? name\0type\0data
// to get a gravatar we need the hash of the email. Maybe that should be a one time lookup.

// https://codepen.io/elliz/details/ygvgay
export const svgDataUrlExample = `data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-6 h-6'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5' /%3e%3c/svg%3e`

function escapeRegExp(str: string) {
    // eslint-disable-next-line no-useless-escape
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }
  
  function replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }
  
function svgData(raw: string) {
        let encoded = raw.replace(/\s+/g, " ")
        
        // According to Taylor Hunt, lowercase gzips better ... my tiny test confirms this
        encoded = replaceAll(encoded, "%", "%25"); 
        encoded = replaceAll(encoded, "> <", "><"); // normalise spaces elements
        encoded = replaceAll(encoded, "; }", ";}"); // normalise spaces css
        encoded = replaceAll(encoded, "<", "%3c");
        encoded = replaceAll(encoded, ">", "%3e");
        encoded = replaceAll(encoded, "\"", "'");
        encoded = replaceAll(encoded, "#", "%23"); // needed for ie and firefox
        encoded = replaceAll(encoded, "{", "%7b");
        encoded = replaceAll(encoded, "}", "%7d");     
        encoded = replaceAll(encoded, "|", "%7c");
        encoded = replaceAll(encoded, "^", "%5e");
        encoded = replaceAll(encoded, "`", "%60"); 
        encoded = replaceAll(encoded, "@", "%40"); 
    
        // charset reportedly not needed ... I need to test before implementing
        return 'data:image/svg+xml;charset=UTF-8,' + encoded 
}
export interface Login {
    did: string
    until: number
  }

export interface UserExtended {
    basic: UserBasic
    description: string
    followers: number
    following: number
    youfollow: boolean
    // intersecting needs to be read from the graph computation.
    intersection: string[]
}

export interface LoginResponse {
    ex: UserExtended
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

export interface UserTimeline {

}
export interface HostApi {
    getUser(id: number[]): Promise<Record<number,UserBasic >>
    getUserExtended(id: number): Promise<UserExtended>
    getTimeline(id: number): Promise<UserTimeline>
}

export interface ChallengeNotify {
    challenge_type: number
    challenge_sent_to: string
    other_options: number
    login_info?: LoginResponse
    passkey_nag?: boolean
}

export interface LoginApi {
    loginpassword: (user: string, password: string) => Promise<[ChallengeNotify,string]>
    loginpassword2: (secret: string) => Promise<[LoginResponse,string]>
    register(name: string): Promise<any>
    registerb(cred: any): Promise<[string,string]>
    addpasskey(): Promise<any>
    addpasskey2(cred:any): Promise<[string,string]>
    login2(cred: any): Promise<LoginResponse>
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
    setLogin: (sec: LoginResponse) => void
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
