#!/usr/bin/env python3
"""
Documentation generator for Evo JS SDK.

This generator restores the legacy docs layout so that the generated
`public/docs.html` matches the markup and styling of the pre-migration
version while sourcing content from the Evo SDK definitions.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import textwrap
import zipfile
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Callable, Iterable, List, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = REPO_ROOT / 'public'
NODE_MODULES_DIR = REPO_ROOT / 'node_modules'
DEFAULT_TEST_IDENTITY = '5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk'

def copy_node_modules_dist(package: str, destination: Path) -> bool:
    """Copy the /dist directory from node_modules if it exists."""
    package_path = NODE_MODULES_DIR
    for part in package.split('/'):
        package_path = package_path / part
    dist_path = package_path / 'dist'
    if not dist_path.exists():
        return False

    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(dist_path, destination)
    return True


def rewrite_wasm_wrapper(wasm_file: Path) -> None:
    """Replace bare module specifiers with local relative paths for browser usage."""
    if not wasm_file.exists():
        return
    contents = wasm_file.read_text(encoding='utf-8')
    replacement = contents.replace("@dashevo/wasm-sdk/compressed", "./sdk.compressed.js")
    if replacement != contents:
        wasm_file.write_text(replacement, encoding='utf-8')

TESTNET_TEST_DATA = {
    'identity_id': DEFAULT_TEST_IDENTITY,
    'specialized_balance_id': 'AzaU7zqCT7X1kxh8yWxkT9PxAgNqWDu4Gz13emwcRyAT',
    'contract_id': 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    'data_contract_id': 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
    'data_contract_history_id': 'HLY575cNazmc5824FxqaEMEBuzFeE4a98GDRNKbyJqCM',
    'token_contract_id': 'ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A',
    'group_contract_id': '49PJEnNx7ReCitzkLdkDNr4s6RScGsnNexcdSZJ1ph5N',
    'public_key_hash_unique': 'b7e904ce25ed97594e72f7af0e66f298031c1754',
    'public_key_hash_non_unique': '518038dc858461bcee90478fd994bba8057b7531',
    'pro_tx_hash': '143dcd6a6b7684fde01e88a10e5d65de9a29244c5ecd586d14a342657025f113',
    'token_id': 'Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv',
    'document_type': 'domain',
    'document_id': '7NYmEKQsYtniQRUmxwdPGeVcirMoPh5ZPyAKz8BWFy3r',
    'username': 'alice',
    'epoch': 8635
}


def example(text: str) -> str:
    return textwrap.dedent(text).strip()


def load_api_definitions(api_definitions_file: Path) -> tuple[dict, dict]:
    with open(api_definitions_file, 'r', encoding='utf-8') as f:
        api_data = json.load(f)
    return api_data.get('queries', {}), api_data.get('transitions', {})


def evo_example_for_query(key: str, inputs: List[dict]):
    data = TESTNET_TEST_DATA
    examples = {
        'getIdentity': example(f"""
            return await sdk.identities.fetch('{data['identity_id']}')
        """),
        'getIdentityUnproved': example(f"""
            return await sdk.identities.fetchUnproved('{data['identity_id']}')
        """),
        'getIdentityKeys': example(f"""
            return await sdk.identities.getKeys({{
                identityId: '{data['identity_id']}',
                keyRequestType: 'all',
                limit: 10,
                offset: 0
            }})
        """),
        'getIdentitiesContractKeys': example(f"""
            return await sdk.identities.contractKeys({{
                identityIds: ['{data['identity_id']}'],
                contractId: '{data['data_contract_id']}'
            }})
        """),
        'getDataContract': example(f"""
            return await sdk.contracts.fetch('{data['data_contract_id']}')
        """),
        'getDataContractHistory': example(f"""
            return await sdk.contracts.getHistory({{
                contractId: '{data['data_contract_history_id']}',
                limit: 10,
                startAtMs: '0'
            }})
        """),
        'getDataContracts': example(f"""
            return await sdk.contracts.getMany([
                '{data['data_contract_id']}',
                '{data['token_contract_id']}'
            ])
        """),
        'getDocuments': example(f"""
            return await sdk.documents.query({{
                contractId: '{data['data_contract_id']}',
                type: '{data['document_type']}',
                where: JSON.stringify([["normalizedParentDomainName", "==", "dash"]]),
                orderBy: JSON.stringify([["normalizedLabel", "asc"]]),
                limit: 10
            }})
        """),
        'getDocument': example(f"""
            return await sdk.documents.get(
                '{data['data_contract_id']}',
                '{data['document_type']}',
                '{data['document_id']}'
            )
        """),
        'getDpnsUsername': example(f"""
            return await sdk.dpns.username('{data['identity_id']}')
        """),
        'getDpnsUsernames': example(f"""
            return await sdk.dpns.usernames('{data['identity_id']}', {{ limit: 10 }})
        """),
        'getDpnsUsernameByName': example("""
            return await sdk.dpns.getUsernameByName('alice.dash')
        """),
        'dpnsCheckAvailability': example("""
            return await sdk.dpns.isNameAvailable('alice')
        """),
        'dpnsResolve': example("""
            return await sdk.dpns.resolveName('alice.dash')
        """),
        'dpnsConvertToHomographSafe': example("""
            return sdk.dpns.convertToHomographSafe('ąlice')
        """),
        'dpnsIsValidUsername': example("""
            return sdk.dpns.isValidUsername('alice')
        """),
        'dpnsIsContestedUsername': example("""
            return sdk.dpns.isContestedUsername('alice')
        """),
        'getContestedResources': example(f"""
            return await sdk.group.contestedResources({{
                contractId: '{data['data_contract_id']}',
                documentTypeName: 'domain',
                indexName: 'parentNameAndLabel',
                startAtValue: null,
                limit: 10,
                orderAscending: true
            }})
        """),
        'getContestedResourceVoteState': example(f"""
            return await sdk.voting.contestedResourceVoteState({{
                contractId: '{data['data_contract_id']}',
                documentTypeName: 'domain',
                indexName: 'parentNameAndLabel',
                indexValues: ['dash', 'alice'],
                resultType: 'documents',
                count: 10,
                orderAscending: true
            }})
        """),
        'getContestedResourceVotersForIdentity': example(f"""
            return await sdk.group.contestedResourceVotersForIdentity({{
                contractId: '{data['data_contract_id']}',
                documentTypeName: 'domain',
                indexName: 'parentNameAndLabel',
                indexValues: ['dash', 'alice'],
                contestantId: '{data['identity_id']}',
                limit: 10,
                orderAscending: true
            }})
        """),
        'getContestedResourceIdentityVotes': example(f"""
            return await sdk.voting.contestedResourceIdentityVotes(
                '{data['identity_id']}',
                {{ limit: 10, orderAscending: true }}
            )
        """),
        'getVotePollsByEndDate': example("""
            return await sdk.voting.votePollsByEndDate({
                startTimeInfo: null,
                endTimeInfo: null,
                limit: 10,
                orderAscending: true,
            })
        """),
        'getProtocolVersionUpgradeState': example("""
            return await sdk.protocol.versionUpgradeState()
        """),
        'getProtocolVersionUpgradeVoteStatus': example(f"""
            return await sdk.protocol.versionUpgradeVoteStatus({{
                startProTxHash: '{data['pro_tx_hash']}',
                count: 10
            }})
        """),
        'getEpochsInfo': example(f"""
            return await sdk.epoch.epochsInfo({{
                startEpoch: {data['epoch']},
                count: 5,
                ascending: true
            }})
        """),
        'getCurrentEpoch': example("""
            return await sdk.epoch.current()
        """),
        'getFinalizedEpochInfos': example(f"""
            return await sdk.epoch.finalizedInfos({{
                startEpoch: {data['epoch']},
                count: 5,
                ascending: true
            }})
        """),
        'getEvonodesProposedEpochBlocksByIds': example(f"""
            return await sdk.epoch.evonodesProposedBlocksByIds(
                {data['epoch']},
                ['{data['pro_tx_hash']}']
            )
        """),
        'getEvonodesProposedEpochBlocksByRange': example(f"""
            return await sdk.epoch.evonodesProposedBlocksByRange({data['epoch']}, {{
                limit: 5,
                orderAscending: true
            }})
        """),
        'getTokenStatuses': example(f"""
            return await sdk.tokens.statuses([
                '{data['token_id']}',
                'H7FRpZJqZK933r9CzZMsCuf1BM34NT5P2wSJyjDkprqy'
            ])
        """),
        'getTokenDirectPurchasePrices': example(f"""
            return await sdk.tokens.directPurchasePrices([
                '{data['token_id']}'
            ])
        """),
        'getTokenContractInfo': example(f"""
            return await sdk.tokens.contractInfo('{data['token_contract_id']}')
        """),
        'getTokenPriceByContract': example(f"""
            return await sdk.tokens.priceByContract('{data['token_contract_id']}', 0)
        """),
        'getTokenPerpetualDistributionLastClaim': example(f"""
            return await sdk.tokens.perpetualDistributionLastClaim(
                '{data['identity_id']}',
                '{data['token_id']}'
            )
        """),
        'getTokenTotalSupply': example(f"""
            return await sdk.tokens.totalSupply('{data['token_id']}')
        """),
        'getGroupInfo': example(f"""
            return await sdk.group.info('{data['group_contract_id']}', 0)
        """),
        'getGroupInfos': example(f"""
            return await sdk.group.infos('{data['group_contract_id']}', null, 10)
        """),
        'getGroupMembers': example(f"""
            return await sdk.group.members('{data['group_contract_id']}', 0, {{ limit: 10 }})
        """),
        'getGroupActions': example(f"""
            return await sdk.group.actions('{data['group_contract_id']}', 0, 'ACTIVE', {{ count: 10 }})
        """),
        'getGroupActionSigners': example(f"""
            return await sdk.group.actionSigners('{data['group_contract_id']}', 0, 'ACTIVE', '6XJzL6Qb8Zhwxt4HFwh8NAn7q1u4dwdoUf8EmgzDudFZ')
        """),
        'getIdentityGroups': example(f"""
            return await sdk.group.identityGroups('{data['identity_id']}', {{}})
        """),
        'getGroupsDataContracts': example(f"""
            return await sdk.group.groupsDataContracts(['{data['data_contract_id']}'])
        """),
        'getStatus': example("""
            return await sdk.system.status()
        """),
        'getCurrentQuorumsInfo': example("""
            return await sdk.system.currentQuorumsInfo()
        """),
        'getPrefundedSpecializedBalance': example(f"""
            return await sdk.system.prefundedSpecializedBalance('{data['specialized_balance_id']}')
        """),
        'getTotalCreditsInPlatform': example("""
            return await sdk.system.totalCreditsInPlatform()
        """),
        'getPathElements': example(f"""
            return await sdk.system.pathElements(['96'], ['{data['identity_id']}'])
        """),
        'waitForStateTransitionResult': example("""
            return await sdk.system.waitForStateTransitionResult('0000000000000000000000000000000000000000000000000000000000000000')
        """),
        'getIdentityTokenBalances': example(f"""
            return await sdk.identities.tokenBalances('{data['identity_id']}', ['{data['token_id']}'])
        """),
        'getIdentitiesTokenBalances': example(f"""
            return await sdk.tokens.balances(['{data['identity_id']}'], '{data['token_id']}')
        """),
        'getIdentityTokenInfos': example(f"""
            return await sdk.tokens.identityTokenInfos('{data['identity_id']}', ['{data['token_id']}'], {{ limit: 10, offset: 0 }})
        """),
        'getIdentitiesTokenInfos': example(f"""
            return await sdk.tokens.identitiesTokenInfos(['{data['identity_id']}'], '{data['token_id']}')
        """),
        'getIdentityNonce': example(f"""
            return await sdk.identities.nonce('{data['identity_id']}')
        """),
        'getIdentityContractNonce': example(f"""
            return await sdk.identities.contractNonce('{data['identity_id']}', '{data['data_contract_id']}')
        """),
        'getIdentityBalance': example(f"""
            return await sdk.identities.balance('{data['identity_id']}')
        """),
        'getIdentitiesBalances': example(f"""
            return await sdk.identities.balances(['{data['identity_id']}'])
        """),
        'getIdentityBalanceAndRevision': example(f"""
            return await sdk.identities.balanceAndRevision('{data['identity_id']}')
        """),
        'getIdentityByPublicKeyHash': example(f"""
            return await sdk.identities.byPublicKeyHash('{data['public_key_hash_unique']}')
        """),
        'getIdentityByNonUniquePublicKeyHash': example(f"""
            return await sdk.identities.byNonUniquePublicKeyHash('{data['public_key_hash_non_unique']}', {{ startAfter: null }})
        """),
    }
    return examples.get(key)


def evo_example_for_transition(key: str):
    m = {
        # Identities
        # 'identityCreate' - example in api-definitions.json
        # 'identityTopUp' - example in api-definitions.json
        'identityCreditTransfer': "await client.identities.creditTransfer({ senderId, recipientId, amount, privateKeyWif, keyId })",
        'identityCreditWithdrawal': "await client.identities.creditWithdrawal({ identityId, toAddress, amount, coreFeePerByte, privateKeyWif, keyId })",
        'identityUpdate': "await client.identities.update({ identityId, addPublicKeys, disablePublicKeyIds, privateKeyWif })",
        'dataContractCreate': "await client.contracts.create({ ownerId, definition, privateKeyWif, keyId })",
        'dataContractUpdate': "await client.contracts.update({ contractId, ownerId, updates, privateKeyWif, keyId })",
        # Documents
        'documentCreate': "await client.documents.create({ contractId, type: documentType, ownerId, data, entropyHex, privateKeyWif })",
        'documentReplace': "await client.documents.replace({ contractId, type: documentType, documentId, ownerId, data, revision, privateKeyWif })",
        'documentDelete': "await client.documents.delete({ contractId, type: documentType, documentId, ownerId, privateKeyWif })",
        'documentTransfer': "await client.documents.transfer({ contractId, type: documentType, documentId, ownerId, recipientId, privateKeyWif })",
        'documentPurchase': "await client.documents.purchase({ contractId, type: documentType, documentId, buyerId, price, privateKeyWif })",
        'documentSetPrice': "await client.documents.setPrice({ contractId, type: documentType, documentId, ownerId, price, privateKeyWif })",
        # Tokens
        'tokenMint': "await client.tokens.mint({ contractId, tokenPosition, amount, identityId, privateKeyWif, recipientId, publicNote })",
        'tokenBurn': "await client.tokens.burn({ contractId, tokenPosition, amount, identityId, privateKeyWif, publicNote })",
        'tokenTransfer': "await client.tokens.transfer({ contractId, tokenPosition, amount, senderId, recipientId, privateKeyWif, publicNote })",
        'tokenFreeze': "await client.tokens.freeze({ contractId, tokenPosition, identityToFreeze, freezerId, privateKeyWif, publicNote })",
        'tokenUnfreeze': "await client.tokens.unfreeze({ contractId, tokenPosition, identityToUnfreeze, unfreezerId, privateKeyWif, publicNote })",
        'tokenDestroyFrozen': "await client.tokens.destroyFrozen({ contractId, tokenPosition, identityId: frozenIdentityId, destroyerId, privateKeyWif, publicNote })",
        'tokenSetPriceForDirectPurchase': "await client.tokens.setPriceForDirectPurchase({ contractId, tokenPosition, identityId, priceType, priceData, privateKeyWif, publicNote })",
        'tokenDirectPurchase': "await client.tokens.directPurchase({ contractId, tokenPosition, amount, identityId, totalAgreedPrice, privateKeyWif })",
        'tokenClaim': "await client.tokens.claim({ contractId, tokenPosition, distributionType, identityId, privateKeyWif, publicNote })",
        'tokenConfigUpdate': "await client.tokens.configUpdate({ contractId, tokenPosition, configItemType, configValue, identityId, privateKeyWif, publicNote })",
        # Voting
        'dpnsUsername': "await client.voting.masternodeVote({ masternodeProTxHash, contractId, documentTypeName, indexName, indexValues, voteChoice, votingKeyWif })",
        'masternodeVote': "await client.voting.masternodeVote({ masternodeProTxHash, contractId, documentTypeName, indexName, indexValues, voteChoice, votingKeyWif })",
        'dpnsRegister': "await client.dpns.registerName({ label, identityId, publicKeyId, privateKeyWif, onPreorder })",
    }
    return m.get(key)


def safe_value(text) -> str:
    if text is None:
        return ''
    return escape(str(text), quote=False)


def render_parameter(param: dict) -> str:
    name = safe_value(param.get('label') or param.get('name') or 'Parameter')
    param_type = safe_value(param.get('type', 'text'))
    required = bool(param.get('required'))
    requirement_class = 'param-required' if required else 'param-optional'
    requirement_text = '(required)' if required else '(optional)'

    lines = [
        '                <div class="parameter">',
        f'                    <span class="param-name">{name}</span>',
        f'                    <span class="param-type">{param_type}</span>',
        f'                    <span class="{requirement_class}">{requirement_text}</span>',
    ]

    description = param.get('description')
    if description:
        lines.append(f'                    <br><small>{safe_value(description)}</small>')

    default = param.get('default')
    if default not in (None, ''):
        lines.append(f'                    <br><small>Default: {safe_value(default)}</small>')

    placeholder = param.get('placeholder')
    if placeholder not in (None, ''):
        lines.append(f'                    <br><small>Example: {safe_value(placeholder)}</small>')

    options = param.get('options') or []
    if options:
        option_labels: List[str] = []
        for opt in options:
            label = opt.get('label')
            value = opt.get('value')
            if label and label != value:
                option_labels.append(str(label))
            elif value is not None:
                option_labels.append(str(value))
        if option_labels:
            lines.append(f'                    <br><small>Options: {safe_value(", ".join(option_labels))}</small>')

    lines.append('                </div>')
    return '\n'.join(lines)


def render_parameters(params: List[dict]) -> str:
    if not params:
        return '                <p class="param-optional">No parameters required</p>'
    return '\n'.join(render_parameter(param) for param in params)


def format_example(code: str, header: str) -> str:
    formatted = (code or '').replace('\\n', '\n').strip()
    if not formatted:
        return header

    body_lines = formatted.split('\n')
    if body_lines:
        first_line = body_lines[0].lstrip()
        if first_line and not first_line.startswith('return'):
            body_lines[0] = f'return {first_line}'

    def replace_client(line: str) -> str:
        return line.replace('client', 'sdk')

    processed = [replace_client(line) for line in body_lines]
    lines = [header]
    lines.extend(processed)
    return '\n'.join(lines).rstrip()


def render_operation(
    prefix: str,
    item_key: str,
    item: dict,
    example_code: str,
    header: str,
    include_run_button: bool,
) -> str:
    label = safe_value(item.get('label', item_key))
    description = safe_value(item.get('description', 'No description available'))
    params = item.get('sdk_params') or item.get('inputs', [])
    params_html = render_parameters(params)
    example_html = safe_value(format_example(example_code, header))

    if include_run_button:
        run_section = (
            f"                <div class=\"example-code\" id=\"code-{item_key}\">{example_html}</div>\n"
            f"                <button class=\"run-button\" id=\"run-{item_key}\" onclick=\"runExample('{item_key}')\">Run</button>\n"
            f"                <div class=\"example-result\" id=\"result-{item_key}\"></div>"
        )
    else:
        run_section = f"                <div class=\"example-code\">{example_html}</div>"

    return f'''        <div class="operation">
            <h4 id="{prefix}-{item_key}">{label}</h4>
            <p class="description">{description}</p>
            
            <div class="parameters">
                <h5>Parameters:</h5>
{params_html}
            </div>
            
            <div class="example-container">
                <h5>Example</h5>
{run_section}
            </div>
        </div>'''


def collect_sections(definitions: dict, entries_key: str, example_resolver: Callable[[str, dict], str | None]) -> List[Tuple[str, dict, List[Tuple[str, dict, str]]]]:
    sections: List[Tuple[str, dict, List[Tuple[str, dict, str]]]] = []
    for cat_key, category in definitions.items():
        items = []
        for item_key, item in (category.get(entries_key) or {}).items():
            example = example_resolver(item_key, item)
            if example:
                items.append((item_key, item, example))
        if items:
            sections.append((cat_key, category, items))
    return sections


def build_sidebar_entries(sections: Iterable[Tuple[str, dict, List[Tuple[str, dict, str]]]], prefix: str) -> str:
    lines: List[str] = []
    for cat_key, category, items in sections:
        label = safe_value(category.get('label', cat_key))
        lines.append(f'            <li class="category">{label}</li>')
        for item_key, item, _example in items:
            item_label = safe_value(item.get('label', item_key))
            lines.append(f'            <li style="margin-left: 20px;"><a href="#{prefix}-{item_key}">{item_label}</a></li>')
    return '\n'.join(lines)


def render_categories(
    sections: Iterable[Tuple[str, dict, List[Tuple[str, dict, str]]]],
    prefix: str,
    header: str,
    include_run_button: bool,
) -> str:
    blocks: List[str] = []
    for cat_key, category, items in sections:
        label = safe_value(category.get('label', cat_key))
        operations = '\n'.join(
            render_operation(prefix, item_key, item, example, header, include_run_button)
            for item_key, item, example in items
        )
        blocks.append(f'''    <div class="category">
        <h3>{label}</h3>
{operations}
    </div>''')
    return '\n'.join(blocks)


def generate_docs_script() -> str:
    script = """
        import { EvoSDK } from './dist/evo-sdk.module.js';

        let client = null;
        let clientPromise = null;

        function updateProgress(percent, text) {
            const progressFill = document.getElementById('progressFill');
            const progressPercent = document.getElementById('progressPercent');
            const preloaderText = document.getElementById('preloaderText');

            if (progressFill) progressFill.style.width = `${percent}%`;
            if (progressPercent) progressPercent.textContent = `${percent}%`;
            if (preloaderText && text) preloaderText.textContent = text;
        }

        function showPreloader(message = 'Initializing Evo SDK...') {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('preloader--visible');
            }
            updateProgress(5, message);
        }

        function hidePreloader() {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                setTimeout(() => preloader.classList.remove('preloader--visible'), 200);
            }
        }

        async function getClient() {
            if (client && client.isConnected !== false) {
                return client;
            }
            if (clientPromise) {
                return clientPromise;
            }

            clientPromise = (async () => {
                showPreloader();
                try {
                    updateProgress(20, 'Creating Evo SDK client...');
                    let instance;
                    if (typeof EvoSDK.testnetTrusted === 'function') {
                        instance = EvoSDK.testnetTrusted();
                    } else {
                        instance = new EvoSDK({ network: 'testnet', trusted: true });
                    }

                    if (instance && typeof instance.connect === 'function') {
                        updateProgress(45, 'Connecting to Dash Platform...');
                        await instance.connect();
                    }

                    client = instance;
                    window.evoDocsClient = client;
                    updateProgress(100, 'Ready!');
                    hidePreloader();
                    return client;
                } catch (error) {
                    console.error('Failed to initialize Evo SDK client for docs:', error);
                    updateProgress(0, 'Initialization failed');
                    hidePreloader();
                    throw error;
                } finally {
                    clientPromise = null;
                }
            })();

            return clientPromise;
        }

        function formatResult(output) {
            if (typeof output === 'undefined') {
                return 'Completed (no result returned)';
            }
            if (output === null) {
                return 'null';
            }
            if (typeof output === 'string') {
                return output;
            }
            try {
                return JSON.stringify(output, null, 2);
            } catch (error) {
                return String(output);
            }
        }

        window.runExample = async function(exampleId) {
            const button = document.getElementById(`run-${exampleId}`);
            const result = document.getElementById(`result-${exampleId}`);
            const codeElement = document.getElementById(`code-${exampleId}`);

            if (!button || !result || !codeElement) {
                return { success: false, error: 'Example not found.' };
            }

            button.disabled = true;
            button.innerHTML = '<span class="loading"></span> Running...';
            result.style.display = 'none';

            try {
                const sdk = await getClient();
                const code = codeElement.textContent;
                const fn = new Function('EvoSDK', 'getClient', 'sdk', 'return (async () => { ' + code + ' })();');
                const output = await fn(EvoSDK, getClient, sdk);
                result.className = 'example-result success';
                result.textContent = formatResult(output);
                return { success: true, output };
            } catch (error) {
                result.className = 'example-result error';
                result.textContent = error?.message || String(error);
                return { success: false, error: error?.message || String(error) };
            } finally {
                result.style.display = 'block';
                button.disabled = false;
                button.innerHTML = 'Run';
            }
        };

        let testRunner = null;
        let testRunnerRefs = null;

        function ensureTestRunner() {
            if (testRunner) {
                return testRunnerRefs;
            }

            const wrapper = document.createElement('div');
            wrapper.id = 'test-runner';
            wrapper.style.cssText = 'display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); max-width:80%; max-height:80%; overflow:auto; background:#fff; border:2px solid #3498db; border-radius:10px; padding:20px; box-shadow:0 4px 20px rgba(0,0,0,0.3); z-index:10000; font-family:inherit; color:#2c3e50;';

            wrapper.innerHTML = `
                <button id="testRunnerClose" style="position:absolute; top:10px; right:10px; background:#e74c3c; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">✕</button>
                <h2 style="margin-top:0;">Evo SDK Docs Test Runner</h2>
                <p style="margin:8px 0 20px; color:#4a5568;">Runs all query examples sequentially using the embedded Evo SDK client.</p>
                <button id="testRunnerRunAll" style="background:#3498db; color:#fff; border:none; padding:10px 18px; border-radius:5px; cursor:pointer; font-size:15px;">Run All Tests</button>
                <div id="testRunnerProgress" style="margin-top:18px; font-weight:600;"></div>
                <div id="testRunnerSummary" style="margin-top:12px; display:flex; gap:18px;"></div>
                <div id="testRunnerResults" style="margin-top:16px; font-size:14px; line-height:1.5;"></div>
            `;

            document.body.appendChild(wrapper);

            const closeBtn = wrapper.querySelector('#testRunnerClose');
            const runAllBtn = wrapper.querySelector('#testRunnerRunAll');
            const progress = wrapper.querySelector('#testRunnerProgress');
            const summary = wrapper.querySelector('#testRunnerSummary');
            const results = wrapper.querySelector('#testRunnerResults');

            closeBtn.addEventListener('click', hideTestRunner);
            runAllBtn.addEventListener('click', runAllTests);

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && testRunner && testRunner.style.display !== 'none') {
                    hideTestRunner();
                }
            });

            testRunner = wrapper;
            testRunnerRefs = { closeBtn, runAllBtn, progress, summary, results };
            return testRunnerRefs;
        }

        function showTestRunner() {
            const refs = ensureTestRunner();
            if (!testRunner) {
                return;
            }
            refs.progress.textContent = '';
            refs.summary.innerHTML = '';
            refs.results.innerHTML = '';
            testRunner.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function hideTestRunner() {
            if (!testRunner) {
                return;
            }
            testRunner.style.display = 'none';
            document.body.style.overflow = '';
        }

        async function runAllTests() {
            const refs = ensureTestRunner();
            const runButtons = Array.from(document.querySelectorAll('.run-button'));
            const total = runButtons.length;

            if (!total) {
                refs.progress.textContent = 'No runnable examples found.';
                refs.summary.innerHTML = '';
                refs.results.innerHTML = '';
                return;
            }

            const originalLabel = refs.runAllBtn.textContent;
            refs.runAllBtn.disabled = true;
            refs.runAllBtn.textContent = 'Running…';

            try {
                refs.progress.textContent = `Running ${total} tests...`;
                refs.summary.innerHTML = '';
                refs.results.innerHTML = '';

                let passed = 0;
                let failed = 0;
                const resultItems = [];

                for (let index = 0; index < total; index += 1) {
                    const button = runButtons[index];
                    const exampleId = button.id.replace('run-', '');
                    refs.progress.textContent = `Running ${exampleId} (${index + 1}/${total})...`;

                    const outcome = await runExample(exampleId);
                    if (outcome?.success) {
                        passed += 1;
                        resultItems.push(`<div style=\"color:#27ae60; margin:4px 0;\">✅ ${exampleId}: PASSED</div>`);
                    } else {
                        failed += 1;
                        let msg = outcome?.error || 'Unknown error';
                        if (!/^error/i.test(msg)) {
                            msg = `Error: ${msg}`;
                        }
                        resultItems.push(`<div style=\"color:#e74c3c; margin:4px 0;\">❌ ${exampleId}: FAILED - ${msg}</div>`);
                    }

                    refs.results.innerHTML = resultItems.join('');
                }

                refs.progress.textContent = 'All tests completed.';
                const successRate = ((passed / total) * 100).toFixed(1);
                refs.summary.innerHTML = `
                    <div>Total: ${total}</div>
                    <div style="color:#27ae60;">Passed: ${passed}</div>
                    <div style="color:#e74c3c;">Failed: ${failed}</div>
                    <div>Success Rate: ${successRate}%</div>
                `;
                refs.results.innerHTML = resultItems.join('');
            } finally {
                refs.runAllBtn.disabled = false;
                refs.runAllBtn.textContent = originalLabel;
            }
        }

        function setupTestRunnerShortcut() {
            const queriesHeader = document.querySelector('.sidebar .section-header');
            if (!queriesHeader) {
                return;
            }

            let clickCount = 0;
            let timer = null;

            queriesHeader.addEventListener('click', () => {
                clickCount += 1;

                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(() => {
                    clickCount = 0;
                }, 500);

                if (clickCount === 3) {
                    clickCount = 0;
                    clearTimeout(timer);
                    timer = null;
                    showTestRunner();
                }
            });
        }

        window.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('sidebar-search');
            const sidebarItems = Array.from(document.querySelectorAll('.sidebar li'));
            const categories = Array.from(document.querySelectorAll('.sidebar .category'));
            const sectionHeaders = Array.from(document.querySelectorAll('.sidebar .section-header'));
            const noResults = document.getElementById('no-results');

            if (searchInput) {
                searchInput.addEventListener('input', (event) => {
                    const term = event.target.value.trim().toLowerCase();
                    let hasResults = false;

                    categories.forEach(cat => {
                        cat.style.display = term ? 'none' : 'block';
                    });
                    sectionHeaders.forEach(header => {
                        header.style.display = term ? 'none' : 'block';
                    });

                    sidebarItems.forEach(item => {
                        const link = item.querySelector('a');
                        if (!link) {
                            return;
                        }
                        const matches = term === '' || link.textContent.toLowerCase().includes(term);
                        if (matches) {
                            item.classList.remove('hidden');
                            hasResults = true;

                            if (term) {
                                let prev = item.previousElementSibling;
                                while (prev) {
                                    if (prev.classList && prev.classList.contains('category')) {
                                        prev.style.display = 'block';
                                        break;
                                    }
                                    prev = prev.previousElementSibling;
                                }
                            }
                        } else {
                            item.classList.add('hidden');
                        }
                    });

                    if (noResults) {
                        noResults.style.display = hasResults ? 'none' : 'block';
                    }
                });
            }

            getClient().catch((error) => {
                const consoleMessage = error?.message || error;
                console.error('Evo SDK docs client failed to initialize:', consoleMessage);
            });

            setupTestRunnerShortcut();
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker-simple.js').catch((error) => {
                console.warn('Service worker registration failed:', error);
            });
        }
    """
    return textwrap.dedent(script).strip()


def generate_docs_html(query_defs: dict, transition_defs: dict) -> str:
    query_sections = collect_sections(
        query_defs,
        'queries',
        lambda key, item: evo_example_for_query(key, item.get('inputs', []))
    )
    transition_sections = collect_sections(
        transition_defs,
        'transitions',
        lambda key, item: item.get('sdk_example') or evo_example_for_transition(key)
    )

    sidebar_queries = build_sidebar_entries(query_sections, 'query')
    sidebar_transitions = build_sidebar_entries(transition_sections, 'transition')

    query_content = render_categories(query_sections, 'query', '// Evo SDK example', True) if query_sections else ''
    transition_content = render_categories(transition_sections, 'transition', '// Evo SDK example (requires keys/funding)', False) if transition_sections else ''

    docs_script = generate_docs_script()

    overview_block = f'''        <div class="category" id="overview">
            <h2>Overview</h2>
            <p>The Dash Platform Evo JS SDK exposes a modern JavaScript interface for interacting with platform data and submitting state transitions.\n            This documentation mirrors the legacy layout so you can quickly find queries and transitions while using the Evo SDK.</p>

            <h3>Key Concepts</h3>
            <ul>
                <li><strong>Queries</strong>: Read-only operations that fetch data from Dash Platform</li>
                <li><strong>State Transitions</strong>: Mutating operations that require properly authorized identities</li>
                <li><strong>Proofs</strong>: Many queries can return cryptographic proofs for verification</li>
                <li><strong>Credits</strong>: Platform fees are collected in credits; keep balances funded before submitting transitions</li>
                <li><strong>Default Limits</strong>: Optional limit arguments default to a maximum of 100 items unless specified</li>
            </ul>

            <p><strong>Tip:</strong> Examples below execute against Dash Platform Testnet via the Evo SDK client. Click "Run" to invoke any example.</p>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <strong>Test Identity:</strong> Examples use the testnet identity <code style="background-color: #fff; padding: 2px 6px; border-radius: 3px;">{DEFAULT_TEST_IDENTITY}</code><br>
                This identity has activity on testnet and is safe to use for read-only demonstrations.
            </div>
        </div>'''

    html = f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Dash Platform Evo JS SDK Documentation</title>
    <link rel=\"icon\" type=\"image/svg+xml\" href=\"https://media.dash.org/wp-content/uploads/blue-d.svg\">
    <link rel=\"alternate icon\" type=\"image/png\" href=\"https://media.dash.org/wp-content/uploads/blue-d-250.png\">
    <link rel=\"stylesheet\" href=\"docs.css\">
    <script type=\"module\">
{textwrap.indent(docs_script, '        ')}
    </script>
</head>
<body>
    <div id=\"preloader\">
        <div class=\"preloader-content\">
            <div class=\"preloader-text\" id=\"preloaderText\">Initializing Evo SDK...</div>
            <div class=\"preloader-progress\">
                <div class=\"progress-bar\">
                    <div class=\"progress-fill\" id=\"progressFill\"></div>
                </div>
                <div class=\"progress-percent\" id=\"progressPercent\">0%</div>
            </div>
        </div>
    </div>

    <div class=\"sidebar\">
        <h2>Table of Contents</h2>
        <div class=\"search-container\">
            <input type=\"text\" id=\"sidebar-search\" class=\"search-input\" placeholder=\"Search queries and transitions...\">
        </div>
        <div id=\"no-results\" class=\"no-results\">No results found</div>
        <ul>
            <li><a href=\"#overview\">Overview</a></li>
        </ul>

        <div class=\"section-header\">Queries</div>
        <ul>
{textwrap.indent(sidebar_queries, '            ')}
        </ul>

        <div class=\"section-header state-transitions\">State Transitions</div>
        <ul>
{textwrap.indent(sidebar_transitions, '            ')}
        </ul>
    </div>

    <div class=\"main-content\">
        <nav class=\"nav\">
            <ul>
                <li><a href=\"index.html\">← Back to SDK</a></li>
                <li><a href=\"AI_REFERENCE.md\">AI Reference</a></li>
                <li><a href=\"https://github.com/dashpay/evo-sdk-website\" target=\"_blank\">GitHub</a></li>
            </ul>
        </nav>

        <h1>Dash Platform Evo JS SDK Documentation</h1>

{overview_block}

        <h2 id=\"queries\">Queries</h2>
{query_content}

        <h2 id=\"state-transitions\">State Transitions</h2>
        <p class=\"description\">State transitions require valid identities, funds, and private keys. Configure your Evo SDK client appropriately before running these operations on mainnet.</p>
{transition_content}
    </div>
</body>
</html>
"""
    return html


