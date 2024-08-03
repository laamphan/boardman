export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const extractOwnerAndRepo = (url: string) => {
  const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/i
  if (!regex.test(url)) {
    throw new Error("Invalid GitHub repository URL")
  }

  const urlParts = url.split("/").filter(Boolean)
  const owner = urlParts[2]
  const repo = urlParts[3]

  return { owner, repo }
}
