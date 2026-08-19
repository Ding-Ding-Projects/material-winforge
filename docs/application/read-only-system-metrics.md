# Read-only system metrics

## Behaviour

The desktop dashboard reads a narrow system-metrics snapshot from the Electron main process every four seconds. The renderer sends no input and receives bounded JSON only.

- CPU usage is calculated from the change in aggregate `os.cpus()` time counters between samples. The first sample is explicitly unavailable because no prior interval exists.
- Memory usage is the used percentage calculated from `os.totalmem()` and `os.freemem()`.
- Disk usage is the used percentage returned by `fs.statfsSync()` for the application data location. If the platform cannot provide it, the dashboard says **Unavailable**.
- Network state reports whether any non-internal interface is present and how many interfaces qualify. It does not invent throughput or Mbps values.
- Uptime comes from `os.uptime()` and is bounded before it crosses IPC.

## Failure modes

Each metric is collected independently. A failed CPU, memory, disk, network, or uptime read produces an explicit unavailable state for that value without crashing the main process or renderer. The renderer validates percentages, booleans, interface counts, and uptime again before display.

## Security and privacy

The bridge accepts no renderer arguments. It returns no paths, interface names, addresses, host names, process lists, credentials, or device identifiers. Disk access is read-only and scoped to filesystem statistics for the stable application data location.

## Verification

The accelerated pass built and packaged the Electron application. Tests, runtime interaction, UI inspection, and screenshots were not run, so live metric values and visual presentation remain unverified.

## Suggested articles

- [Preview boundary](preview-boundary.md)
- [Unsigned automatic updates](unsigned-automatic-updates.md)