def format_ai_example_block(code: str | None, item_key: str) -> str:
    snippet = (code or '').replace('\\n', '\n').strip()
    if not snippet:
        return f"// Example currently unavailable for `{item_key}`"

    raw_lines = snippet.split('\n')
    processed = [line.replace('client', 'sdk') for line in raw_lines]

    first_index = 0
    while first_index < len(processed) and processed[first_index].strip().startswith('//'):
        first_index += 1

    if first_index >= len(processed):
        result_only = '\n'.join(processed).rstrip()
        if not result_only.endswith(';'):
            result_only += ';'
        return result_only

    first_line = processed[first_index]
    stripped = first_line.lstrip()
    indent = first_line[: len(first_line) - len(stripped)]

    # Check if the example already contains variable declarations or const result
    already_has_declaration = (
        stripped.startswith('const ') or
        stripped.startswith('let ') or
        stripped.startswith('var ') or
        'const result' in snippet
    )

    if not already_has_declaration:
        if stripped.startswith('return '):
            stripped = stripped[len('return ') :].lstrip()
        processed[first_index] = f"{indent}const result = {stripped}"

    joined = '\n'.join(processed).rstrip()
    if not joined.endswith(';'):
        joined += ';'
    return joined


def generate_ai_reference_md(query_defs: dict, transition_defs: dict) -> str:
    identity_sample = TESTNET_TEST_DATA['identity_id']
    contract_sample = TESTNET_TEST_DATA['data_contract_id']

    lines: List[str] = [
        '# Evo SDK - AI Reference',
        '',
        '## Overview',
        'The Evo SDK is a thin TypeScript wrapper around the Dash Platform WASM runtime. '
        'It exposes ergonomic namespaces (identities, documents, contracts, tokens, and more) '
        'optimized for automation and AI-assisted workflows.',
        '',
        '## Quick Setup',
        '```javascript',
        "import { EvoSDK } from '@dashevo/evo-sdk';",
        '',
        '// Create a trusted testnet client and connect',
        'const sdk = EvoSDK.testnetTrusted();',
        'await sdk.connect();',
        '',
        "// Optional: customize connection or enable proofs",
        "// const sdk = new EvoSDK({ network: 'testnet', trusted: true, proofs: true });",
        '```',
        '',
        '## Authentication',
        'Most state transitions require an identity identifier and a signing key in Wallet Import '
        'Format (WIF). Keep credentials secure and never embed production keys in source control:',
        '```javascript',
        f"const identityId = '{identity_sample}';",
        "const privateKeyWif = 'L1ExamplePrivateKeyWifGoesHere';",
        "const assetLockPrivateKeyWif = 'cVExampleAssetLockKeyForIdentityFunding';",
        '```',
        '',
        '## Query Operations',
        '',
        '### Pattern',
        'All queries follow this pattern:',
        '```javascript',
        'const result = await sdk.<namespace>.<method>(params);',
        '```',
        '',
        '### Available Queries',
    ]

    def append_param_section(target: List[str], params: List[dict]) -> None:
        if not params:
            target.append('No parameters required.')
            target.append('')
            return

        target.append('Parameters:')
        for param in params:
            name = param.get('name', 'unknown')
            label = param.get('label')
            display_name = label if label and label != name else name
            param_type = param.get('type', 'text')
            required = 'required' if param.get('required') else 'optional'
            target.append(f"- `{display_name}` ({param_type}, {required})")

            placeholder = param.get('placeholder')
            if placeholder:
                target.append(f"  - Example: `{placeholder}`")

            options = param.get('options') or []
            if options:
                rendered_options: List[str] = []
                for option in options:
                    value = option.get('value')
                    option_label = option.get('label')
                    if value is None:
                        if option_label:
                            rendered_options.append(option_label)
                        continue
                    if option_label and option_label != value:
                        rendered_options.append(f"`{value}` ({option_label})")
                    else:
                        rendered_options.append(f"`{value}`")
                if rendered_options:
                    target.append(f"  - Options: {', '.join(rendered_options)}")

            target.append('')

    def append_query_sections() -> None:
        for cat_key, category in query_defs.items():
            queries = category.get('queries') or {}
            if not queries:
                continue

            lines.append(f"#### {category.get('label', cat_key)}")
            lines.append('')

            for query_key, query in queries.items():
                label = query.get('label', query_key)
                description = query.get('description', 'No description available')
                example_code = evo_example_for_query(query_key, query.get('inputs', []))

                # Use sdk_method field from api-definitions.json if available, otherwise fall back to query_key
                sdk_method = query.get('sdk_method', query_key)

                lines.append(f"**{label}** - `{sdk_method}`")
                lines.append(f"*{description}*")
                lines.append('')

                append_param_section(lines, query.get('inputs', []))

                lines.append('Example:')
                lines.append('```javascript')
                lines.append(format_ai_example_block(example_code, query_key))
                lines.append('```')
                lines.append('')

    append_query_sections()

    lines.extend([
        '## State Transition Operations',
        '',
        '### Pattern',
        'All state transitions require authentication and are invoked with namespace methods:',
        '```javascript',
        'const result = await sdk.<namespace>.<transition>({ ...params, privateKeyWif });',
        '```',
        '',
        '### Available State Transitions',
    ])

    sdk_param_overrides = {
        'identityCreate': {'assetLockProofPrivateKey': 'assetLockPrivateKeyWif'},
        'identityTopUp': {'assetLockProofPrivateKey': 'assetLockPrivateKeyWif'},
    }

    def append_transition_params(
        item_key: str,
        target: List[str],
        params: List[dict],
        uses_sdk_params: bool,
    ) -> None:
        if not params:
            return

        heading = 'Parameters:' if uses_sdk_params else 'Parameters (payload fields):'
        target.append(heading)
        for param in params:
            name = param.get('name', 'unknown')
            label = param.get('label')
            override_name = sdk_param_overrides.get(item_key, {}).get(name)
            effective_name = override_name or name
            display_name = label if label and label != name else effective_name
            param_type = param.get('type', 'text')
            required = 'required' if param.get('required') else 'optional'
            target.append(f"- `{display_name}` ({param_type}, {required})")

            description = param.get('description')
            if description:
                target.append(f"  - {description}")
            elif param.get('placeholder'):
                target.append(f"  - Example: `{param['placeholder']}`")

            options = param.get('options') or []
            if options:
                rendered_options: List[str] = []
                for option in options:
                    value = option.get('value')
                    option_label = option.get('label')
                    if value is None:
                        if option_label:
                            rendered_options.append(option_label)
                        continue
                    if option_label and option_label != value:
                        rendered_options.append(f"`{value}` ({option_label})")
                    else:
                        rendered_options.append(f"`{value}`")
                if rendered_options:
                    target.append(f"  - Options: {', '.join(rendered_options)}")

            target.append('')

    for cat_key, category in transition_defs.items():
        transitions = category.get('transitions') or {}
        if not transitions:
            continue

        lines.append(f"#### {category.get('label', cat_key)}")
        lines.append('')

        for transition_key, transition in transitions.items():
            label = transition.get('label', transition_key)
            description = transition.get('description', 'No description available')
            example_code = transition.get('sdk_example') or evo_example_for_transition(transition_key)
            sdk_params = transition.get('sdk_params') or []
            inputs = transition.get('inputs') or []

            # Use sdk_method field from api-definitions.json if available, otherwise fall back to transition_key
            sdk_method = transition.get('sdk_method', transition_key)

            lines.append(f"**{label}** - `{sdk_method}`")
            lines.append(f"*{description}*")
            lines.append('')

            if sdk_params:
                append_transition_params(transition_key, lines, sdk_params, True)
            elif inputs:
                append_transition_params(transition_key, lines, inputs, False)

            lines.append('Example:')
            lines.append('```javascript')
            lines.append(format_ai_example_block(example_code, transition_key))
            lines.append('```')
            lines.append('')

    lines.extend([
        '## Common Patterns',
        '',
        '### Error Handling',
        '```javascript',
        'try {',
        f"    const identity = await sdk.identities.fetch('{identity_sample}');",
        '    console.log(identity);',
        '} catch (error) {',
        '    console.error(\'Query failed:\', error);',
        '}',
        '```',
        '',
        '### Working with Proofs',
        '```javascript',
        "const sdk = new EvoSDK({ network: 'testnet', trusted: true, proofs: true });",
        'await sdk.connect();',
        '',
        f"const identityWithProof = await sdk.identities.fetchWithProof('{identity_sample}');",
        '```',
        '',
        '### Document Queries with Where/OrderBy',
        '```javascript',
        'const whereClause = JSON.stringify([',
        '    ["normalizedParentDomainName", "==", "dash"],',
        '    ["normalizedLabel", "startsWith", "alice"]',
        ']);',
        '',
        'const orderBy = JSON.stringify([',
        '    ["normalizedLabel", "asc"]',
        ']);',
        '',
        'const documents = await sdk.documents.query({',
        f"    contractId: '{contract_sample}',",
        '    type: "domain",',
        '    where: whereClause,',
        '    orderBy,',
        '    limit: 10',
        '});',
        '```',
        '',
        '### Batch Operations',
        '```javascript',
        'const identityIds = [',
        f"    '{identity_sample}',",
        "    'H72iEt2zG4MEyoh3ZzCEMkYbDWqx1GvK1xHmpM8qH1yL'",
        '];',
        '',
        'const balances = await sdk.identities.balances(identityIds);',
        '```',
        '',
        '## Important Notes',
        '',
        '1. **Network configuration**: Use `EvoSDK.testnetTrusted()` for a ready-to-use testnet client. '
        'When mainnet is available, switch to `EvoSDK.mainnetTrusted()` or instantiate `new EvoSDK({ network: \"mainnet\" })`.',
        '2. **Identity format**: Identity identifiers are Base58-encoded strings. Signing keys are provided as WIF strings.',
        '3. **Credits**: All platform fees are charged in credits (1000 credits = 1 satoshi equivalent). Ensure identities maintain sufficient balance.',
        '4. **Nonces**: Evo SDK facades manage nonces automatically when you submit transitions. Use `sdk.identities.nonce(...)` for manual workflows.',
        '5. **Proofs**: Pass `proofs: true` when constructing `EvoSDK` to validate GroveDB proofs and prefer `*WithProof` helpers.',
        '',
        '## Troubleshooting',
        '',
        '- **Connection errors**: Verify `await sdk.connect()` completes and that your network/trusted options match the target platform.',
        '- **Invalid parameters**: Check that required fields are present and types align with the documented parameter metadata.',
        '- **Authentication failures**: Confirm private keys are correct, funded, and permitted to sign the requested transition.',
        '- **Query errors**: Ensure contract IDs, document types, and field names exist on the network you are querying.',
    ])

    return '\n'.join(lines) + '\n'


