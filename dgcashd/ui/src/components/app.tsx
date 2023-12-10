import { component$ } from "@builder.io/qwik"
import { Counter } from "./counter"
import DarkButton from "./dark"
import { LocationProvider } from "./location"
import { SimplePage2 } from "./simple_page"
import { LanguageSelect } from "./language_select"

export const QwikApp = component$<{url: URL}>((props) => {
return <LocationProvider avail="en es" default="en" url={props.url}>
			
<SimplePage2><h1>Datagrove</h1>

<p> The home page is a social media style story aggregation </p>
<p> If the user doesn't have an account one is created automatically. </p>
    
<DarkButton/>
<p>
    Login, buy credits, save credit card.
    Api to provide blind cash bank.
    
</p>

<p>
    How is login different? Does it allow third party login?

</p>
<div>
    <LanguageSelect/>
    <a href="/login">Login</a>
</div>


<Counter /></SimplePage2>
</LocationProvider>
})