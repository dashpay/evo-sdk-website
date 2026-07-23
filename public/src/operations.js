import { namedArgs } from './form/collect.js';
import { executeTransitionOperation } from './transitions/registry.js';

export async function callEvo(client, groupKey, itemKey, defs, args, useProof, extraArgs = {}) {
  const n = { ...namedArgs(defs, args), ...(extraArgs || {}) };
  const c = client;

  const registered = await executeTransitionOperation(itemKey, defs, args, extraArgs, c);
  if (registered.handled) return registered.result;

  const toStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value.filter(item => item !== undefined && item !== null && item !== '');
  };

  const toNumberArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
      .map(item => {
        const num = Number(item);
        return Number.isFinite(num) ? num : null;
      })
      .filter(item => item !== null);
  };

  const toNumber = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  };

  const parseJson = (value, label = 'field') => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      throw new Error(`Invalid JSON in ${label}: ${e.message}`);
    }
  };

  switch (itemKey) {
    // Identity queries
    case 'getIdentity':
      return useProof ? c.identities.fetchWithProof(n.id) : c.identities.fetch(n.id);
    case 'getIdentityUnproved':
      return c.identities.fetchUnproved(n.id);
    case 'getIdentityKeys': {
      const requestType = n.requestType || n.keyRequestType || 'all';
      const specificKeyIds = toNumberArray(n.specificKeyIds);
      let purposeMap = n.purposeMap ?? n.searchPurposeMap;
      if (purposeMap !== undefined) {
        purposeMap = parseJson(purposeMap, 'Purpose Map');
      }

      let request;
      if (requestType === 'specific') {
        request = { type: 'specific', specificKeyIds };
      } else if (requestType === 'search') {
        request = { type: 'search', purposeMap: purposeMap || {} };
      } else {
        request = { type: 'all' };
      }

      const query = {
        identityId: n.identityId,
        request,
        limit: n.limit ?? undefined,
        offset: n.offset ?? undefined,
      };

      return useProof ? c.identities.getKeysWithProof(query) : c.identities.getKeys(query);
    }
    case 'getIdentitiesContractKeys': {
      const identityIds = toStringArray(n.identityIds);
      const purposes = toNumberArray(n.purposes);
      const payload = {
        identityIds,
        contractId: n.contractId,
        purposes,
      };
      return useProof ? c.identities.contractKeysWithProof(payload) : c.identities.contractKeys(payload);
    }
    case 'getIdentityNonce':
      return useProof ? c.identities.nonceWithProof(n.identityId) : c.identities.nonce(n.identityId);
    case 'getIdentityContractNonce':
      return useProof ? c.identities.contractNonceWithProof(n.identityId, n.contractId) : c.identities.contractNonce(n.identityId, n.contractId);
    case 'getIdentityBalance':
      return useProof ? c.identities.balanceWithProof(n.identityId) : c.identities.balance(n.identityId);
    case 'getIdentitiesBalances': {
      const identityIds = toStringArray(n.identityIds);
      return useProof ? c.identities.balancesWithProof(identityIds) : c.identities.balances(identityIds);
    }
    case 'getIdentityBalanceAndRevision':
      return useProof ? c.identities.balanceAndRevisionWithProof(n.identityId) : c.identities.balanceAndRevision(n.identityId);
    case 'getIdentityByPublicKeyHash':
      return useProof ? c.identities.byPublicKeyHashWithProof(n.publicKeyHash) : c.identities.byPublicKeyHash(n.publicKeyHash);
    case 'getIdentityByNonUniquePublicKeyHash': {
      const startAfter = n.startAfter || undefined;
      return useProof ? c.identities.byNonUniquePublicKeyHashWithProof(n.publicKeyHash, startAfter) : c.identities.byNonUniquePublicKeyHash(n.publicKeyHash, startAfter);
    }
    case 'getIdentityTokenBalances': {
      const tokenIds = toStringArray(n.tokenIds);
      return useProof ? c.identities.tokenBalancesWithProof(n.identityId, tokenIds) : c.identities.tokenBalances(n.identityId, tokenIds);
    }
    case 'getIdentitiesTokenBalances': {
      const identityIds = toStringArray(n.identityIds);
      return useProof ? c.tokens.balancesWithProof(identityIds, n.tokenId) : c.tokens.balances(identityIds, n.tokenId);
    }
    case 'getIdentityTokenInfos': {
      const tokenIds = toStringArray(n.tokenIds);
      return useProof
        ? c.tokens.identityTokenInfosWithProof(n.identityId, tokenIds)
        : c.tokens.identityTokenInfos(n.identityId, tokenIds);
    }
    case 'getIdentitiesTokenInfos': {
      const identityIds = toStringArray(n.identityIds);
      return useProof ? c.tokens.identitiesTokenInfosWithProof(identityIds, n.tokenId) : c.tokens.identitiesTokenInfos(identityIds, n.tokenId);
    }

    // Identity transitions
    // Data contracts
    case 'getDataContract':
      return useProof ? c.contracts.fetchWithProof(n.id) : c.contracts.fetch(n.id);
    case 'getDataContractHistory':
      return useProof
        ? c.contracts.getHistoryWithProof({ dataContractId: n.dataContractId || n.id, limit: n.limit ?? undefined, startAtMs: n.startAtMs ?? undefined })
        : c.contracts.getHistory({ dataContractId: n.dataContractId || n.id, limit: n.limit ?? undefined, startAtMs: n.startAtMs ?? undefined });
    case 'getDataContracts':
      return useProof ? c.contracts.getManyWithProof(n.ids) : c.contracts.getMany(n.ids);
    // Documents
    case 'getDocuments': {
      const payload = {
        dataContractId: n.dataContractId || n.contractId,
        documentTypeName: n.documentTypeName || n.documentType,
        where: parseJson(n.where, 'Where'),
        orderBy: parseJson(n.orderBy, 'Order By'),
        limit: n.limit ?? undefined,
        startAfter: n.startAfter ?? undefined,
        startAt: n.startAt ?? undefined,
      };
      return useProof ? c.documents.queryWithProof(payload) : c.documents.query(payload);
    }
    case 'getDocument':
      return useProof
        ? c.documents.getWithProof(n.dataContractId || n.contractId, n.documentTypeName || n.documentType, n.documentId)
        : c.documents.get(n.dataContractId || n.contractId, n.documentTypeName || n.documentType, n.documentId);
    // DPNS
    case 'getDpnsUsername':
      return useProof ? c.dpns.usernameWithProof(n.identityId) : c.dpns.username(n.identityId);
    case 'getDpnsUsernames':
      return useProof
        ? c.dpns.usernamesWithProof({ identityId: n.identityId, limit: n.limit ?? undefined })
        : c.dpns.usernames({ identityId: n.identityId, limit: n.limit ?? undefined });
    case 'getDpnsUsernameByName':
      return useProof ? c.dpns.getUsernameByNameWithProof(n.username) : c.dpns.getUsernameByName(n.username);
    case 'dpnsResolve':
      return c.dpns.resolveName(n.name);
    case 'dpnsCheckAvailability':
      return c.dpns.isNameAvailable(n.label);
    case 'dpnsConvertToHomographSafe':
      return c.dpns.convertToHomographSafe(n.name);
    case 'dpnsIsValidUsername':
      return c.dpns.isValidUsername(n.label);
    case 'dpnsIsContestedUsername':
      return c.dpns.isContestedUsername(n.label);
    case 'dpnsRegisterName': {
      if (!n.label) {
        throw new Error('Label is required for DPNS registration.');
      }
      if (!n.identityId) {
        throw new Error('Identity ID is required for DPNS registration.');
      }
      if (!n.privateKeyWif) {
        throw new Error('Private key WIF is required for DPNS registration.');
      }
      const publicKeyId = toNumber(n.publicKeyId);
      if (publicKeyId === null) {
        throw new Error('Identity public key ID must be provided for DPNS registration.');
      }
      return c.dpns.registerName({
        label: n.label,
        identityId: n.identityId,
        publicKeyId,
        privateKeyWif: n.privateKeyWif,
      });
    }

    // Epoch
    case 'getEpochsInfo':
      return useProof
        ? c.epoch.epochsInfoWithProof({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null })
        : c.epoch.epochsInfo({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null });
    case 'getCurrentEpoch':
      return useProof ? c.epoch.currentWithProof() : c.epoch.current();
    case 'getFinalizedEpochInfos':
      return useProof
        ? c.epoch.finalizedInfosWithProof({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null })
        : c.epoch.finalizedInfos({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null });
    case 'getEvonodesProposedEpochBlocksByIds':
      return useProof ? c.epoch.evonodesProposedBlocksByIdsWithProof(n.epoch, toStringArray(n.ids)) : c.epoch.evonodesProposedBlocksByIds(n.epoch, toStringArray(n.ids));
    case 'getEvonodesProposedEpochBlocksByRange':
      return useProof
        ? c.epoch.evonodesProposedBlocksByRangeWithProof({
          epoch: n.epoch,
          limit: n.limit ?? undefined,
          startAfter: n.startAfter ?? undefined,
          orderAscending: n.orderAscending ?? undefined,
        })
        : c.epoch.evonodesProposedBlocksByRange({
          epoch: n.epoch,
          limit: n.limit ?? undefined,
          startAfter: n.startAfter ?? undefined,
          orderAscending: n.orderAscending ?? undefined,
        });

    // Protocol
    case 'getProtocolVersionUpgradeState':
      return useProof ? c.protocol.versionUpgradeStateWithProof() : c.protocol.versionUpgradeState();
    case 'getProtocolVersionUpgradeVoteStatus':
      return useProof
        ? c.protocol.versionUpgradeVoteStatusWithProof(n.startProTxHash, n.count ?? undefined)
        : c.protocol.versionUpgradeVoteStatus(n.startProTxHash, n.count ?? undefined);

    // Tokens
    case 'getTokenStatuses':
      return useProof ? c.tokens.statusesWithProof(toStringArray(n.tokenIds)) : c.tokens.statuses(toStringArray(n.tokenIds));
    case 'getTokenDirectPurchasePrices':
      return useProof ? c.tokens.directPurchasePricesWithProof(toStringArray(n.tokenIds)) : c.tokens.directPurchasePrices(toStringArray(n.tokenIds));
    case 'getTokenContractInfo': {
      const contractId = n.dataContractId || n.contractId;
      return useProof ? c.tokens.contractInfoWithProof(contractId) : c.tokens.contractInfo(contractId);
    }
    case 'getTokenPerpetualDistributionLastClaim':
      return useProof ? c.tokens.perpetualDistributionLastClaimWithProof(n.identityId, n.tokenId) : c.tokens.perpetualDistributionLastClaim(n.identityId, n.tokenId);
    case 'getTokenTotalSupply':
      return useProof ? c.tokens.totalSupplyWithProof(n.tokenId) : c.tokens.totalSupply(n.tokenId);
    case 'getTokenPriceByContract': {
      const contractId = n.dataContractId || n.contractId;
      const tokenPosition = toNumber(n.tokenPosition, 0);
      return c.tokens.priceByContract(contractId, tokenPosition);
    }
    // Group queries
    case 'getGroupInfo': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      return useProof ? c.group.infoWithProof(contractId, position) : c.group.info(contractId, position);
    }
    case 'getGroupInfos': {
      const contractId = n.dataContractId || n.contractId;
      return useProof
        ? c.group.infosWithProof({ dataContractId: contractId, startAt: n.startAtInfo ?? undefined, limit: n.count ?? undefined })
        : c.group.infos({ dataContractId: contractId, startAt: n.startAtInfo ?? undefined, limit: n.count ?? undefined });
    }
    case 'getGroupMembers': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      const memberIds = toStringArray(n.memberIds);
      const opts = {
        dataContractId: contractId,
        groupContractPosition: position,
        memberIds: memberIds.length ? memberIds : undefined,
        startAtMemberId: n.startAt ?? undefined,
        limit: n.limit ?? undefined,
      };
      return useProof ? c.group.membersWithProof(opts) : c.group.members(opts);
    }
    case 'getGroupActions': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      const opts = { dataContractId: contractId, groupContractPosition: position, status: n.status, startAt: n.startAtInfo ?? undefined, limit: n.count ?? undefined };
      return useProof ? c.group.actionsWithProof(opts) : c.group.actions(opts);
    }
    case 'getGroupActionSigners': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      const payload = { dataContractId: contractId, groupContractPosition: position, status: n.status, actionId: n.actionId };
      return useProof ? c.group.actionSignersWithProof(payload) : c.group.actionSigners(payload);
    }
    case 'getIdentityGroups': {
      const memberDataContracts = toStringArray(n.memberDataContracts);
      const ownerDataContracts = toStringArray(n.ownerDataContracts);
      const moderatorDataContracts = toStringArray(n.moderatorDataContracts);
      const opts = {
        identityId: n.identityId,
        memberDataContracts: memberDataContracts.length ? memberDataContracts : undefined,
        ownerDataContracts: ownerDataContracts.length ? ownerDataContracts : undefined,
        moderatorDataContracts: moderatorDataContracts.length ? moderatorDataContracts : undefined,
      };
      return useProof ? c.group.identityGroupsWithProof(opts) : c.group.identityGroups(opts);
    }
    case 'getGroupsDataContracts': {
      const contractIds = toStringArray(n.dataContractIds || n.contractIds);
      return useProof ? c.group.groupsDataContractsWithProof(contractIds) : c.group.groupsDataContracts(contractIds);
    }

    // Contested resources & voting
    case 'getContestedResources': {
      const contractId = n.dataContractId || n.contractId;
      const payload = {
        dataContractId: contractId,
        documentTypeName: n.documentTypeName,
        indexName: n.indexName,
        startAtValue: n.startAtValue ?? undefined,
        limit: n.limit ?? undefined,
        orderAscending: n.orderAscending ?? undefined,
      };
      return useProof ? c.group.contestedResourcesWithProof(payload) : c.group.contestedResources(payload);
    }
    case 'getContestedResourceVotersForIdentity': {
      const contractId = n.dataContractId || n.contractId;
      const payload = {
        dataContractId: contractId,
        documentTypeName: n.documentTypeName,
        indexName: n.indexName,
        indexValues: toStringArray(n.indexValues),
        contestantId: n.contestantId,
        orderAscending: n.orderAscending ?? undefined,
      };
      if (useProof) {
        return c.group.contestedResourceVotersForIdentityWithProof({
          ...payload,
          startAtVoterId: n.startAtVoterId ?? n.startAtIdentifierInfo ?? undefined,
          startAtIncluded: n.startAtIncluded ?? undefined,
          limit: n.limit ?? n.count ?? undefined,
        });
      }
      return c.group.contestedResourceVotersForIdentity({
        ...payload,
        startAtVoterId: n.startAtVoterId ?? n.startAtVoterInfo ?? undefined,
        startAtIncluded: n.startAtIncluded ?? undefined,
        limit: n.limit ?? undefined,
      });
    }
    case 'getContestedResourceVoteState': {
      const contractId = n.dataContractId || n.contractId;
      const payload = {
        dataContractId: contractId,
        documentTypeName: n.documentTypeName,
        indexName: n.indexName,
        indexValues: toStringArray(n.indexValues),
        resultType: n.resultType,
        includeLockedAndAbstaining: n.includeLockedAndAbstaining ?? n.allowIncludeLockedAndAbstainingVoteTally ?? undefined,
        startAtContenderId: n.startAtContenderId ?? n.startAtIdentifierInfo ?? undefined,
        startAtIncluded: n.startAtIncluded ?? undefined,
        limit: n.count ?? n.limit ?? undefined,
        orderAscending: n.orderAscending ?? undefined,
      };
      return useProof ? c.voting.contestedResourceVoteStateWithProof(payload) : c.voting.contestedResourceVoteState(payload);
    }
    case 'getContestedResourceIdentityVotes': {
      const query = {
        identityId: n.identityId,
        limit: n.limit ?? undefined,
        startAtVoteId: n.startAtVoteId ?? n.startAtVotePollIdInfo ?? undefined,
        startAtIncluded: n.startAtIncluded ?? undefined,
        orderAscending: n.orderAscending ?? undefined,
      };
      return useProof ? c.voting.contestedResourceIdentityVotesWithProof(query) : c.voting.contestedResourceIdentityVotes(query);
    }
    case 'getVotePollsByEndDate': {
      const query = {
        startTimeMs: n.startTimeMs ?? undefined,
        startTimeIncluded: n.startTimeMs ? (n.startTimeIncluded ?? undefined) : undefined,
        endTimeMs: n.endTimeMs ?? undefined,
        endTimeIncluded: n.endTimeMs ? (n.endTimeIncluded ?? undefined) : undefined,
        limit: n.limit ?? undefined,
        offset: n.offset ?? undefined,
        orderAscending: n.orderAscending ?? undefined,
      };
      return useProof ? c.voting.votePollsByEndDateWithProof(query) : c.voting.votePollsByEndDate(query);
    }

    case 'masternodeVote': {
      const contested = (typeof n.contestedResourceDropdown === 'object' && n.contestedResourceDropdown !== null)
        ? n.contestedResourceDropdown
        : {};
      const contractId = n.contractId || contested.contractId;
      const documentTypeName = n.documentTypeName || contested.documentTypeName;
      const indexName = n.indexName || contested.indexName;
      let indexValues = Array.isArray(n.indexValues) ? n.indexValues : contested.indexValues;
      if (!Array.isArray(indexValues) || !indexValues.length) {
        throw new Error('Index values are required. Use "Get Contested Resources" to load them.');
      }
      let voteChoice = n.voteChoice;
      if (!voteChoice) {
        throw new Error('Vote choice is required.');
      }
      if (voteChoice === 'towardsIdentity') {
        const targetIdentity = n.targetIdentity || '';
        if (!targetIdentity) {
          throw new Error('Target identity ID is required when voting towards an identity.');
        }
        voteChoice = `towardsIdentity:${targetIdentity}`;
      }
      const masternodeProTxHash = n.masternodeProTxHash || contested.masternodeProTxHash;
      if (!masternodeProTxHash) {
        throw new Error('Masternode ProTxHash is required. Enter it in the Identity ID field.');
      }
      if (!contractId || !documentTypeName || !indexName) {
        throw new Error('Contested resource details are incomplete. Fetch contested resources and select one.');
      }
      return c.voting.masternodeVote({
        masternodeProTxHash,
        contractId,
        documentTypeName,
        indexName,
        indexValues,
        voteChoice,
        votingKeyWif: n.votingKeyWif,
      });
    }

    // System
    case 'getStatus':
      return c.system.status();
    case 'getCurrentQuorumsInfo':
      return c.system.currentQuorumsInfo();
    case 'getTotalCreditsInPlatform':
      return useProof ? c.system.totalCreditsInPlatformWithProof() : c.system.totalCreditsInPlatform();
    case 'getPrefundedSpecializedBalance':
      return useProof ? c.system.prefundedSpecializedBalanceWithProof(n.identityId) : c.system.prefundedSpecializedBalance(n.identityId);
    case 'getPathElements': {
      const path = toStringArray(n.path);
      const keys = toStringArray(n.keys);
      return useProof ? c.system.pathElementsWithProof(path, keys) : c.system.pathElements(path, keys);
    }
    case 'waitForStateTransitionResult':
      return c.stateTransitions.waitForStateTransitionResult(n.stateTransitionHash);

    // Platform Address queries
    case 'getPlatformAddress':
      return useProof ? c.addresses.getWithProof(n.address) : c.addresses.get(n.address);
    case 'getPlatformAddresses': {
      const addresses = toStringArray(n.addresses);
      return useProof ? c.addresses.getManyWithProof(addresses) : c.addresses.getMany(addresses);
    }

    default:
      throw new Error(`Operation ${itemKey} is not supported in the demo UI.`);
  }
}
