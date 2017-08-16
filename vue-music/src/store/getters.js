export const state = state => state

export const singer = state => state.state.singer

export const playing = state => state.state.playing

export const fullScreen = state => state.state.fullScreen

export const playlist = state => state.state.playlist

export const sequencelist = state => state.state.sequencelist

export const mode = state => state.state.mode

export const currentIndex = state => state.state.currentIndex

export const currentSong = (state) => {
  return state.state.playlist[state.state.currentIndex] || {}
}

