import { context } from '@actions/github'
import { run } from '../src/main'
import { setupClaCheck } from '../src/setupClaCheck'
import { lockPullRequest } from '../src/pullrequest/pullRequestLock'
import { lockPullRequestAfterMerge } from '../src/shared/getInputs'

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  setFailed: jest.fn()
}))

jest.mock('@actions/github', () => ({
  context: {
    payload: {},
    repo: { owner: 'ibakshay', repo: 'auto-assign' },
    issue: { owner: 'ibakshay', repo: 'auto-assign', number: 1 },
    actor: 'ibakshay',
    eventName: 'pull_request',
    workflow: 'CLA Assistant'
  }
}))

jest.mock('../src/setupClaCheck', () => ({
  setupClaCheck: jest.fn()
}))

jest.mock('../src/pullrequest/pullRequestLock', () => ({
  lockPullRequest: jest.fn()
}))

jest.mock('../src/shared/getInputs', () => ({
  lockPullRequestAfterMerge: jest.fn()
}))

const mockedSetupClaCheck = jest.mocked(setupClaCheck)
const mockedLockPullRequest = jest.mocked(lockPullRequest)
const mockedLockPullRequestAfterMerge = jest.mocked(lockPullRequestAfterMerge)

describe('run', () => {
  beforeEach(() => {
    ;(context as any).payload = { action: 'closed' }
    mockedLockPullRequestAfterMerge.mockReturnValue('true')
  })

  test('calls lockPullRequest when a pull request closes and locking is enabled', async () => {
    await run()

    expect(mockedLockPullRequest).toHaveBeenCalled()
    expect(mockedSetupClaCheck).not.toHaveBeenCalled()
  })

  test('calls setupClaCheck when a pull request opens', async () => {
    ;(context as any).payload.action = 'opened'

    await run()

    expect(mockedLockPullRequest).not.toHaveBeenCalled()
    expect(mockedSetupClaCheck).toHaveBeenCalled()
  })

  test('calls setupClaCheck when a pull request synchronizes', async () => {
    ;(context as any).payload.action = 'synchronize'

    await run()

    expect(mockedLockPullRequest).not.toHaveBeenCalled()
    expect(mockedSetupClaCheck).toHaveBeenCalled()
  })

  test('calls setupClaCheck when a pull request closes and locking is disabled', async () => {
    mockedLockPullRequestAfterMerge.mockReturnValue('false')

    await run()

    expect(mockedLockPullRequest).not.toHaveBeenCalled()
    expect(mockedSetupClaCheck).toHaveBeenCalled()
  })
})
