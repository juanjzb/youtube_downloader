import chalk from 'chalk'
import { exec, execSync } from 'child_process'
import cliProgress from 'cli-progress'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'

const createFolders = (baseFolder, subFolder) => {
  const fullPath = path.join(baseFolder, subFolder)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
  return fullPath
}

const getTitle = (url, isPlaylist) => {
  try {
    const command = `yt-dlp.exe --print "${
      isPlaylist ? 'playlist_title' : 'title'
    }" "${url}"`
    return execSync(command, { encoding: 'utf-8' }).trim()
  } catch (error) {
    console.error(chalk.red('Error fetching title!'), error.message)
    return isPlaylist ? 'Unknown Playlist' : 'Unknown Video'
  }
}

const downloadVideo = (url, isPlaylist) => {
  if (!url) {
    console.error(chalk.red('Error: No URL provided!'))
    return
  }

  const title = getTitle(url, isPlaylist)

  // Create download folders
  const baseFolder = 'downloads'
  const targetFolder = createFolders(
    baseFolder,
    isPlaylist ? 'playlists' : 'videos'
  )

  const outputFormat = isPlaylist
    ? path.join(
        targetFolder,
        '%(playlist)s/%(playlist_index)s - %(title)s.%(ext)s'
      ) // Playlist folder + indexed files
    : path.join(targetFolder, '%(title)s.%(ext)s') // Single video

  console.log(
    chalk.blue(
      `Starting ${isPlaylist ? 'playlist' : 'video'} download: ${title}...`
    )
  )

  const command = `yt-dlp.exe -f "bestvideo+bestaudio/best" -o "${outputFormat}" "${url}"`

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
      console.log(chalk.green('Download completed successfully!'))
    } else {
      console.error(chalk.red(`Download failed with code ${code}`))
    }
  })
}

const main = async () => {
  const { url } = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter the YouTube URL:',
      validate: input => (input ? true : 'URL cannot be empty!')
    }
  ])

  const { isPlaylist } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isPlaylist',
      message: 'Is this a playlist URL? (If unsure, choose "Yes" for safety)',
      default: true
    }
  ])

  downloadVideo(url, isPlaylist)
}

main()
