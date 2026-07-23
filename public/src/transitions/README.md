# Transition operation follow-ups

## TODO: SDK terminology alignment

Audit transition form fields, preparation contexts, formatted results, generated code, tests, and
fixtures for names that differ from the installed SDK declarations. Prefer the SDK name wherever the
value represents the same SDK concept, and document any intentional UI-only terminology.

This must be handled as an explicit compatibility change rather than as a side effect of moving an
operation into the transition registry. For each rename:

- identify form and result consumers;
- update generated examples and documentation;
- update browser fixtures and assertions; and
- retain aliases only when compatibility is intentionally required.

Known example: the contract-update result currently exposes `contractId`, while the corresponding
SDK terminology and form input use `dataContractId`.
