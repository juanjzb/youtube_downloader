import chalk from 'chalk'
import { exec } from 'child_process'
import cliProgress from 'cli-progress'
import fs from 'fs'
import path from 'path'
import createFolders from './utils/createFolders.js'
import getTitle from './utils/getTitle.js'

const downloadVideo = (url, isPlaylist) => {
  if (!url) {
    console.error(chalk.red('Error: No URL provided!'))
    return
  }

  const playlistOrVideoTitle = getTitle(url, isPlaylist)

  const baseFolder = isPlaylist
    ? path.join('downloads', 'playlists', playlistOrVideoTitle)
    : path.join('downloads', 'videos')

  createFolders(baseFolder)

  if (isPlaylist) {
    const playlistUrlFile = path.join(baseFolder, 'playlistUrl.txt')
    fs.writeFileSync(playlistUrlFile, url, 'utf-8')
  }

  const outputFormat = isPlaylist
    ? path.join(baseFolder, '%(playlist_index)s - %(title)s.%(ext)s')
    : path.join(baseFolder, '%(title)s.%(ext)s')

  console.log(
    chalk.blue(
      `Starting ${
        isPlaylist ? 'playlist' : 'video'
      } download: ${playlistOrVideoTitle}...`
    )
  )

  const command = `yt-dlp.exe -N 6 -f "bestvideo+bestaudio/best" -o "${outputFormat}"  "${url}"`

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  )
  progressBar.start(100, 0)

  const process = exec(command)

  process.stdout.on('data', data => {
    const progressMatch = data.match(/\[download\]\s+(\d+\.\d+)%/)

    if (progressMatch) {
      const progress = parseFloat(progressMatch[1])
      progressBar.update(progress)
    }
  })

  process.on('close', code => {
    progressBar.stop()

    if (code === 0) {
      console.log(chalk.green('Download completed successfully! 🎉'))
    } else {
      console.error(chalk.red('Download failed 🥺'))
    }
  })
}

export default downloadVideo
