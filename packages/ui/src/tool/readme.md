
What I want to build is a Qwik site editor; a playground with many pages.
When I invoke the editor, it must then pull pages from the content app, first as html, then with a button, as source (maybe json source primarily).

The useTask for the editor needs to request a page from the content app. To run offline, this means that the content server must run in a worker.

What about versioning?




The server will render each page and wrap it with lazy loaded code. Once the client loads the service worker, it should no longer refresh the page, but instead should fetch html and json from the database. HTML for viewing, json for editing.



A page is a tuple in the database.
We can register tables as page tables if they have a path attribute. They also generally have mime_type field, 

A tool is a tuple in the tool table.

The most common type of page is a query page that produces html; queries can produce lens's so that the query also allows updating.

Another type of query is the SQL query.

Another type of query is the 




        // should I use render here? I need to work like a playground
        // as a start we could load the lexical json here and render it.
        // then each <link> page sould fetch only the lexical json and client side render it. this is smaller than even the editor, and maybe equivalent to html. It can be loaded from a btree. loading assets from a btree involves tradeoffs; we'd like them to be local, but then they can't be shared. how should we divide these cases? Seems like the bigger it is, the less likely it is to be reused?

        // we should fetch the precompiled html here? it might not be precompiled. SSR support suggests we might have to execute it to get the state. we can allow that to edit, we have the entire program offline. but we get here even if we are not editing. so in that case we want to use a cache and quickly get back to the user. if we inject the content from the top down does it give us faster access to rust?

        // can I use renderToStream here, together with innerHtml?
        // const s = await renderToString(<Hello/>, {

        // })
        //content.value = s.html
        //console.log("rendered", s)

        // first fetch as viewable? but can it embed qrls? maybe it can only embed routes? why not embed components though? maybe this needs to be a container. A container with available source.
        //content.value = await (await fetch("/assets/content.html")).text()
        // build every page as its own qwik app? that sounds inefficient.
        // do we need to compile the content page jit? I guess when we save it we can compile it, incrementally so that we don't have to compile the whole thing. potentially one page independently, then after a few pages recompile to get sharing? in any event what we get here is html. we might have to execute it on a "server" to get it though. It could be a fetch, or it could be a 
