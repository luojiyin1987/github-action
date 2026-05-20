import * as core from '@actions/core'
import { context } from '@actions/github'
import { octokit } from '../src/octokit'
import { lockPullRequest } from '../src/pullrequest/pullRequestLock'

jest.mock('@actions/core', () => ({
  error: jest.fn(),
  info: jest.fn()
}))

jest.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'ibakshay', repo: 'auto-assign' },
    issue: { number: 1 }
  }
}))

jest.mock('../src/octokit', () => ({
  octokit: {
    rest: {
      issues: {
        lock: jest.fn()
      }
    }
  }
}))

describe('lockPullRequest', () => {
  beforeEach(() => {
    ;(context as any).repo = { owner: 'ibakshay', repo: 'auto-assign' }
    ;(context as any).issue = { number: 1 }
  })

  test('locks the pull request conversation', async () => {
    await lockPullRequest()

    expect(octokit.rest.issues.lock).toHaveBeenCalledWith({
      owner: 'ibakshay',
      repo: 'auto-assign',
      issue_number: 1
    })
    expect(core.info).toHaveBeenCalledWith(
      'successfully locked the pull request 1'
    )
  })

  test('logs an error when locking fails', async () => {
    jest.mocked(octokit.rest.issues.lock).mockRejectedValueOnce(new Error('boom'))

    await lockPullRequest()

    expect(core.error).toHaveBeenCalledWith(
      'failed when locking the pull request '
    )
  })
})
