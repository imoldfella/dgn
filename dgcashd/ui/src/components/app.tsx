import { component$ } from "@builder.io/qwik"
import { Counter } from "./counter"
import DarkButton from "./dark"
import { usePage, SimplePage, PageProvider } from "./page"



export const QwikApp = component$<{ url: URL }>((props) => {
    return <PageProvider url={props.url} avail='es en' default='en'><SimplePage><h1>Datagrove</h1>
        <Look/>
        <p> The home page is a social media style story aggregation </p>
        <p> If the user doesn't have an account one is created automatically. </p>

        <DarkButton />
        <p>
            Login, buy credits, save credit card.
            Api to provide blind cash bank.

        </p>

        <p>
            How is login different? Does it allow third party login?

        </p>
        <div>

            <a href="/login">Login</a>
        </div>


        <Counter />
    </SimplePage></PageProvider>
})

export const Look = component$(() => {
    const loc = usePage()
    return <div >
        <div>loc: {loc.url.pathname},{loc.ln}</div>
    </div>
})