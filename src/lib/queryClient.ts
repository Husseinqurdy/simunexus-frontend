import { QueryClient } from '@tanstack/react-query'

// A single shared QueryClient instance, exported so non-component code
// (like authStore's logout()) can call queryClient.clear() directly —
// this is what actually wipes cached data like ['my-application'],
// ['wallet'], ['client-projects'] etc. so the next user who logs in on
// the same tab never briefly sees the previous user's cached data.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
