
# offline-first tribulations

There can only be one dedicated worker for opfs shared among all tabs
Background tabs can be closed at any moment.
We probably need to transfer the database to the foreground tab and close the others?
Possibly we can keep them all open, but transfer writer authority to the foreground tab.

