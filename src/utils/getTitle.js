import chalk from 'chalk'
import { execSync } from 'child_process'
import sanitizeName from './sanitizeName.js'

const getTitle = (url, isPlaylist) => {
  try {
    const command = `yt-dlp.exe --print "${
      isPlaylist ? 'playlist_title' : 'title'
    }" "${url}"`

    const rawTitle = execSync(command, { encoding: 'utf-8' }).trim()

    return sanitizeName(rawTitle)
  } catch (error) {
    console.error(chalk.red('Error fetching title!'), error.message)
    return sanitizeName(isPlaylist ? 'Unknown Playlist ' : 'Unknown Video')
  }
}

export default getTitle
