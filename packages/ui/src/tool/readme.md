
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