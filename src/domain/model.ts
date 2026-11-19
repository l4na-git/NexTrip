export type PlaceType = 'sea' | 'cafe' | 'nature' | 'nightview' | 'themepark' | 'onsen'

export type Keyword = {
  id: string
  label: string
}

export type AtmosphereImage = {
  id: PlaceType
  placeType: string
  // 画像の入る場所。null の間はプレースホルダーを表示する
  image: { src: string | null }
  // 雰囲気キーワードの入る場所。keywords の id を指定する
  keywordIds: string[]
}

export type Spot = {
  id: string
  name: string
  placeType: PlaceType
  keywordIds: string[]
  lat: number
  lng: number
}
