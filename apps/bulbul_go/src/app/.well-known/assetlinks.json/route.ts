// Android App Links для go.bulbul.asia. package_name — applicationId релиза,
// sha256 — отпечаток подписи релизного ключа.
export const dynamic = 'force-static'

const ASSET_LINKS = [
    {
        relation: [
            'delegate_permission/common.handle_all_urls',
            'delegate_permission/common.get_login_creds',
        ],
        target: {
            namespace: 'android_app',
            package_name: 'com.bakasov.bulbul_go',
            sha256_cert_fingerprints: [
                '0F:2F:F0:5C:C2:F8:42:59:F7:EA:D9:A5:73:BA:86:38:51:69:49:78:51:80:C6:CB:17:A4:F7:F0:23:FA:21:98',
            ],
        },
    },
]

export function GET() {
    return Response.json(ASSET_LINKS)
}
