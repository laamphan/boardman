import { extractOwnerAndRepo } from "../utils/utils"

export const getRepoInfo = async (req: any, res: any, next: any) => {
  const { repoUrl } = req.body
  const userId = req.user.id
  const ghToken = req.user.ghToken

  if (!repoUrl) {
    return res.status(400).json({ message: "Repository URL is required" })
  }
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { owner, repo } = extractOwnerAndRepo(repoUrl as string)

    const fetchWithAuth = async (url: string) => {
      const options = ghToken
        ? {
            headers: {
              Authorization: `token ${ghToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        : {}
      const response = await fetch(url, options)
      return response.json()
    }

    const fetchRepoInfo = async () => {
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}`
      const endpoints = ["", "/branches", "/pulls", "/issues", "/commits"]
      const [
        repoData,
        branchesData,
        pullsData,
        issuesData,
        commitsData,
      ]: Array<any> = await Promise.all(
        endpoints.map((endpoint) => fetchWithAuth(`${baseUrl}${endpoint}`))
      )

      if (
        repoData.message ||
        branchesData.message ||
        pullsData.message ||
        issuesData.message ||
        commitsData.message
      ) {
        return res.status(400).json({
          message: "Error fetching repository information",
        })
      }

      const repoId = repoData.id
      const branches = branchesData.map((branch: any) => ({
        name: branch.name,
        lastCommitSha: branch.commit.sha,
      }))
      const pulls = pullsData.map((pull: any) => ({
        number: pull.number,
        title: pull.title,
      }))
      const issues = issuesData.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
      }))
      const commits = commitsData.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
      }))

      return {
        repoId,
        branches,
        pulls,
        issues,
        commits,
      }
    }

    const { repoId, branches, pulls, issues, commits } = await fetchRepoInfo()

    return res.status(200).json({
      repoUrl: `https://github.com/${owner}/${repo}`,
      repoId,
      branches,
      pulls,
      issues,
      commits,
    })
  } catch (error) {
    next(error)
  }
}
