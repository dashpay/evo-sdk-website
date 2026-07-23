#!/usr/bin/env python3
"""
Check that Evo SDK documentation artifacts are up to date with api-definitions.json
Outputs a documentation-check-report.txt (similar to wasm-sdk checker) and exits non-zero on errors.
"""

from pathlib import Path
from datetime import datetime
import sys
import json
import re
import subprocess
import hashlib

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = REPO_ROOT / 'public'


def main():
    api_file = PUBLIC_DIR / 'api-definitions.json'

    docs_file = PUBLIC_DIR / 'docs.html'
    ai_file = PUBLIC_DIR / 'AI_REFERENCE.md'
    type_reference_file = PUBLIC_DIR / 'TYPE_REFERENCE.md'
    type_reference_html_file = PUBLIC_DIR / 'TYPE_REFERENCE.html'
    manifest_file = PUBLIC_DIR / 'docs_manifest.json'
    catalog_file = PUBLIC_DIR / 'sdk-operation-catalog.json'

    errors = []
    warnings = []

    if not api_file.exists():
        errors.append(f"ERROR: api-definitions.json not found at {api_file}")

    for f in (docs_file, ai_file, type_reference_file, type_reference_html_file, catalog_file, manifest_file):
        if not f.exists():
            errors.append(f"ERROR: Missing {f.name}. Run: python3 scripts/generate_docs.py")

    if not errors and manifest_file.exists():
        try:
            manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
        except Exception as e:
            errors.append(f"ERROR: Invalid docs_manifest.json: {e}")
        else:
            sdk_package_file = REPO_ROOT / 'node_modules' / '@dashevo' / 'evo-sdk' / 'package.json'
            if not sdk_package_file.exists():
                errors.append('ERROR: Installed @dashevo/evo-sdk package metadata not found')
            else:
                sdk_package = json.loads(sdk_package_file.read_text(encoding='utf-8'))
                manifest_sdk = manifest.get('sdk_types', {})
                if manifest_sdk.get('version') != sdk_package.get('version'):
                    errors.append(
                        f"ERROR: Generated return types use SDK {manifest_sdk.get('version')}; "
                        f"installed SDK is {sdk_package.get('version')}"
                    )

            extractor = REPO_ROOT / 'scripts' / 'extract_sdk_types.mjs'
            extracted = subprocess.run(
                ['node', str(extractor), '--api', str(api_file)],
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
            )
            if extracted.returncode != 0:
                errors.append(f'ERROR: SDK return type extraction failed: {extracted.stderr.strip()}')
                metadata = None
            else:
                metadata = json.loads(extracted.stdout)

            if metadata is not None:
                try:
                    catalog = json.loads(catalog_file.read_text(encoding='utf-8'))
                except Exception as e:
                    errors.append(f'ERROR: Invalid sdk-operation-catalog.json: {e}')
                else:
                    if catalog != metadata:
                        errors.append('ERROR: SDK operation catalog differs from installed declarations; run yarn generate')

                expected_operations = len(metadata.get('operations', []))
                expected_methods = len(metadata.get('methods', {}))
                if manifest.get('documented_operations') != expected_operations:
                    errors.append('ERROR: Documentation manifest operation count does not match extracted metadata')
                if manifest.get('resolved_sdk_methods') != expected_methods:
                    errors.append('ERROR: Documentation manifest method count does not match extracted metadata')

                docs_text = docs_file.read_text(encoding='utf-8')
                ai_text = ai_file.read_text(encoding='utf-8')
                if docs_text.count('<div class="returns">') != expected_operations:
                    errors.append(
                        f'ERROR: docs.html must contain return blocks for all {expected_operations} operations'
                    )
                if ai_text.count('\nReturns:\n') != expected_operations:
                    errors.append(
                        f'ERROR: AI_REFERENCE.md must contain return blocks for all {expected_operations} operations'
                    )

            for name, expected_hash in manifest.get('content_sha256', {}).items():
                artifact = PUBLIC_DIR / name
                if not artifact.exists():
                    continue
                actual_hash = hashlib.sha256(artifact.read_bytes()).hexdigest()
                if actual_hash != expected_hash:
                    errors.append(f'ERROR: {name} differs from the generated manifest; run yarn generate')

            if ai_file.exists() and type_reference_file.exists():
                ai_text = ai_file.read_text(encoding='utf-8')
                type_text = type_reference_file.read_text(encoding='utf-8')
                linked_anchors = set(re.findall(r'TYPE_REFERENCE\.md#(type-[a-z0-9-]+)', ai_text))
                declared_anchors = set(re.findall(r'<a id="(type-[a-z0-9-]+)"></a>', type_text))
                missing_anchors = sorted(linked_anchors - declared_anchors)
                if missing_anchors:
                    errors.append(f"ERROR: Missing return type anchors: {', '.join(missing_anchors)}")

            if docs_file.exists() and type_reference_html_file.exists():
                docs_text = docs_file.read_text(encoding='utf-8')
                type_html = type_reference_html_file.read_text(encoding='utf-8')
                linked_anchors = set(re.findall(r'TYPE_REFERENCE\.html#(type-[a-z0-9-]+)', docs_text))
                declared_anchors = set(re.findall(r'id="(type-[a-z0-9-]+)"', type_html))
                missing_anchors = sorted(linked_anchors - declared_anchors)
                if missing_anchors:
                    errors.append(f"ERROR: Missing HTML return type anchors: {', '.join(missing_anchors)}")

    # Guard against pre-v4 privateKeyWif-in-call examples (issue #63).
    if not errors:
        classic_patterns = [
            (
                r'documents\.create\(\{\s*contractId,\s*type:\s*documentType,\s*ownerId,\s*data,\s*entropyHex,\s*privateKeyWif\s*\}',
                'pre-v4 documents.create(... privateKeyWif) example',
            ),
            (
                r'identities\.topUp\(\{\s*identityId,\s*assetLockProof,\s*assetLockPrivateKeyWif\s*\}',
                'pre-v4 identities.topUp(... assetLockPrivateKeyWif) example',
            ),
            (
                r'identities\.create\(\{\s*assetLockProof,\s*assetLockPrivateKeyWif,\s*publicKeys\s*\}',
                'pre-v4 identities.create(... assetLockPrivateKeyWif, publicKeys) example',
            ),
            (
                r'sdk\.<namespace>\.<transition>\(\{\s*\.\.\.params,\s*privateKeyWif\s*\}',
                'pre-v4 state-transition pattern with privateKeyWif in call',
            ),
            (
                r'\bprivateKeyWif\s*:',
                'privateKeyWif object property; use IdentitySigner.addKeyFromWif / PrivateKey.fromWIF',
            ),
        ]
        for label, file_path in (('docs.html', docs_file), ('AI_REFERENCE.md', ai_file)):
            if not file_path.exists():
                continue
            content = file_path.read_text(encoding='utf-8')
            for pattern, description in classic_patterns:
                if re.search(pattern, content):
                    errors.append(f'ERROR: {label} still contains {description}')
            if 'IdentitySigner' not in content:
                errors.append(f'ERROR: {label} is missing IdentitySigner usage expected for v4 write examples')

    # Compose report

    lines = [
        '=' * 80,
        'Evo SDK Documentation Check',
        '=' * 80,
        f'Timestamp: {datetime.now().isoformat()}',
        ''
    ]
    if not errors and not warnings:
        lines.append('✅ All documentation is up to date!')
    else:
        if warnings:
            lines.append(f'⚠️  {len(warnings)} warnings found:\n')
            lines.extend(warnings)
            lines.append('')
        if errors:
            lines.append(f'❌ {len(errors)} errors found:\n')
            lines.extend(errors)
            lines.append('')
    lines.append('=' * 80)
    if errors:
        lines.append('\nTo fix these errors, run: python3 scripts/generate_docs.py')

    report = '\n'.join(lines)
    print(report)

    # Avoid timestamp-only churn in git: keep the previous report when the
    # status body is unchanged, rewriting only when warnings/errors change.
    report_path = PUBLIC_DIR / 'documentation-check-report.txt'
    previous = report_path.read_text(encoding='utf-8') if report_path.exists() else ''

    def body_without_timestamp(text: str) -> str:
        return re.sub(r'^Timestamp:.*$', 'Timestamp:', text, count=1, flags=re.M)

    if body_without_timestamp(previous) != body_without_timestamp(report):
        report_path.write_text(report, encoding='utf-8')

    sys.exit(1 if errors else 0)

if __name__ == '__main__':
    main()
