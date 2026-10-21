import {
  describe, it, expect, vi,
} from 'vitest';

vi.mock('@openimis/fe-core', () => {
  let next = 0;
  const uuid = () => `generated-${(next += 1)}`;
  return {
    baseApiUrl: '/api',
    decodeId: (id) => id,
    dispatchMutationDefault: vi.fn(),
    dispatchMutationErr: vi.fn(),
    dispatchMutationReq: vi.fn(),
    dispatchMutationResp: vi.fn(),
    formatGQLString: (s) => s,
    formatGraphQLError: vi.fn(),
    formatMutation: vi.fn((type, input, label) => ({ clientMutationId: uuid(), payload: `${type}(${input}) ${label}` })),
    formatPageQuery: vi.fn(),
    formatPageQueryWithCount: vi.fn(),
    formatQuery: vi.fn(),
    formatServerError: vi.fn(),
    graphql: vi.fn(() => ({ type: 'GRAPHQL' })),
    graphqlWithVariables: vi.fn(() => ({ type: 'GRAPHQL_WITH_VARIABLES' })),
    pageInfo: vi.fn(),
    parseData: vi.fn(),
    // Same contract as fe-core: an id is generated only when params carries none.
    prepareMutation: (operation, input, params = {}) => {
      const clientMutationId = params.clientMutationId ?? uuid();
      return {
        operation,
        variables: { input: { ...input, ...params, clientMutationId } },
        clientMutationId,
      };
    },
  };
});

const { graphqlWithVariables } = await import('@openimis/fe-core');
const { resolveTask } = await import('./actions');

const TASK = { id: 'task-1' };
const USER = { id: 'user-1' };

const lastCall = () => {
  const [, variables, , meta] = graphqlWithVariables.mock.calls.at(-1);
  return { variables, meta };
};

describe('resolveTask', () => {
  it.each([
    ['APPROVED', null],
    ['FAILED', null],
    ['ACCEPT', ['record-1']],
    ['REJECT', ['record-1', 'record-2']],
  ])('journals the clientMutationId it sends (%s)', (outcome, records) => {
    resolveTask(TASK, 'Resolving task', USER, outcome, records);

    const { variables, meta } = lastCall();
    // The journal polls the backend by meta.clientMutationId; any other id
    // than the one sent leaves the entry pending forever.
    expect(variables.clientMutationId).toBeTruthy();
    expect(meta.clientMutationId).toBe(variables.clientMutationId);
  });

  it('sends the mutation label', () => {
    resolveTask(TASK, 'Resolving task', USER, 'APPROVED');

    expect(lastCall().variables.clientMutationLabel).toBe('Resolving task');
  });
});
