import inquirer from 'inquirer'
import downloadVideo from './downloadVideo.js'

const main = async () => {
  process.stdout.write('\x1b]0; 🚀 YT Video Downloader \x07')

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
