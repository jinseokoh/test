import {
  QueryCache,
  QueryClient,
  QueryKey,
  defaultShouldDehydrateQuery,
  isServer
} from '@tanstack/react-query'

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined) {
          console.error(error?.message ?? `문제가 발생했습니다.`)
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = createQueryClient()
    return browserQueryClient
  }
}

interface BaseQueryProps {
  queryKey: QueryKey
}

interface QueryProps<ResponseType = unknown> extends BaseQueryProps {
  type?: 'query'
  queryFn: () => Promise<ResponseType>
}

interface InfiniteQueryProps<ResponseType = unknown> extends BaseQueryProps {
  type: 'infinite'
  queryFn: (context: { pageParam: number }) => Promise<ResponseType>
}
type CombinedQueryProps = QueryProps | InfiniteQueryProps

// export const prefetchAll = async <Q extends CombinedQueryProps[]>(queries: Q) => {
//   const queryClient = getQueryClient();
//   await Promise.all(
//     queries.map(({ queryKey, queryFn, type }) => {
//       if (!type || type === "query") {
//         return queryClient.prefetchQuery({ queryKey, queryFn });
//       } else {
//         return queryClient.prefetchInfiniteQuery({
//           queryKey,
//           queryFn: ({ pageParam }) => queryFn({ pageParam }),
//           initialPageParam: 1,
//         });
//       }
//     }),
//   );

//   return dehydrate(queryClient);
// };
