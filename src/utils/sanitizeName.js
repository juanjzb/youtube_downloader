const sanitizeName = name => {
  const nameBeforeNewline = name.split('\n')[0]
  return nameBeforeNewline.replace(/[<>:"/\\|?*\n\r]+/g, '').trim()
}

export default sanitizeName
