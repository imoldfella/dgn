
1. Several executables, each with its own configurable "file" (could be a partition)
2. Server then manages the schedule which is a time, an executable, and a configuation.
3. When the schedule changes, we want to transition from the old schedule (e.g. the old schedule will not start any more executables, and will die as soon as all tasks are completed).
4. Eventually when executables change (e.g. watch git) we want to pull them, compile them, and run them for future executio9ns.

