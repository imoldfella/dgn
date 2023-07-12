
Use url locale like
/en/whatever

The developer needs to resolve this at run time, for production is is compiled in.

using a string instead hash is irrelevant to production, seems easier to read though.
would need our own extract program.

developer is loading as an spa, the route changes as a signal. that means that localize must read as a signal or store? maybe this is an argument against the global function syntax i

    $localize` `  must return a string?

    


in general a string for a template is going to be multipart, so we need a separator character, which then means we need an escape code

or maybe we just force an id, which is probably best practice anyway?

localize`id:ddd`
no id:
localize`:ddd`

we could use typescript and compile it in? then production needs to compile it out, but that's probably pretty standard.


what if each dictionary was a store? that still doesn't get us functions.

