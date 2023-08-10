
# the main trick here is to run a chron, but then build and run a replacement when the source file changes.
# we can have a guard program that stops the service, we should be more clever about waiting for it to stop though.

1. run the menu app (compile if necessary), it returns json list of commands. it returns a list of time based tasks.
2. display the menu. wait on the time based tasks.
3. before running a task, check if the source file has changed. if it has, recompile and run the new version.