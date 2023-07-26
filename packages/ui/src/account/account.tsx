import { component$ } from "@builder.io/qwik"
import { Link } from "../provider"


// the account page can double as a welcome/welcome back page.
// we should move the language and theme selection here.
// we need a way to change blocks of text here?
export const Account = component$(() => {
    return <>
        <div>Welcome!</div>
        <p> You can build your web site locally without signing up.</p>
        <p> When you are ready to make it public you can sign up with Datagrove or publish it to any other hosting provider or host it yourself as an onion service on Tor. </p>

        <p>
            <Link href='/na'>Get Started</Link>
            </p>
        </>
})

