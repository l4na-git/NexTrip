import type { AtmosphereImage, Keyword, Spot } from './model'

export interface KeywordRepository {
  list(): Keyword[]
}

export interface ImageRepository {
  list(): AtmosphereImage[]
}

export interface SpotRepository {
  list(): Spot[]
}

export type Repositories = {
  keywords: KeywordRepository
  images: ImageRepository
  spots: SpotRepository
}
