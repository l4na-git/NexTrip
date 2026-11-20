import { useMemo, useReducer } from 'react'
import {
  initialTripSession,
  keywordPercents,
  reduceTripSession,
  type Catalog,
  type TripSessionEvent,
  type TripSessionState,
} from '../../application/tripSession'
import type { Repositories } from '../../domain/ports'
import { rankSpots } from '../../domain/recommendation/spotRanking'

// セッションの状態を React につなぐ。データは Repository から読み込み、遷移は reducer に任せる
export function useTripSession(repositories: Repositories) {
  const catalog = useMemo<Catalog>(
    () => ({
      images: repositories.images.list(),
      keywords: repositories.keywords.list(),
      spots: repositories.spots.list(),
    }),
    [repositories],
  )
  const [state, dispatch] = useReducer(
    (current: TripSessionState, event: TripSessionEvent) => reduceTripSession(current, event, catalog),
    initialTripSession,
  )

  const percents = useMemo(() => keywordPercents(state.reactions, catalog), [state.reactions, catalog])
  const ranked = useMemo(() => rankSpots(catalog.spots, percents), [catalog, percents])
  const selectedSpot = catalog.spots.find((spot) => spot.id === state.selectedSpotId) ?? null

  return { state, catalog, percents, ranked, selectedSpot, dispatch }
}
