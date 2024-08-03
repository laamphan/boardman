import { extractOwnerAndRepo } from "../utils/utils"

export const getRepoInfo = async (req: any, res: any, next: any) => {
  const { repoUrl } = req.body
  const userId = req.user.id
  const ghToken = req.user.ghToken

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized request" })
  }
  if (!repoUrl) {
    return res.status(400).json({ message: "Repository URL is required" })
  }

  try {
    const { owner, repo } = extractOwnerAndRepo(repoUrl as string)

    const fetchAllInfo = async () => {
      const repoRes = !ghToken
        ? await fetch(`https://api.github.com/repos/${owner}/${repo}`)
        : await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              Authorization: `token ${ghToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })
      const branchesRes = !ghToken
        ? await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`)
        : await fetch(
            `https://api.github.com/repos/${owner}/${repo}/branches`,
            {
              headers: {
                Authorization: `token ${ghToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          )
      const pullsRes = !ghToken
        ? await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`)
        : await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
            headers: {
              Authorization: `token ${ghToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })
      const issuesRes = !ghToken
        ? await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`)
        : await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            headers: {
              Authorization: `token ${ghToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })
      const commitsRes = !ghToken
        ? await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`)
        : await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            headers: {
              Authorization: `token ${ghToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

      const repoData: any = await repoRes.json()
      const branchesData: any = await branchesRes.json()
      const pullsData: any = await pullsRes.json()
      const issuesData: any = await issuesRes.json()
      const commitsData: any = await commitsRes.json()

      if (
        repoData.message ||
        branchesData.message ||
        pullsData.message ||
        issuesData.message ||
        commitsData.message
      ) {
        throw new Error("Failed to fetch repository information")
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

    const { repoId, branches, pulls, issues, commits } = await fetchAllInfo()

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
