
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

I see the appeal of sequentially numbering the translations from a locality and bytes on the wire standpoint, but most projects have moved away from numbers (windows resource, protobuf) to fingerprints (angular, fuschia). Are sequential numbers going to be a problem for source control and rolling versions on clusters? I can't offer a specific failure point mind you but it feels like this might become an issue.

A strawman alternate would be to encourage developers to assign a specific locality id, and then use that in a sorted array. Then its very explicit. Compression fixes some of wire costs. so if we have 
<div>{_`login:Sign in`}</div>

translations becomes 

{
  "login:Sign in": "Iniciar sesión"
}

Obvious downside is now you are sending two translations when you might prefer one. I personally don't have an issue with this, but it can be eliminated if anyone thinks its a show stopper. To get back the indices I would just sort them and block them up as a static btree (hash the entire tree, which then is tied to the git commit). If people objected to the duplication between versions a "prolly tree" is a way to avoid the duplication.