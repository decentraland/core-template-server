import { createFetchComponent } from '@well-known-components/fetch-component'
import type { IFetchComponent, ITracerComponent } from '@well-known-components/interfaces'

export async function createTracedFetcherComponent(components: { tracer: ITracerComponent }): Promise<IFetchComponent> {
  const { tracer } = components

  const fetchComponent = createFetchComponent()

  const fetch: IFetchComponent = {
    async fetch(
      url: Parameters<typeof fetchComponent.fetch>[0],
      init?: Parameters<typeof fetchComponent.fetch>[1]
    ): ReturnType<typeof fetchComponent.fetch> {
      const headers: HeadersInit = { ...init?.headers } as {
        [key: string]: string
      }
      const traceParent = tracer.isInsideOfTraceSpan() ? tracer.getTraceChildString() : null
      if (traceParent) {
        headers.traceparent = traceParent
        const traceState = tracer.getTraceStateString()
        if (traceState) {
          headers.tracestate = traceState
        }
      }
      return fetchComponent.fetch(url, { ...init, headers })
    }
  }

  return fetch
}