def generate_version_info() -> dict:
    """Generate version information for the website."""
    version_info = {}

    # Get SDK version from package.json
    sdk_package_path = NODE_MODULES_DIR / '@dashevo' / 'evo-sdk' / 'package.json'
    if sdk_package_path.exists():
        with open(sdk_package_path, 'r', encoding='utf-8') as f:
            sdk_package = json.load(f)
            version_info['sdkVersion'] = sdk_package.get('version', 'unknown')
    else:
        version_info['sdkVersion'] = 'unknown'

    # Get git commit hash
    try:
        commit_hash = subprocess.run(
            ['git', 'rev-parse', '--short', 'HEAD'],
            capture_output=True, text=True, cwd=REPO_ROOT
        ).stdout.strip()
        version_info['commitHash'] = commit_hash
    except Exception as e:
        print(f'Warning: Could not get git information: {e}')
        version_info['commitHash'] = 'unknown'

    # Add build timestamp
    version_info['buildTime'] = datetime.now(timezone.utc).isoformat()

    return version_info


def main() -> None:
    api_file = PUBLIC_DIR / 'api-definitions.json'
    if not api_file.exists():
        raise SystemExit(f'api-definitions.json not found at {api_file}')

    queries, transitions = load_api_definitions(api_file)

    docs_html = generate_docs_html(queries, transitions)
    (PUBLIC_DIR / 'docs.html').write_text(docs_html, encoding='utf-8')

    ai_md = generate_ai_reference_md(queries, transitions)
    (PUBLIC_DIR / 'AI_REFERENCE.md').write_text(ai_md, encoding='utf-8')

    public_dist = PUBLIC_DIR / 'dist'
    if copy_node_modules_dist('@dashevo/evo-sdk', public_dist):
        print('Copied Evo SDK dist from node_modules into public/dist')
        rewrite_wasm_wrapper(public_dist / 'wasm.js')
    else:
        print('Warning: Evo SDK dist not found; ensure dependencies are installed or build the workspace package.')

    # Generate version info
    version_info = generate_version_info()
    (PUBLIC_DIR / 'version-info.json').write_text(json.dumps(version_info, indent=2), encoding='utf-8')
    print(f'Generated version info: SDK {version_info["sdkVersion"]}, commit {version_info["commitHash"]}')

    manifest = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'source_api': 'api-definitions.json',
        'files': ['docs.html', 'AI_REFERENCE.md', 'version-info.json']
    }
    (PUBLIC_DIR / 'docs_manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print('Generated: docs.html, AI_REFERENCE.md, docs_manifest.json, version-info.json')


if __name__ == '__main__':
    main()
