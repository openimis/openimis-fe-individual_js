import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { graphqlMutation } from '@openimis/fe-core';

const MUTATION_SUCCEEDED = 2;

// A failed mutation logs either a list of errors or, from this module's services, one result object;
// fe-core's `useGraphqlMutation` reads only the list, and fails on the object with a TypeError.
export function mutationErrorMessage(error) {
  return (Array.isArray(error) ? error : [error])
    .map((entry) => entry?.detail || entry?.message || String(entry))
    .join('; ');
}

// Resolves once the mutation log reports success; rejects with the logged error, or with
// `unconfirmedMessage` when the log never reached success.
export function useMutation(operation, unconfirmedMessage) {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const mutate = async (input) => {
    setLoading(true);
    try {
      const result = await dispatch(graphqlMutation(operation, { input }, undefined, {}, true));
      if (result?.error) throw new Error(mutationErrorMessage(result.error));
      if (result?.status !== MUTATION_SUCCEEDED) throw new Error(unconfirmedMessage);
      return result;
    } finally {
      setLoading(false);
    }
  };
  return { isLoading, mutate };
}
